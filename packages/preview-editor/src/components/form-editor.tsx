import { FC } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

type FormEditorProps = {
  initialized: boolean;
  value: string;
  onChange: (val: string) => void;
  compile: () => void;
};

export const FormEditor: FC<FormEditorProps> = ({
  initialized,
  value,
  compile,
  onChange,
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
      <div className="mt-auto border border-slate-300">
        <button
          className="m-2"
          onClick={compile}
          disabled={!initialized}
          data-testid="compile-button"
        >
          Compile
        </button>
      </div>
    </div>
  );
};
