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
  ClassDeclaration,
  Module,
  TsType,
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
import {
  DynamicFormParserConfig,
  IDynamicFormParser,
  IWasmCompiler,
} from '~core/parsers/commons';

import { parseClassPropertyDecorators } from './dynamic-form-decorators';

const parserOptions = {
  syntax: 'typescript' as const,
  decorators: true,
  comments: true,
  isModule: true,
};

export class DynamicFormParser implements IDynamicFormParser {
  models: Record<string, FormDefinition> = {};

  enums: Record<string, string[]> = {};

  config: DynamicFormParserConfig;

  compiler: Compiler | IWasmCompiler;

  constructor(
    config: DynamicFormParserConfig = {
      formSchemaTypeDefinitionsFile: './schema.ts',
    },
    compiler: Compiler | typeof WasmCompiler
  ) {
    this.compiler = compiler;
    this.config = config;
  }

  TsKeywordType = this.tsKeywordTypeToForm.bind(this);
  TsArrayType = this.tsArrayTypeToForm.bind(this);
  TsTypeReference = this.tsTypeReferenceToForm.bind(this);

  extractFieldParams(param: TsType) {
    if (param.type !== 'TsLiteralType') {
      return null;
    }
    const paramType = param as TsLiteralType;
    const literalType = paramType.literal as NumericLiteral | StringLiteral;
    return literalType.value;
  }

  extractPropertyType(param: TsType, propertyName: string) {
    const { type } = param;

    const getFormDefinition =
      // @ts-expect-error
      (this[type] as (type: TsType, propertyName?: string) => FormField) ??
      (() => null);

    return getFormDefinition(param, propertyName);
  }

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

      const propertyType = this.extractPropertyType(
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

  classDeclarationToForm(classDeclaration: ClassDeclaration) {
    const formName = classDeclaration.identifier.value;

    const form: Record<string, FormField> = {};

    classDeclaration.body.forEach((member) => {
      if (member.type === 'ClassProperty') {
        const propertyName =
          member.key.type === 'Identifier' ? member.key.value : null;

        if (!propertyName) {
          return;
        }

        const { isOptional, typeAnnotation } = member;

        if (!typeAnnotation) {
          return;
        }

        const propertyType = this.extractPropertyType(
          typeAnnotation.typeAnnotation,
          propertyName
        );

        if (!propertyType) {
          return;
        }

        const propertyDecorators = parseClassPropertyDecorators(member);

        form[propertyName] = {
          ...propertyType,
          required: !isOptional,
          ...propertyDecorators,
        };
      }
    });

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

  isServerSideCompiler() {
    return 'parseFile' in this.compiler;
  }

  async parseInline(inlineCode: string) {
    const res = this.isServerSideCompiler()
      ? await (this.compiler as Compiler).parse(inlineCode, parserOptions)
      : await (this.compiler as IWasmCompiler).parse(inlineCode, parserOptions);

    return this.parseModule(res);
  }

  async parse() {
    if (!this.isServerSideCompiler()) {
      return;
    }

    const ast = await (this.compiler as Compiler).parseFile(
      this.config.formSchemaTypeDefinitionsFile!,
      parserOptions
    );

    return this.parseModule(ast);
  }

  async parseModule(ast: Module | WasmCompiler.Module) {
    // Grab all types within export declarations
    const exportDeclarations = ast.body
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

    let enums = ast.body.filter(
      (node) => node.type === 'TsEnumDeclaration'
    ) as TsEnumDeclaration[];

    enums = [
      ...enums,
      exportDeclarations.filter(
        (node) => node.type === 'TsEnumDeclaration'
      ) as TsEnumDeclaration[],
    ].flat();

    enums.forEach(this.parseEnum.bind(this));

    const searchWindow = [...exportDeclarations, ...ast.body];

    const classDeclarations = searchWindow.filter(
      (node) => node.type === 'ClassDeclaration'
    ) as ClassDeclaration[];

    classDeclarations.forEach(this.classDeclarationToForm.bind(this));

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
