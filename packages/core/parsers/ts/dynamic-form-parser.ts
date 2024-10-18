import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import * as ts from 'typescript';

import pluralize from 'pluralize';

import type {
  FormDefinition,
  FormField,
  FormFieldType,
  InlineFormRef,
} from '~core/types';
import {
  DynamicFormParserConfig,
  IDynamicFormParser,
} from '~core/parsers/commons';
import { parseCommentDecorators } from './dynamic-form-decorators';
import { capitalizeFirstLetter, compose } from '../../../utils/utils';

export class DynamicFormParser implements IDynamicFormParser {
  models: Record<string, FormDefinition> = {};

  enums: Record<string, string[]> = {};

  config: DynamicFormParserConfig;

  compiler: typeof ts;

  ast: ts.SourceFile;

  constructor(
    config: DynamicFormParserConfig = {
      formSchemaTypeDefinitionsFile: resolve(__dirname, './schema.ts'),
    },
    compiler: typeof ts = ts
  ) {
    if (!existsSync(config.formSchemaTypeDefinitionsFile!)) {
      throw new Error(
        `File not found: ${config.formSchemaTypeDefinitionsFile}`
      );
    }

    this.config = config;
    this.ast = compiler.createSourceFile(
      config.formSchemaTypeDefinitionsFile!,
      readFileSync(config.formSchemaTypeDefinitionsFile!).toString(),
      compiler.ScriptTarget.Latest,
      /*setParentNodes */ true
    );

    this.compiler = compiler;
  }

  [ts.SyntaxKind.StringKeyword] = this.tsKeywordTypeToForm.bind(this, 'string');
  [ts.SyntaxKind.NumberKeyword] = this.tsKeywordTypeToForm.bind(this, 'number');
  [ts.SyntaxKind.BooleanKeyword] = this.tsKeywordTypeToForm.bind(
    this,
    'boolean'
  );
  [ts.SyntaxKind.ArrayType] = this.tsArrayTypeToForm.bind(this);
  [ts.SyntaxKind.TypeReference] = this.tsTypeReferenceToForm.bind(this);

  // extractFieldParams(param: TsType) {
  //   if (param.type !== 'TsLiteralType') {
  //     return null;
  //   }
  //   const paramType = param as TsLiteralType;
  //   const literalType = paramType.literal as NumericLiteral | StringLiteral;
  //   return literalType.value;
  // }

  isKeywordTypeNode(node: ts.Node): boolean {
    return (
      node.kind === ts.SyntaxKind.StringKeyword ||
      node.kind === ts.SyntaxKind.NumberKeyword ||
      node.kind === ts.SyntaxKind.BooleanKeyword ||
      node.kind === ts.SyntaxKind.VoidKeyword ||
      node.kind === ts.SyntaxKind.AnyKeyword ||
      node.kind === ts.SyntaxKind.UnknownKeyword ||
      node.kind === ts.SyntaxKind.UndefinedKeyword ||
      node.kind === ts.SyntaxKind.NullKeyword ||
      node.kind === ts.SyntaxKind.NeverKeyword
    );
  }

  extractPropertyType(param: ts.PropertySignature, propertyName: string) {
    const { type } = param;

    if (!type) {
      return null;
    }

    const getFormDefinition =
      // @ts-expect-error
      (this[type.kind] as (
        type: ts.TypeNode,
        propertyName?: string
      ) => FormField) ?? (() => null);

    const formField = getFormDefinition(type, propertyName);

    return {
      ...formField,
      // Augment the form field with validation decorators
      ...this.parseValidationDecorators(param),
    };
  }

  tsKeywordTypeToForm(type: string): FormField {
    return { type };
  }

