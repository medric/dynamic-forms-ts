import type {
  Compiler,
  TsKeywordType,
  TsArrayType,
  NumericLiteral,
  StringLiteral,
  TsEnumDeclaration,
  TsLiteralType,
  TsTypeAliasDeclaration,
  TsTypeLiteral,
  TsTypeReference,
} from '@swc/core';

import * as WasmCompiler from '@swc/wasm-web';

import pluralize from 'pluralize';

import type {
  FormDefinition,
  FormField,
  FormFieldType,
  InlineFormRef,
} from '~core/types';
import { capitalizeFirstLetter, compose } from '~utils/utils';

export type DynamicFormParserConfig = {
  filename?: string;
};

type IWasmCompiler = typeof WasmCompiler;

export class DynamicFormParser {
  models: Record<string, FormDefinition> = {};

  enums: Record<string, string[]> = {};

  config: DynamicFormParserConfig;

  compiler: Compiler | IWasmCompiler;

  constructor(
    config: DynamicFormParserConfig = { filename: './schema.ts' },
    compiler: Compiler | typeof WasmCompiler
  ) {
    this.compiler = compiler;
    this.config = config;
  }

  TsKeywordType = this.tsKeywordTypeToForm.bind(this);
  TsArrayType = this.tsArrayTypeToForm.bind(this);
  TsTypeReference = this.tsTypeReferenceToForm.bind(this);

  // Custom types resolvers
  StringField = this.tsStringFieldToForm.bind(this);
  EmailField = this.tsEmailFieldToForm.bind(this);
  NumberField = this.tsNumberFieldToForm.bind(this);
  StructField = this.tsStructFieldToForm.bind(this);

  tsKeywordTypeToForm(type: TsKeywordType): FormField {
    return { type: type.kind };
  }

  tsArrayTypeToForm(type: TsArrayType, propertyName: string = ''): FormField {
    const elementType = type.elemType.type;

    let formType: string | FormField | InlineFormRef = '';

    if (elementType === 'TsTypeReference') {
      const ref = this.tsTypeReferenceToForm(type.elemType as TsTypeReference);
      formType = ref.ref ?? (ref.type as FormFieldType);
    }

    if (elementType === 'TsKeywordType') {
      formType = `${this.tsKeywordTypeToForm(type.elemType as TsKeywordType).type}`;
    }

    if (elementType === 'TsArrayType') {
      formType = this.tsArrayTypeToForm(
        type.elemType as TsArrayType,
        propertyName
      );
    }

    if (elementType === 'TsTypeLiteral') {
      const norm = compose(capitalizeFirstLetter, pluralize.singular);
      const inferredName =
        norm(propertyName) ?? `Inferred${Object.keys(this.models).length}`;
      const form = this.tsTypeLiteralToForm(type.elemType as TsTypeLiteral);

      this.models[inferredName] = form;

      formType = inferredName;
    }

    return { type: 'array', ref: formType };
  }

  tsNumberFieldToForm(type: TsTypeReference): FormField {
    const params = type.typeParams?.params;
    if (!params) {
      return { type: 'number' };
    }
    const [min, max, message, label] = type.typeParams?.params?.map((param) => {
      if (param.type !== 'TsLiteralType') {
        return null;
      }
      const paramType = param as TsLiteralType;
      const literalType = paramType.literal as NumericLiteral | StringLiteral;
      return literalType.value;
    }) as [number, number, string, string];

    return { type: 'number', label, validators: { min, max, message } };
  }

  tsStringFieldToForm(type: TsTypeReference): FormField {
    const params = type.typeParams?.params;
    if (!params) {
      return { type: 'string' };
    }
    const [minLength, maxLength, pattern, message, label] =
      type.typeParams?.params?.map((param) => {
        if (param.type !== 'TsLiteralType') {
          return null;
        }
        const paramType = param as TsLiteralType;
        const literalType = paramType.literal as NumericLiteral | StringLiteral;
        return literalType.value;
      }) as [number, number, string, string, string];

    return {
      type: 'string',
      label,
      validators: { minLength, maxLength, pattern, message },
    };
  }

