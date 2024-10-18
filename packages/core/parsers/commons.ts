import { Compiler } from '@swc/core';
import * as ts from 'typescript';
import * as WasmCompiler from '@swc/wasm-web';

import { FormDefinition } from '~core/types';
import 'reflect-metadata';

export function MinLength(min: number) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('MinLength', min, target, propertyKey);
  };
}

export function MaxLength(max: number) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('MaxLength', max, target, propertyKey);
  };
}

export function Length(min: number, max: number) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('Length', { min, max }, target, propertyKey);
  };
}

export function Required() {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('Required', true, target, propertyKey);
  };
}

export function Min(min: number) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('Min', min, target, propertyKey);
  };
}

export function Max(max: number) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('Max', max, target, propertyKey);
  };
}

export function Pattern(pattern: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('Pattern', pattern, target, propertyKey);
  };
}

export function IsEmail() {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('IsEmail', true, target, propertyKey);
  };
}

export function IsUrl() {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('IsUrl', true, target, propertyKey);
  };
}

export function Label(label: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('Label', label, target, propertyKey);
  };
}

export function Message(message: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('Message', message, target, propertyKey);
  };
}

export const validationDecorators = {
  Min,
  Max,
  MinLength,
  MaxLength,
  Length,
  Pattern,
  Message,
};

export const validationDecoratorsToValidatorTypes = {
  Min: 'min',
  Max: 'max',
  MinLength: 'minLength',
  MaxLength: 'maxLength',
  Length: 'length',
  Pattern: 'pattern',
  Message: 'message',
};

export const propertyTypeDecoratorsToFormFieldTypes = {
  IsEmail: 'email',
  IsUrl: 'url',
};

export const formFieldDecoratorsToFormFieldProps = {
  Required: 'required',
  Label: 'label',
};

export type DynamicFormParserConfig = {
  formSchemaTypeDefinitionsFile?: string;
};

export type IWasmCompiler = typeof WasmCompiler;

export interface IDynamicFormParser {
  models: Record<string, FormDefinition>;

  enums: Record<string, string[]>;

  config: DynamicFormParserConfig;

  compiler: typeof ts | Compiler | IWasmCompiler;

  parse(): void;
}
