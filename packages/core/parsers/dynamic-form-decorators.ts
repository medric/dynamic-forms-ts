import {
  ClassProperty,
  StringLiteral,
  NumericLiteral,
  BooleanLiteral,
  Decorator,
} from '@swc/core';
import { FormField, FormFieldType, ValidatorType } from '../types';

function MinLength(min: number) {}

function MaxLength(max: number) {}

function Required() {}

function Min(min: number) {}

function Max(max: number) {}

function Pattern(pattern: string) {}

function IsEmail() {}

function IsURL() {}

function Label(label: string) {}

function Message(message: string) {}

export const validationDecorators = {
  Min,
  Max,
  MinLength,
  MaxLength,
  Pattern,
  Message,
};

export const propertyTypeDecorators = {
  IsEmail,
  IsURL,
};

export const formFieldDecorators = {
  Required,
  Label,
};

const validationDecoratorsToValidatorTypes = {
  Min: 'min',
  Max: 'max',
  MinLength: 'minLength',
  MaxLength: 'maxLength',
  Pattern: 'pattern',
  Message: 'message',
};

const propertyTypeDecoratorsToFormFieldTypes = {
  IsEmail: 'email',
  IsURL: 'url',
};

const formFieldDecoratorsToFormFieldProps = {
  Required: 'required',
  Label: 'label',
};

type FormFieldPropType = {
  [key: string]: string | number | boolean;
};

const parseSingleParamDecorator = (
  decorator: Decorator
): (Partial<FormField> & { rest: FormFieldPropType }) | null => {
  const decoratorType = decorator.expression.type;

  const validators = {} as FormField['validators'];
  const rest = {} as FormFieldPropType;
  let type: FormFieldType | undefined;

  if (decoratorType === 'CallExpression') {
    const callExpression = decorator.expression;

    if (callExpression.callee.type === 'Identifier') {
      const decoratorName = callExpression.callee.value;

      // @todo - refactor when decoreators can have multiple arguments
      const argExpression = callExpression.arguments?.[0]?.expression as
        | StringLiteral
        | NumericLiteral
        | BooleanLiteral;
      if (
        !argExpression ||
        !['NumericLiteral', 'StringLiteral', 'BooleanLiteral'].includes(
          argExpression.type
        )
      ) {
        return null;
      }

      if (Object.keys(validationDecorators).includes(decoratorName)) {
        const validatorType = validationDecoratorsToValidatorTypes[
          decoratorName as keyof typeof validationDecorators
        ] as ValidatorType;
        validators![validatorType] = argExpression.value as string | number;
      } else if (
        Object.keys(propertyTypeDecoratorsToFormFieldTypes).includes(
          decoratorName
        )
      ) {
        type = decoratorType as FormFieldType;
      } else if (
        Object.keys(formFieldDecoratorsToFormFieldProps).includes(decoratorName)
      ) {
        const formFieldProp =
          formFieldDecoratorsToFormFieldProps[
            decoratorName as keyof typeof formFieldDecoratorsToFormFieldProps
          ];
        const field = formFieldProp as keyof Pick<
          FormField,
          'required' | 'label'
        >;
        rest[field] = argExpression.value;
      }
    }

    return { type, validators, rest };
  }

  return null;
};

export function parseClassPropertyDecorators(
  classProperty: ClassProperty
): Partial<FormField> {
  const { decorators } = classProperty;

  if (!decorators) {
    return {};
  }

  let validators = {} as FormField['validators'];
  let rest = {} as FormFieldPropType;
  let type: FormFieldType | undefined;

  decorators.forEach((decorator) => {
    const parsedDecorator = parseSingleParamDecorator(decorator);

    if (parsedDecorator) {
      validators = { ...validators, ...parsedDecorator.validators };
      rest = { ...rest, ...parsedDecorator.rest };
      type = (parsedDecorator.type as FormFieldType) || type;
    }
  });

  if (!type) {
    return { validators, ...rest };
  }

  return { type, validators, ...rest };
}
