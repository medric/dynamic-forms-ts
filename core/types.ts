export type FormFieldType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum' | 'union' | 'literal' | 'unknown' | 'bigint' | 'symbol' | 'undefined' | 'any' | 'void' | 'null' | 'never' | 'function' | 'interface' | 'type' | 'class' | 'intrinsic'


export type FormField = {
  type: FormFieldType;
  ref?: string | FormField;
}

export type DfOptions = {
  _df: 'disabled';
}

export interface FormDefinition {
  [key: string]: FormField
}

