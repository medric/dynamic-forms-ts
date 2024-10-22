import { FC } from 'react';
import { DynamicForm } from '~ui/dynamic-form';
import { FormSchema } from '~core/types';

type FormPreviewProps = {
  formSchema: FormSchema | null;
  modelKey: string;
  compilationError: string | null;
};

export const FormPreview: FC<FormPreviewProps> = ({
  formSchema,
  modelKey,
  compilationError,
}) => {
  const showForm = formSchema && !compilationError;
  return (
    <div className="flex-1 flex flex-col gap-3">
      <h3 className="text-left">Form preview</h3>
      <div className="border border-slate-400 p-2 overflow-scroll h-full">
        {compilationError && (
          <div className="text-red-500">{compilationError}</div>
        )}
        {showForm && (
          <DynamicForm model={modelKey} formSchema={formSchema} title="" />
        )}
      </div>
    </div>
  );
};
