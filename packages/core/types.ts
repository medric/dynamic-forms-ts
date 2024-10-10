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
  | 'intrinsic';

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

export type FormField = {
  type: FormFieldType | FormFieldTypeParsed;
  ref?: string | FormField;
};

export type DfOptions = {
  _df: 'disabled';
};

export interface FormDefinition {
  [key: string]: FormField;
}

export type FormSchema = {
  models: Record<string, FormDefinition>;
  enums: Record<string, string[]>;
};
