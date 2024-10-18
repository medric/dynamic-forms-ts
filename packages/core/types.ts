export type FormFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'enum'
  | 'union'
  | 'literal'
  | 'unknown'
  | 'bigint'
  | 'symbol'
  | 'undefined'
  | 'any'
  | 'void'
  | 'null'
  | 'never'
  | 'function'
  | 'interface'
  | 'type'
  | 'class'
  | 'intrinsic'
  | 'email'
  | 'url';

export type FormFieldTypeParsed =
  | string
  | number
  | boolean
  | object
  | any[]
  | null
  | undefined
  | void
  | never
  | Function;

export type ValidatorType =
  | 'min'
  | 'max'
  | 'maxLength'
  | 'minLength'
  | 'pattern'
  | 'message';

type ValidatorRule = string | number | boolean;

export type InlineFormRef = Record<string, FormFieldType>;

export type FormField = {
  type: FormFieldType | FormFieldTypeParsed;
  ref?: string | FormField | InlineFormRef;
  required?: boolean;
  label?: string;
  validators?: Partial<Record<ValidatorType, ValidatorRule>>;
};

export interface FormDefinition {
  [key: string]: FormField;
}

export type FormSchema = {
  models: Record<string, FormDefinition>;
  enums: Record<string, string[]>;
};

export type FormFieldPropType = {
  [key: string]: string | number | boolean;
};

export type DecoratorParserReturnType = {
  validators?: FormField['validators'];
  rest?: FormFieldPropType;
  type?: FormFieldType;
} | null;

export {
  IsEmail,
  IsUrl,
  Label,
  Length,
  Max,
  MaxLength,
  Message,
  Min,
  MinLength,
  Pattern,
  Required,
} from './parsers/commons';
