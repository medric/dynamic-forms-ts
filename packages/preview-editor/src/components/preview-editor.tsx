import { useState, useCallback, useEffect } from 'react';
import initSwc from '@swc/wasm-web';

import { DynamicForm } from '~renderers/dynamic-form';
import { FormSchema } from '~core/types';
import { DynamicFormWasmParser } from '~core/parsers/swc/dynamic-form-wasm-parser';

import '~renderers/styles/dynamic-form.css';

import { ModelsList } from './models-list';
import { FormEditor } from './form-editor';
import { FormPreview } from './form-preview';

const parser = new DynamicFormWasmParser();

export function PreviewEditor() {
  const [initialized, setInitialized] = useState(false);
  const [value, setValue] = useState('');
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const onChange = useCallback((val: string) => {
    setValue(val);
  }, []);

  useEffect(() => {
    async function importAndRunSwcOnMount() {
      try {
        await initSwc();
        setInitialized(true);
      } catch (err) {
        console.error('Failed to load SWC wasm:', err);
      }
    }
    importAndRunSwcOnMount();
  }, []);

  function compile() {
    if (!initialized) {
      return;
    }
    parser
      .parseInline(value)
      .then((schema) => {
        setFormSchema(schema);
        setCompilationError(null);
      })
      .catch((err) => {
        setCompilationError(err.toString());
        console.warn('Failed to parse code:', err.toString());
      });
  }

  const modelKey = selectedModel ?? Object.keys(formSchema?.models ?? {})[0];

  return (
    <div className="container m-auto  p-4">
      <div className="flex sm:flex-row flex-col gap-6 h-[80vh]">
        <FormEditor
          value={value}
          onChange={onChange}
          initialized={initialized}
          compile={compile}
        />

        <ModelsList
          models={formSchema?.models ?? {}}
          setSelectedModel={setSelectedModel}
        />

        <FormPreview
          formSchema={formSchema}
          modelKey={modelKey}
          compilationError={compilationError}
        />
      </div>
    </div>
  );
}