  tsStructFieldToForm(type: TsTypeReference): FormField {
    const params = type.typeParams?.params;
    if (!params) {
      return { type: 'object' };
    }
    const [struct, message, label] = type.typeParams?.params?.map((param) => {
      if (param.type === 'TsTypeLiteral') {
        return this.tsTypeLiteralToForm(param as TsTypeLiteral);
      }
      const paramType = param as TsLiteralType;
      const literalType = paramType.literal as NumericLiteral | StringLiteral;
      return literalType.value;
    }) as [InlineFormRef, string, string];

    return { type: 'object', ref: struct, label, validators: { message } };
  }

  tsEmailFieldToForm(type: TsTypeReference): FormField {
    const params = type.typeParams?.params;
    if (!params) {
      return { type: 'email' };
    }
    const [message, label] = type.typeParams?.params?.map((param) => {
      if (param.type !== 'TsLiteralType') {
        return null;
      }
      const paramType = param as TsLiteralType;
      const literalType = paramType.literal as NumericLiteral | StringLiteral;
      return literalType.value;
    }) as [string, string];

    return { type: 'email', label, validators: { message } };
  }

  tsTypeReferenceToForm(type: TsTypeReference): FormField {
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
      | ((type: TsTypeReference) => FormField)
      | undefined;

    if (typeResolver) {
      return typeResolver(type);
    }

    return { type: 'object', ref: typeName };
  }

  tsTypeLiteralToForm(literal: TsTypeLiteral): FormDefinition {
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
        (this[type] as (type: TsType, propertyName?: string) => FormField) ??
        (() => null);

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

  typeDeclarationToForm(typeDeclaration: TsTypeAliasDeclaration) {
    const formName =
      typeDeclaration.id.type === 'Identifier'
        ? typeDeclaration.id.value
        : null;

    const isTypeLiteral =
      typeDeclaration.typeAnnotation.type === 'TsTypeLiteral';

    if (!isTypeLiteral || !formName) {
      return {};
    }

    const literal = typeDeclaration.typeAnnotation as TsTypeLiteral;

    const form = this.tsTypeLiteralToForm(literal);

    this.models[formName] = form;
  }

  parseEnum(enumDeclaration: TsEnumDeclaration) {
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

    this.enums[enumName] = enumValues.filter(
      (value): value is string => value !== null
    );
  }

  fromClass<C extends new (...args: []) => any>(constructor: C) {
    const instance = new constructor();
    const properties = Object.keys(instance);

    // @todo -> handle validation
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

  async parse(inlineCode?: string) {
    let res;

    if ('parseFile' in this.compiler) {
      res = inlineCode
        ? await this.compiler.parse(inlineCode, {
            syntax: 'typescript',
          })
        : await this.compiler.parseFile(this.config.filename!, {
            syntax: 'typescript',
          });
    } else {
      res = await this.compiler.parse(inlineCode!, {
        syntax: 'typescript',
      });
    }

    // Grab all types within export declarations
    const exportDeclarations = res.body
      .filter((node) => node.type === 'ExportDeclaration')
      .map((node) => {
        if (node.type === 'ExportDeclaration' && node.declaration) {
          return node.declaration;
        }
        return null;
      })
      .filter(
        (node): node is TsTypeAliasDeclaration | TsEnumDeclaration =>
          node !== null
      );

    let enums = res.body.filter(
      (node) => node.type === 'TsEnumDeclaration'
    ) as TsEnumDeclaration[];

    enums = [
      ...enums,
      exportDeclarations.filter(
        (node) => node.type === 'TsEnumDeclaration'
      ) as TsEnumDeclaration[],
    ].flat();

    enums.forEach(this.parseEnum.bind(this));

    // Merge export declarations with the rest of the body
    const searchWindow = [...exportDeclarations, ...res.body];

    const typeDeclarations = searchWindow.filter(
      (node) => node.type === 'TsTypeAliasDeclaration'
    ) as TsTypeAliasDeclaration[];
    if (typeDeclarations.length === 0) {
      console.warn('No type declarations found');
    }

    typeDeclarations.forEach(this.typeDeclarationToForm.bind(this));

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
