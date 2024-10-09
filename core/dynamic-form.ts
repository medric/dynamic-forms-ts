import * as swc from '@swc/core';

import { FormDefinition, FormField, FormFieldType } from './types';
import { capitalizeFirstLetter, compose, singularize } from './utils';

class DynamicForm {
  forms: Record<string, FormDefinition> = {};

  enums: Record<string, string[]> = {};

  constructor() {
    this.parse();
  }

  TsKeywordType = this.tsKeywordTypeToForm.bind(this);
  TsArrayType = this.tsArrayTypeToForm.bind(this);
  TsTypeReference = this.tsTypeReferenceToForm.bind(this);

  tsKeywordTypeToForm(type: swc.TsKeywordType): FormField {
    return { type: type.kind };
  }

  tsArrayTypeToForm(type: swc.TsArrayType, propertyName: string = ''): FormField {
    const elementType = type.elemType.type;

    let formType: string | FormField = 'unknown';

    if (elementType === 'TsTypeReference') {
      formType = this.tsTypeReferenceToForm(type.elemType as swc.TsTypeReference).type;
    }
    
    if (elementType === 'TsKeywordType') {
      formType = `${this.tsKeywordTypeToForm(type.elemType as swc.TsKeywordType)}`;
    }

    if (elementType === 'TsArrayType') {
      formType = this.tsArrayTypeToForm(type.elemType as swc.TsArrayType);
    }

    if (elementType === 'TsTypeLiteral') {
      const norm = compose(capitalizeFirstLetter, singularize);
      const inferredName = norm(propertyName) ?? `Inferred${Object.keys(this.forms).length}`;
      const form = this.tsLiteralTypeToForm(type.elemType as swc.TsTypeLiteral);

      this.forms[inferredName] = form;
      
      formType = inferredName;
    }

    return { type: 'array', ref: formType };
  }

  tsTypeReferenceToForm(type: swc.TsTypeReference): FormField {
    if (type.typeName.type !== 'Identifier') {
      return { type: 'unknown' };
    }

    const isEnum = this.enums[type.typeName.value] !== undefined;

    if (isEnum) {
      return { type: 'enum', ref: type.typeName.value };
    }

    return { type: 'object', ref: type.typeName.type };
  }

  tsLiteralTypeToForm(literal: swc.TsTypeLiteral): FormDefinition  {
    const record: FormDefinition = {};
    literal.members.forEach((member) => {
      const struct = member.type === 'TsPropertySignature' ? member : null;

      console.log(struct)

      if (!struct) {
        return;
      }

      const propertyName = struct.key.type === 'Identifier' ? struct.key.value : null;

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

      // @ts-expect-error
      const getFormDefinition = this[typeAnnotation.typeAnnotation.type] as (type: swc.TsType, propertyName?: string) => FormField ?? (() => null);

      const propertyType = getFormDefinition(typeAnnotation.typeAnnotation, propertyName);

      if (!propertyType) {
        return;
      }

      record[propertyName] = propertyType;
    });

    return record;
  }

  typeDeclarationToForm(typeDeclaration: swc.TsTypeAliasDeclaration) {
    const formName = typeDeclaration.id.type === 'Identifier' ? typeDeclaration.id.value : null;

    const isTypeLiteral = typeDeclaration.typeAnnotation.type === 'TsTypeLiteral';

    if (!isTypeLiteral || !formName) {
      return {};
    }

    const literal = typeDeclaration.typeAnnotation as swc.TsTypeLiteral;

    const form = this.tsLiteralTypeToForm(literal);

    this.forms[formName] = form;
  }

  parseEnum(enumDeclaration: swc.TsEnumDeclaration) {
    const enumName = enumDeclaration.id.type === 'Identifier' ? enumDeclaration.id.value : null;

    if (!enumName) {
      return;
    }

    const enumValues = enumDeclaration.members.map((member) => {
      return member.id.type === 'Identifier' ? member.id.value : null;
    }).filter((value) => value !== null);

    this.enums[enumName] = enumValues;
  }

  async parse(filename: string = './schema.ts') {
    const res = await swc.parseFile(filename, {
      // @todo: Add into config
      syntax: 'typescript',
      target: 'es2020',
    });

    const enums = res.body.filter((node) => node.type === 'TsEnumDeclaration');

    enums.forEach((enumDeclaration) => {
      this.parseEnum(enumDeclaration);
    });

    const typesDeclarations = res.body.filter((node) => node.type === 'TsTypeAliasDeclaration');

    if (!typesDeclarations) {
      throw new Error('No types declarations found');
    }

    typesDeclarations.forEach((typeDeclaration) => {
      this.typeDeclarationToForm(typeDeclaration);
    });

    // console.log(this.forms)
  }

  render() {
    // TODO: Implement render method
  }
}

const form = new DynamicForm();
