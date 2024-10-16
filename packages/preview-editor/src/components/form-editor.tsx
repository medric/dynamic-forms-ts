import { FC } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

type FormEditorProps = {
  initialized: boolean;
  value: string;
  onChange: (val: string) => void;
  setParser: (parser: 'swc' | 'tsc') => void;
  parser: 'swc' | 'tsc';
  compile: () => void;
};

export const FormEditor: FC<FormEditorProps> = ({
  initialized,
  value,
  parser,
  compile,
  onChange,
  setParser,
}) => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-3">
      <h3 className="text-left">Input</h3>
      <CodeMirror
        value={value}
        height="100%"
        extensions={[
          javascript({ typescript: true }), // Enable TypeScript support
        ]}
        onChange={onChange}
        style={{
          textAlign: 'left',
          flexGrow: 1,
          border: '1px solid rgb(148 163 184)',
        }}
      />
      <div className="mt-auto border border-slate-300 p-2 flex justify-between items-center">
        <button
          className="m-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          onClick={compile}
          disabled={!initialized}
          data-testid="compile-button"
        >
          Compile
        </button>
        <div className="flex items-center">
          <span className="mr-2">Parser:</span>
          <button
            className={`m-2 p-2 rounded ${parser === 'swc' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setParser('swc')}
          >
            SWC
          </button>
          <button
            className={`m-2 p-2 rounded ${parser === 'tsc' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setParser('tsc')}
          >
            TSC
          </button>
        </div>
      </div>
    </div>
  );
};
