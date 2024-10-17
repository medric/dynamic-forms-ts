import { useState, useCallback, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
// import debounce from 'lodash.debounce';

import { DynamicForm, useDynamicForm } from '~renderers/dynamic-form';
import { FormSchema } from '~core/types';
import { DynamicFormWasmParser } from '~core/parsers/swc/dynamic-form-wasm-parser';

import '~renderers/styles/dynamic-form.css';

import initSwc from '@swc/wasm-web';

const parser = new DynamicFormWasmParser();

export function PreviewEditor() {
  const [initialized, setInitialized] = useState(false);
  const [liveReload, _setLiveReload] = useState(false);
  const [value, setValue] = useState('');
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const dynamicFormContext = useDynamicForm();

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

  // useEffect(() => {
  //   if (liveReload) {
  //     debouncedCompile();
  //   }
  // }, [value, liveReload]);

  function compile() {
    if (!initialized) {
      return;
    }
    parser
      .parseInline(value)
      .then((schema) => {
        setFormSchema(schema);
      })
      .catch((err) => {
        console.warn('Failed to parse code:', err);
      });
  }

  // const debouncedCompile = useMemo(() => debounce(compile, 500), [compile]);

  // const hasModels = Object.keys(formSchema?.models ?? {}).length > 0;
  const modelKey = selectedModel ?? Object.keys(formSchema?.models ?? {})[0];

  // @todo: display error/warning messages for compilation errors
  return (
    <div className="flex flex-row gap-6">
      <div className="overflow-hidden flex flex-col gap-3 basis-1/5">
        <h3 className="text-left">Models</h3>
        <div className="border border-slate-400 h-[80vh] p-2 overflow-scroll">
          {Object.keys(formSchema?.models ?? {}).map((modelKey) => (
            <button
              key={modelKey}
              className="m-2"
              onClick={() => {
                dynamicFormContext.formMethods.clearErrors?.();
                setSelectedModel(modelKey);
              }}
            >
              {modelKey}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col gap-3">
        <h3 className="text-left">Input</h3>
        {/* @todo: re-instate when models selection is implemented */}
        {/* <form id="controls" className="flex flex-row items-center gap-3">
            <label htmlFor="liveReload" className="flex items-center">
              <input
                name="liveReload"
                type="checkbox"
                checked={liveReload}
                onClick={() => setLiveReload(!liveReload)}
                readOnly
              />
            </label>
            <span className="inline-block">Live reload</span> 
          </form> */}
        <CodeMirror
          value={value}
          height="80vh"
          extensions={[
            javascript({ typescript: true }), // Enable TypeScript support
          ]}
          onChange={onChange}
          style={{
            textAlign: 'left',
            border: '1px solid #e5e5e5',
          }}
        />
        {!liveReload && (
          <button
            className="m-2"
            onClick={compile}
            disabled={!initialized}
            data-testid="compile-button"
          >
            Compile
          </button>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <h3 className="text-left">Form preview</h3>
        <div className="border border-slate-400 h-[80vh] p-2 overflow-scroll">
          {formSchema && (
            <DynamicForm model={modelKey} formSchema={formSchema} title="" />
          )}
        </div>
      </div>
    </div>
  );
}
