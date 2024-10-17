import * as swc from '@swc/core';
import { resolve } from 'path';
import { DynamicFormNodeParser } from '../dynamic-form-node-parser';
import { DynamicFormParser } from '../dynamic-form-parser';

describe('DynamicForm', () => {
  let dynamicFormNodeParser: DynamicFormNodeParser;

  beforeEach(() => {
    dynamicFormNodeParser = new DynamicFormNodeParser({
      formSchemaTypeDefinitionsFile: resolve(__dirname, './test-schema.ts'),
    });
  });

  describe('tsKeywordTypeToForm', () => {
    it('should return the correct form field for a keyword type', () => {
      const keywordType: swc.TsKeywordType = {
        type: 'TsKeywordType',
        kind: 'string',
        span: { start: 0, end: 0, ctxt: 0 },
      };
      const result = dynamicFormNodeParser.tsKeywordTypeToForm(keywordType);
      expect(result).toEqual({ type: 'string' });
    });
  });

  describe('tsArrayTypeToForm', () => {
    it('should return the correct form field for an array type', () => {
      const arrayType: swc.TsArrayType = {
        type: 'TsArrayType',
        elemType: {
          type: 'TsKeywordType',
          kind: 'string',
          span: { start: 0, end: 0, ctxt: 0 },
        },
        span: { start: 0, end: 0, ctxt: 0 },
      };
      const result = dynamicFormNodeParser.tsArrayTypeToForm(arrayType);
      expect(result).toEqual({ type: 'array', ref: 'string' });
    });
  });

  describe('tsTypeReferenceToForm', () => {
    it('should return the correct form field for a type reference', () => {
      dynamicFormNodeParser.enums = { MyEnum: ['VALUE1', 'VALUE2'] };
      const typeReference: swc.TsTypeReference = {
        type: 'TsTypeReference',
        typeName: {
          type: 'Identifier',
          value: 'MyEnum',
          span: { start: 0, end: 0, ctxt: 0 },
          optional: false,
        },
        span: { start: 0, end: 0, ctxt: 0 },
      };
      const result = dynamicFormNodeParser.tsTypeReferenceToForm(typeReference);
      expect(result).toEqual({ type: 'enum', ref: 'MyEnum' });
    });
  });

  describe('tsTypeLiteralToForm', () => {
    it('should return the correct form definition for a type literal', () => {
      const typeLiteral: swc.TsTypeLiteral = {
        type: 'TsTypeLiteral',
        members: [
          {
            type: 'TsPropertySignature',
            key: {
              type: 'Identifier',
              value: 'property1',
              span: { start: 0, end: 0, ctxt: 0 },
              optional: false,
            },
            typeAnnotation: {
              type: 'TsTypeAnnotation',
              typeAnnotation: {
                type: 'TsKeywordType',
                kind: 'string',
                span: { start: 0, end: 0, ctxt: 0 },
              },
              span: { start: 0, end: 0, ctxt: 0 },
            },
            readonly: false,
            computed: false,
            optional: false,
            params: [],
            span: { start: 0, end: 0, ctxt: 0 },
          },
        ],
        span: { start: 0, end: 0, ctxt: 0 },
      };
      const result = dynamicFormNodeParser.tsTypeLiteralToForm(typeLiteral);
      expect(result).toEqual({ property1: { type: 'string', required: true } });
    });
  });

  describe('typeDeclarationToForm', () => {
    it('should convert a type declaration to a form definition', () => {
      const typeDeclaration: swc.TsTypeAliasDeclaration = {
        type: 'TsTypeAliasDeclaration',
        id: {
          type: 'Identifier',
          value: 'MyType',
          span: { start: 0, end: 0, ctxt: 0 },
          optional: false,
        },
        typeAnnotation: {
          type: 'TsTypeLiteral',
          members: [
            {
              type: 'TsPropertySignature',
              key: {
                type: 'Identifier',
                value: 'property1',
                span: { start: 0, end: 0, ctxt: 0 },
                optional: false,
              },
              typeAnnotation: {
                type: 'TsTypeAnnotation',
                typeAnnotation: {
                  type: 'TsKeywordType',
                  kind: 'string',
                  span: { start: 0, end: 0, ctxt: 0 },
                },
                span: { start: 0, end: 0, ctxt: 0 },
              },
              readonly: false,
              computed: false,
              optional: false,
              params: [],
              span: { start: 0, end: 0, ctxt: 0 },
            },
          ],
          span: { start: 0, end: 0, ctxt: 0 },
        },
        declare: false,
        span: { start: 0, end: 0, ctxt: 0 },
      };
      dynamicFormNodeParser.typeDeclarationToForm(typeDeclaration);
      expect(dynamicFormNodeParser.models).toEqual({
        MyType: { property1: { type: 'string', required: true } },
      });
    });
  });

  describe('parseEnum', () => {
    it('should parse an enum declaration', () => {
      const enumDeclaration: swc.TsEnumDeclaration = {
        type: 'TsEnumDeclaration',
        id: {
          type: 'Identifier',
          value: 'MyEnum',
          optional: false,
          span: { start: 0, end: 0, ctxt: 0 },
        },
        members: [
          {
            id: { type: 'Identifier', value: 'VALUE1' },
            type: 'TsEnumMember',
            span: { start: 0, end: 0, ctxt: 0 },
          },
          {
            id: { type: 'Identifier', value: 'VALUE2' },
            type: 'TsEnumMember',
            span: { start: 0, end: 0, ctxt: 0 },
          },
        ],
        declare: false,
        isConst: false,
        span: { start: 0, end: 0, ctxt: 0 },
      } as swc.TsEnumDeclaration & {
        declare: boolean;
        isConst: boolean;
        span: { start: number; end: number; ctxt: number };
      };
      dynamicFormNodeParser.parseEnum(enumDeclaration);
      expect(dynamicFormNodeParser.enums).toEqual({
        MyEnum: ['VALUE1', 'VALUE2'],
      });
    });
  });

  describe('parse', () => {
    it('should parse the file and return models and enums', async () => {
      const result = await dynamicFormNodeParser.parse();
      expect(result).toEqual({
        models: {
          MyType: {
            property1: {
              type: 'string',
              required: true,
              validators: {
                maxLength: 20,
                minLength: 10,
              },
            },
          },
        },
        enums: { MyEnum: ['VALUE1', 'VALUE2'] },
      });
    });
  });
});
