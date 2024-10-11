import * as swc from '@swc/core';
import pluralize from 'pluralize';

import { FormDefinition, FormField, FormFieldType } from './types';
import { capitalizeFirstLetter, compose } from '../utils/utils';

type DynamicFormParserConfig = {
  filename: string;
};

export class DynamicFormParser {
  models: Record<string, FormDefinition> = {};

  enums: Record<string, string[]> = {};

  config: DynamicFormParserConfig;

  constructor(config: DynamicFormParserConfig = { filename: './schema.ts' }) {
    this.config = config;
  }

  TsKeywordType = this.tsKeywordTypeToForm.bind(this);
  TsArrayType = this.tsArrayTypeToForm.bind(this);
  TsTypeReference = this.tsTypeReferenceToForm.bind(this);

  // Custom types resolvers
  FieldString = this.tsFieldStringToForm.bind(this);
  FieldEmail = this.tsFieldEmailToForm.bind(this);
  FieldNumber = this.tsFieldNumberToForm.bind(this);

  tsKeywordTypeToForm(type: swc.TsKeywordType): FormField {
    return { type: type.kind };
  }

  tsArrayTypeToForm(
    type: swc.TsArrayType,
    propertyName: string = ''
  ): FormField {
    const elementType = type.elemType.type;

    let formType: string | FormField = 'unknown';

    if (elementType === 'TsTypeReference') {
      const ref = this.tsTypeReferenceToForm(
        type.elemType as swc.TsTypeReference
      );
      formType = ref.ref ?? (ref.type as FormFieldType);
    }

    if (elementType === 'TsKeywordType') {
      formType = `${this.tsKeywordTypeToForm(type.elemType as swc.TsKeywordType).type}`;
    }

    if (elementType === 'TsArrayType') {
      formType = this.tsArrayTypeToForm(type.elemType as swc.TsArrayType);
    }

    if (elementType === 'TsTypeLiteral') {
      const norm = compose(capitalizeFirstLetter, pluralize.singular);
      const inferredName =
        norm(propertyName) ?? `Inferred${Object.keys(this.models).length}`;
      const form = this.tsLiteralTypeToForm(type.elemType as swc.TsTypeLiteral);

      this.models[inferredName] = form;

      formType = inferredName;
    }

    return { type: 'array', ref: formType };
  }

  tsFieldNumberToForm(type: swc.TsTypeReference): FormField {
    const [min, max, message, label] = type.typeParams?.params.map((param) => {
      if (param.type !== 'TsLiteralType') {
        return null;
      }
      const paramType = param as swc.TsLiteralType;
      const literalType = paramType.literal as
        | swc.NumericLiteral
        | swc.StringLiteral;
      return literalType.value;
    }) as [number, number, string, string];

    return { type: 'number', label, validators: { min, max, message } };
  }

  tsFieldStringToForm(type: swc.TsTypeReference): FormField {
    const [minLength, maxLength, pattern, message, label] =
      type.typeParams?.params.map((param) => {
        if (param.type !== 'TsLiteralType') {
          return null;
        }
        const paramType = param as swc.TsLiteralType;
        const literalType = paramType.literal as
          | swc.NumericLiteral
          | swc.StringLiteral;
        return literalType.value;
      }) as [number, number, string, string, string];

    return {
      type: 'string',
      label,
      validators: { minLength, maxLength, pattern, message },
    };
  }

  tsFieldEmailToForm(type: swc.TsTypeReference): FormField {
    const [message, label] = type.typeParams?.params.map((param) => {
      if (param.type !== 'TsLiteralType') {
        return null;
      }
      const paramType = param as swc.TsLiteralType;
      const literalType = paramType.literal as
        | swc.NumericLiteral
        | swc.StringLiteral;
      return literalType.value;
    }) as [string, string];

    return { type: 'email', label, validators: { message } };
  }

  tsTypeReferenceToForm(type: swc.TsTypeReference): FormField {
    if (type.typeName.type !== 'Identifier') {
      return { type: 'unknown' };
    }

    const isEnum = this.enums[type.typeName.value] !== undefined;

    const typeName = type.typeName.value;

    if (isEnum) {
      return { type: 'enum', ref: typeName };
    }

    // @ts-expect-error
    const typeResolver = this[typeName] as
      | ((type: swc.TsTypeReference) => FormField)
      | undefined;

    if (typeResolver) {
      return typeResolver(type);
    }

    return { type: 'object', ref: typeName };
  }

