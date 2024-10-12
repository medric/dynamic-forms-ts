import { useState, useCallback, useEffect, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import debounce from 'lodash.debounce';
import { autocompletion } from '@codemirror/autocomplete';

import { DynamicForm } from '~renderers/dynamic-form';
import { FormSchema, serializedTypes } from '~core/types';
import { DynamicFormWasmParser } from '~core/parsers/dynamic-form-wasm-parser';

import '~renderers/styles/dynamic-form.css';

import initSwc from '@swc/wasm-web';

const parser = new DynamicFormWasmParser();

export function PreviewEditor() {
  const [initialized, setInitialized] = useState(false);
  const [liveReload, setLiveReload] = useState(false);
  const [value, setValue] = useState(serializedTypes);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);

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

  useEffect(() => {
    if (liveReload) {
      console.log('Live reload enabled');
      debouncedCompile();
    }
  }, [value, liveReload]);

  function compile() {
    if (!initialized) {
      return;
    }
    parser
      .parse(value)
      .then((schema) => {
        setFormSchema(schema);
      })
      .catch((err) => {
        console.warn('Failed to parse code:', err);
      });
  }

  const debouncedCompile = useMemo(() => debounce(compile, 500), [compile]);

  return (
    <>
      <div className="flex flex-row gap-6">
        <div className="flex-1 overflow-hidden">
          <h3>Preview editor</h3>
          <form id="controls" className="flex flex-row items-center gap-3">
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
          </form>
          <CodeMirror
            value={value}
            height="80vh"
            width=""
            extensions={[javascript({ typescript: true }), autocompletion()]}
            onChange={onChange}
            style={{
              textAlign: 'left',
            }}
          />
          {!liveReload && (
            <button className="m-2" onClick={compile}>
              Compile
            </button>
          )}
        </div>
        <div className="flex-1">
          <h3>Form</h3>
          <div className="border border-slate-400 h-[80vh] mt-2 p-2">
            {formSchema && (
              <DynamicForm model="User" formSchema={formSchema} title="" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
