import { Compiler } from '@swc/core';
import {
  DynamicFormParser,
  DynamicFormParserConfig,
} from './dynamic-form-parser';

export class DynamicFormNodeParser extends DynamicFormParser {
  constructor(config: DynamicFormParserConfig = { filename: './schema.ts' }) {
    super(config, new Compiler());
  }
}
