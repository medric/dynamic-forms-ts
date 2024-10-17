import { Compiler } from '@swc/core';
import { DynamicFormParserConfig } from '~core/parsers/commons';

import { DynamicFormParser } from './dynamic-form-parser';

export class DynamicFormNodeParser extends DynamicFormParser {
  constructor(
    config: DynamicFormParserConfig = {
      formSchemaTypeDefinitionsFile: './schema.ts',
    }
  ) {
    super(config, new Compiler());
  }
}
