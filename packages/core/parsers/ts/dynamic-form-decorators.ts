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

export type DecoratorNode = {
  name: string;
  args: (number | string | boolean)[];
};

const parseSingleParamDecorator = (
  decoratorNode: DecoratorNode
): DecoratorParserReturnType => {
  const validators = {} as FormField['validators'];
  const rest = {} as FormFieldPropType;
  let type: FormFieldType | undefined;

  const decoratorName = decoratorNode.name;
  const argValue = decoratorNode.args[0];

  const isLiteral = typeof argValue === 'string' || 'number' || 'boolean';

  if (!isLiteral) {
    return null;
  }

  if (Object.keys(validationDecorators).includes(decoratorName)) {
    const validatorType = validationDecoratorsToValidatorTypes[
      decoratorName as keyof typeof validationDecorators
    ] as ValidatorType;
    validators![validatorType] = argValue as string;
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
    rest[field] = argValue;
  }

  return { type, validators, rest };
};

const parseIsEmailDecorator = (
  _decoratorNode: DecoratorNode
): DecoratorParserReturnType => {
  return {
    type: 'email',
  };
};

const parseIsUrlDecorator = (
  _decoratorNode: DecoratorNode
): DecoratorParserReturnType => {
  return {
    type: 'url',
  };
};

const parseLengthDecorator = (
  decoratorNode: DecoratorNode
): DecoratorParserReturnType => {
  const { args } = decoratorNode;

  const [min, max] = args as [number, number];

  return {
    validators: {
      minLength: min,
      maxLength: max,
    },
  };
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

export function parseCommentDecorators(comment: string): Partial<FormField> {
  const lines = comment.split('\n');
  const decorators: DecoratorNode[] = [];

  lines.forEach((line) => {
    // Trim the line to remove extra spaces and comment symbols
    line = line.replace(/\/\//, '').replace(/\*/, '').trim();

    // Check if the line starts with an '@' which signifies a decorator
    if (line.startsWith('@')) {
      // Split the decorator into name and arguments
      const openParenIndex = line.indexOf('(');
      const closeParenIndex = line.indexOf(')');

      if (openParenIndex !== -1 && closeParenIndex !== -1) {
        const decoratorName = line.substring(1, openParenIndex);
        const decoratorArgs = line
          .substring(openParenIndex + 1, closeParenIndex)
          .split(',')
          .map((arg) => JSON.parse(arg.trim()));

        decorators.push({ name: decoratorName, args: decoratorArgs });
      }
    }
  });

  let validators = {} as FormField['validators'];
  let rest = {} as FormFieldPropType;
  let type: FormFieldType | undefined;

  // Convert to form field
  decorators.forEach((decorator) => {
    const parser =
      decoratorNameToParser[
        decorator.name as keyof typeof decoratorNameToParser
      ];

    if (parser) {
      const parsed = parser(decorator);

      if (parsed) {
        validators = { ...validators, ...parsed.validators };
        rest = { ...rest, ...parsed.rest };
        type = type || parsed.type;
      }
    }
  });

  if (!type) {
    return {
      validators,
      ...rest,
    };
  }

  return { type, validators, ...rest };
}
