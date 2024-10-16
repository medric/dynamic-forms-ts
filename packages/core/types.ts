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

type ValidatorRule = string | number;

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

export type StringField<
  MinLength = number,
  MaxLength = number,
  Pattern = string,
  Message = string,
  Label = string,
> = string;

export type NumberField<
  Min = number,
  Max = number,
  Message = string,
  Label = string,
> = number;

export type EmailField<Message = string, Label = string> = string;

export type StructField<Struct, Message = string, Label = string> = Struct;
