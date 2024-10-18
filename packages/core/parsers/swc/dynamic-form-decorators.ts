import {
  ClassProperty,
  StringLiteral,
  NumericLiteral,
  BooleanLiteral,
  CallExpression,
} from '@swc/core';
import {
  DecoratorParserReturnType,
  FormField,
  FormFieldPropType,
  FormFieldType,
  ValidatorType,
} from '~core/types';

import {
  formFieldDecoratorsToFormFieldProps,
  propertyTypeDecoratorsToFormFieldTypes,
  validationDecorators,
  validationDecoratorsToValidatorTypes,
} from '~core/parsers/commons';

const parseSingleParamDecorator = (
  callExpression: CallExpression
): DecoratorParserReturnType => {
  const validators = {} as FormField['validators'];
  const rest = {} as FormFieldPropType;
  let type: FormFieldType | undefined;

  if (callExpression.callee.type !== 'Identifier') {
    return null;
  }

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
    Object.keys(propertyTypeDecoratorsToFormFieldTypes).includes(decoratorName)
  ) {
    type = propertyTypeDecoratorsToFormFieldTypes[
      decoratorName as keyof typeof propertyTypeDecoratorsToFormFieldTypes
    ] as FormFieldType;
  } else if (
    Object.keys(formFieldDecoratorsToFormFieldProps).includes(decoratorName)
  ) {
    const formFieldProp =
      formFieldDecoratorsToFormFieldProps[
        decoratorName as keyof typeof formFieldDecoratorsToFormFieldProps
      ];
    const field = formFieldProp as keyof Pick<FormField, 'required' | 'label'>;
    rest[field] = argExpression.value;
  }

  return { type, validators, rest };
};

const parseIsEmailDecorator = (
  _callExpression: CallExpression
): DecoratorParserReturnType => {
  return {
    type: 'email',
  };
};

const parseIsUrlDecorator = (
  _callExpression: CallExpression
): DecoratorParserReturnType => {
  return {
    type: 'url',
  };
};

const parseLengthDecorator = (
  callExpression: CallExpression
): DecoratorParserReturnType => {
  const { arguments: args, callee } = callExpression;
  if (callee.type !== 'Identifier') {
    return null;
  }

  if (callee.value === 'Length') {
    const argExpressions = args.map((arg) => arg.expression) as [
      NumericLiteral,
      NumericLiteral,
    ];
    const [min, max] = argExpressions.map((arg) => arg.value);
    return {
      validators: {
        minLength: min,
        maxLength: max,
      },
    };
  }

  return {};
};

const decoratorNameToParser = {
  IsEmail: parseIsEmailDecorator,
  IsUrl: parseIsUrlDecorator,
  Label: parseSingleParamDecorator,
  Length: parseLengthDecorator,
  Max: parseSingleParamDecorator,
  Message: parseSingleParamDecorator,
  Min: parseSingleParamDecorator,
  MinLength: parseSingleParamDecorator,
  MaxLength: parseSingleParamDecorator,
  Pattern: parseSingleParamDecorator,
  Required: parseSingleParamDecorator,
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
    const { expression: callExpression } = decorator;
    if (callExpression.type !== 'CallExpression') {
      return;
    }
    const { callee } = callExpression;

    if (callee.type !== 'Identifier') {
      return null;
    }

    const decoratorParser =
      decoratorNameToParser[callee.value as keyof typeof decoratorNameToParser];

    const parsedDecorator = decoratorParser?.(callExpression);

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