  tsLiteralTypeToForm(literal: swc.TsTypeLiteral): FormDefinition {
    const record: FormDefinition = {};
    literal.members.forEach((member) => {
      const struct = member.type === 'TsPropertySignature' ? member : null;

      if (!struct) {
        return;
      }

      const propertyName =
        struct.key.type === 'Identifier' ? struct.key.value : null;

      const isOptional = struct.optional ?? false;

      if (!propertyName) {
        return;
      }

      if (!struct.typeAnnotation) {
        return;
      }

      const { typeAnnotation } = struct;

      if (!typeAnnotation) {
        return;
      }

      const { type } = typeAnnotation.typeAnnotation;

      const getFormDefinition =
        // @ts-expect-error
        (this[type] as (
          type: swc.TsType,
          propertyName?: string
        ) => FormField) ?? (() => null);

      const propertyType = getFormDefinition(
        typeAnnotation.typeAnnotation,
        propertyName
      );

      if (!propertyType) {
        return;
      }

      record[propertyName] = {
        ...propertyType,
        required: !isOptional,
      };
    });

    return record;
  }

  typeDeclarationToForm(typeDeclaration: swc.TsTypeAliasDeclaration) {
    const formName =
      typeDeclaration.id.type === 'Identifier'
        ? typeDeclaration.id.value
        : null;

    const isTypeLiteral =
      typeDeclaration.typeAnnotation.type === 'TsTypeLiteral';

    if (!isTypeLiteral || !formName) {
      return {};
    }

    const literal = typeDeclaration.typeAnnotation as swc.TsTypeLiteral;

    const form = this.tsLiteralTypeToForm(literal);

    this.models[formName] = form;
  }

  parseEnum(enumDeclaration: swc.TsEnumDeclaration) {
    const enumName =
      enumDeclaration.id.type === 'Identifier'
        ? enumDeclaration.id.value
        : null;

    if (!enumName) {
      return;
    }

    const enumValues = enumDeclaration.members
      .map((member) => {
        return member.id.type === 'Identifier' ? member.id.value : null;
      })
      .filter((value) => value !== null);

    this.enums[enumName] = enumValues;
  }

  fromClass<C extends new (...args: []) => any>(constructor: C) {
    const instance = new constructor();
    const properties = Object.keys(instance);

    const form: Record<string, FormField> = properties.reduce(
      (acc, property) => {
        const value = instance[property];
        let formField: FormField;

        if (typeof value === 'string') {
          formField = { type: 'string' };
        } else if (typeof value === 'number') {
          formField = { type: 'number' };
        } else if (typeof value === 'boolean') {
          formField = { type: 'boolean' };
        } else if (Array.isArray(value)) {
          const elementType = typeof value[0];
          const ref =
            elementType === 'object' ? value[0].constructor.name : elementType;
          formField = { type: 'array', ref };
        } else if (typeof value === 'object') {
          formField = { type: 'object', ref: value.constructor.name };
        } else {
          formField = { type: 'unknown' };
        }

        acc[property] = formField;
        return acc;
      },
      {} as Record<string, FormField>
    );

    this.models[constructor.name] = form;
  }

  async parse() {
    const res = await swc.parseFile(this.config.filename, {
      // @todo: Add into config
      syntax: 'typescript',
      target: 'es2020',
    });

    const enums = res.body.filter((node) => node.type === 'TsEnumDeclaration');

    enums.forEach((enumDeclaration) => {
      this.parseEnum(enumDeclaration);
    });

    const typesDeclarations = res.body.filter(
      (node) => node.type === 'TsTypeAliasDeclaration'
    );

    if (!typesDeclarations) {
      throw new Error('No types declarations found');
    }

    typesDeclarations.forEach((typeDeclaration) => {
      this.typeDeclarationToForm(typeDeclaration);
    });

    return {
      models: this.models,
      enums: this.enums,
    };
  }

  getFormSchema() {
    return {
      models: this.models,
      enums: this.enums,
    };
  }
}
