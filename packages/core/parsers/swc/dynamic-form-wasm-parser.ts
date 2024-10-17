import * as swc from '@swc/wasm-web';
import { DynamicFormParser } from './dynamic-form-parser';

export class DynamicFormWasmParser extends DynamicFormParser {
  constructor() {
    super({}, swc);
  }
}
