import { FC } from 'react';
import { useDynamicForm } from '~renderers/dynamic-form';

type ModelsListProps = {
  models: Record<string, any>;
  setSelectedModel: (modelKey: string) => void;
};

export const ModelsList: FC<ModelsListProps> = ({
  models,
  setSelectedModel,
}) => {
  const dynamicFormContext = useDynamicForm();

  return (
    <div className="overflow-hidden flex flex-col gap-3 basis-1/5">
      <h3 className="text-left">Models</h3>
      <div className="border border-slate-400 p-2 overflow-scroll h-full">
        {Object.keys(models ?? {}).map((modelKey) => (
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
  );
};