  tsArrayTypeToForm(
    type: ts.ArrayTypeNode,
    propertyName: string = ''
  ): FormField {
    let formType: string | FormField | InlineFormRef = '';

    if (this.compiler.isTypeReferenceNode(type.elementType)) {
      const ref = this.tsTypeReferenceToForm(type.elementType);
      formType = ref.ref ?? (ref.type as FormFieldType);
    }

    if (this.isKeywordTypeNode(type.elementType)) {
      formType = this.tsKeywordTypeToForm(type.elementType.getFullText())
        .type as string;
    }

    if (this.compiler.isArrayTypeNode(type.elementType)) {
      formType = this.tsArrayTypeToForm(type.elementType, propertyName);
    }

    if (this.compiler.isTypeLiteralNode(type.elementType)) {
      const norm = compose(capitalizeFirstLetter, pluralize.singular);
      const inferredName =
        norm(propertyName) ?? `Inferred${Object.keys(this.models).length}`;
      const form = this.tsTypeLiteralToForm(type.elementType);

      this.models[inferredName] = form;

      formType = inferredName;
    }

    return { type: 'array', ref: formType };
  }

  tsTypeReferenceToForm(type: ts.TypeReferenceNode): FormField {
    const typeName = type.typeName.getText();

    const isEnum = this.enums[typeName] !== undefined;

    if (isEnum) {
      return { type: 'enum', ref: typeName };
    }

    // @ts-expect-error
    const typeResolver = this[typeName] as
      | ((type: ts.TypeReferenceNode) => FormField)
      | undefined;

    if (typeResolver) {
      return typeResolver(type);
    }

    return { type: 'object', ref: typeName };
  }

  tsTypeLiteralToForm(literal: ts.TypeLiteralNode): FormDefinition {
    const record: FormDefinition = {};
    literal.members.forEach((member) => {
      if (!ts.isPropertySignature(member)) {
        return;
      }

      const propertyName = member.name.getText();

      if (!propertyName) {
        return;
      }

      const isOptional = member.questionToken !== undefined;

      if (!propertyName) {
        return;
      }

      const propertyType = this.extractPropertyType(member, propertyName);

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

  typeDeclarationToForm(typeDeclaration: ts.TypeAliasDeclaration) {
    const formName = typeDeclaration.name.getText();

    const isTypeLiteral = this.compiler.isTypeLiteralNode(typeDeclaration.type);

    if (!isTypeLiteral || !formName) {
      return {};
    }

    const literal = typeDeclaration.type as ts.TypeLiteralNode;

    const form = this.tsTypeLiteralToForm(literal);

    this.models[formName] = form;
  }

  // @todo
  classDeclarationToForm(_classDeclaration: ts.ClassDeclaration) {}

  parseEnum(enumDeclaration: ts.EnumDeclaration) {
    const enumName = enumDeclaration.name.text;

    const enumValues = enumDeclaration.members.map((member) => {
      if (!member.initializer) {
        return null;
      }
      return member.initializer.getText();
    });

    this.enums[enumName] = enumValues.filter(
      (value): value is string => value !== null
    );
  }

  async parse() {
    this.compiler.forEachChild(this.ast, (node) => {
      if (this.compiler.isTypeAliasDeclaration(node)) {
        this.typeDeclarationToForm(node);
      }

      if (this.compiler.isClassDeclaration(node)) {
        // @todo: Implement class parsing - use the swc compiler-based parser for now
        // this.classDeclarationToForm(node);
      }

      if (this.compiler.isEnumDeclaration(node)) {
        this.parseEnum(node);
      }
    });
  }

  getLeadingComments(node: ts.Node) {
    const commentTexts: string[] = [];

    const leadingCommentsRanges = this.compiler.getLeadingCommentRanges(
      this.ast.getFullText(),
      node.getFullStart()
    );
    if (leadingCommentsRanges) {
      leadingCommentsRanges.forEach((commentRange) => {
        const comment = this.ast.text.substring(
          commentRange.pos,
          commentRange.end
        );
        commentTexts.push(comment);
      });
    }

    const commentString = commentTexts.join('\n');

    return commentString;
  }

  parseValidationDecorators(node: ts.Node): Partial<FormField> {
    const comment = this.getLeadingComments(node);

    if (!comment) {
      return {};
    }

    return parseCommentDecorators(comment);
  }

  getFormSchema() {
    return {
      models: this.models,
      enums: this.enums,
    };
  }
}
