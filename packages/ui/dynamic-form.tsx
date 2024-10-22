import React, {
  useMemo,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  useForm,
  SubmitHandler,
  FieldValues,
  Path,
  UseFormRegister,
  FormState,
  useFormContext,
  FormProvider,
  UseFormReturn,
} from 'react-hook-form';
import { nanoid } from 'nanoid';
import classNames from 'classnames';
import { FormField, FormSchema, InlineFormRef } from '~core/types';
import { emailPattern, URLPattern } from '~utils/validation';

export const DEFAULT_INPUT_ERROR_MESSAGE = 'Please enter a valid value';

type DynamicFormContextType = {
  formMethods: Partial<UseFormReturn<FieldValues>>;
  setFormMethods: React.Dispatch<
    React.SetStateAction<Partial<UseFormReturn<FieldValues>>>
  >;
};

const defaultDynamicFormContextValue = {
  formMethods: {} as UseFormReturn<FieldValues>,
  setFormMethods: () => {},
};

export const DynamicFormContext = createContext<DynamicFormContextType>(
  defaultDynamicFormContextValue
);

export const useDynamicForm = () => {
  const context = useContext(DynamicFormContext);
  if (context === undefined) {
    throw new Error('useDynamicForm must be used within a DynamicFormProvider');
  }
  return context;
};

export const applyValidators = (value: FormField) => {
  let updatedValidators = { ...value.validators };

  switch (value.type) {
    case 'email':
      updatedValidators = {
        ...updatedValidators,
        pattern: emailPattern,
        message: 'Please enter a valid email address',
      };
      break;
    case 'url':
      updatedValidators = {
        ...updatedValidators,
        pattern: URLPattern,
        message: 'Please enter a valid URL',
      };
      break;
    // Add more cases here for other types
    default:
      break;
  }

  return {
    ...value,
    validators: updatedValidators,
  };
};

type DynamicFormProviderProps = {
  children: React.ReactNode;
};

export const DynamicFormProvider: React.FC<DynamicFormProviderProps> = ({
  children,
}) => {
  const [formMethods, setFormMethods] = useState(
    {} as Partial<UseFormReturn<FieldValues>>
  );
  return (
    <DynamicFormContext.Provider
      value={{
        formMethods,
        setFormMethods,
      }}
    >
      {children}
    </DynamicFormContext.Provider>
  );
};

interface SchemaRendererProps {
  model: string | InlineFormRef;
  formSchema: FormSchema;
  level: number;
  parentField: string;
  renderLabel?: (key: string) => React.ReactNode;
  renderInput?: (
    key: string,
    type: FormField['type'],
    register: UseFormRegister<FieldValues>,
    formState: FormState<FieldValues>
  ) => React.ReactNode;
}

const SchemaRenderer = React.memo(function SchemaRenderer({
  model,
  formSchema,
  level,
  parentField,
  renderLabel,
  renderInput,
}: SchemaRendererProps) {
  return (
    <div>
      <h4 className="inner-form-title">{parentField}</h4>
      <DynamicForm
        model={model}
        formSchema={formSchema}
        level={level + 1}
        parentKey={parentField}
        renderLabel={renderLabel}
        renderInput={renderInput}
      />
    </div>
  );
});

interface EnumRendererProps<IFormInput extends FieldValues> {
  enumValues: string[];
  field: Path<IFormInput>;
  register: UseFormRegister<FieldValues>;
  renderLabel?: (key: string) => React.ReactNode;
}

const EnumRenderer = React.memo(function EnumRenderer<
  IFormInput extends FieldValues,
>({ enumValues, field, register, renderLabel }: EnumRendererProps<IFormInput>) {
  return (
    <div>
      {renderLabel ? (
        renderLabel(field)
      ) : (
        <label htmlFor={field}>{field}</label>
      )}
      <select {...register(field)}>
        {enumValues.map((enumKey: string) => (
          <option key={enumKey} value={enumKey}>
            {enumKey}
          </option>
        ))}
      </select>
    </div>
  );
});

interface DynamicFormProps<IFormInput extends FieldValues> {
  model: keyof FormSchema['models'] | InlineFormRef;
  formSchema: FormSchema;
  level?: number;
  parentKey?: string;
  title?: string;
  className?: string;
  onSubmit?: SubmitHandler<IFormInput>;
  renderLabel?: (key: string) => React.ReactNode;
  renderInput?: (
    key: string,
    type: FormField['type'],
    register: UseFormRegister<FieldValues>,
    formState: FormState<FieldValues>
  ) => React.ReactNode;
}

export function DynamicForm<IFormInput extends FieldValues>({
  model,
  formSchema,
  level = 0,
  parentKey = '',
  title,
  className,
  onSubmit,
  renderLabel,
  renderInput,
}: DynamicFormProps<IFormInput>) {
  const formContext = useFormContext();
  // If formContext is provided, use it, otherwise create a new form - this is because forms are recursive for now
  const formMethods = formContext || useForm<IFormInput>();

  const { register, handleSubmit, formState, clearErrors } = formMethods;

  const dynamicFormContext = useDynamicForm();

  const { errors } = formState;

  useEffect(() => {
    dynamicFormContext.setFormMethods({
      clearErrors,
    });
  }, [clearErrors]);

  const formId = useMemo(() => `dynamic-form-${nanoid()}`, []);

  const renderFormElement = (key: string, value: FormField) => {
    const field = key as Path<IFormInput>;

    if (
      (value.type === 'object' || value.type === 'array') &&
      Boolean(value.ref)
    ) {
      return (
        <SchemaRenderer
          key={field}
          model={value.ref as string | InlineFormRef}
          formSchema={formSchema}
          level={level + 1}
          parentField={field}
          renderLabel={renderLabel}
          renderInput={renderInput}
        />
      );
    }

    if (value.type === 'enum' && typeof value.ref === 'string') {
      const enumValues = formSchema.enums[value.ref] as unknown as string[];
      return (
        <EnumRenderer
          key={field}
          field={field}
          enumValues={enumValues}
          register={register as UseFormRegister<FieldValues>}
          renderLabel={renderLabel}
        />
      );
    }

    const formField = applyValidators(
      formSchema.models?.[model as string]?.[key] || value
    );

    const { pattern, ...validators } = formField?.validators ?? {};

    const message =
      formField.validators?.message || DEFAULT_INPUT_ERROR_MESSAGE;

    const filteredValidators = Object.entries(validators).reduce(
      (acc, [validator, value]) => {
        if (value !== undefined) {
          acc[validator] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>
    );

    // Render regular inputs
    const inputLabelText = formField.label ?? field;

    return (
      <div key={field}>
        {renderLabel ? (
          renderLabel(field)
        ) : (
          <label htmlFor={field}>{inputLabelText}</label>
        )}
        {renderInput ? (
          renderInput(
            key,
            value.type,
            register as UseFormRegister<FieldValues>,
            formState
          )
        ) : (
          <>
            <input
              {...register(field, {
                valueAsNumber: value.type === 'number' ? true : undefined,
                required: formField.required ? (message as string) : false,
                ...filteredValidators,
                validate: (value) => {
                  if (
                    typeof pattern === 'string' &&
                    !RegExp(pattern).test(value)
                  ) {
                    return message as string;
                  }
                  return true;
                },
              })}
              className={errors[field] ? 'error' : ''}
            />
            {errors?.[field] && (
              <p className="form-error">{errors[field] && message}</p>
            )}
          </>
        )}
      </div>
    );
  };

  let form = null;

  if (typeof model === 'string') {
    form = formSchema.models[model];
  } else {
    form = model;
  }

  const renderForm = () => {
    if (!form) {
      return null;
    }
    return Object.entries(form).map(([key, value]) =>
      renderFormElement(key, value)
    );
  };

  if (parentKey) {
    return <div>{renderForm()}</div>;
  }

  const hasFields = typeof form !== 'undefined' && Object.keys(form).length > 0;

  return (
    <FormProvider {...formMethods}>
      <form
        id={formId}
        className={classNames('dynamic-form', className)}
        onSubmit={handleSubmit(
          (onSubmit as SubmitHandler<FieldValues>) ?? (() => {})
        )}
      >
        {title && <h2>{title}</h2>}
        {renderForm()}
        {hasFields && <input type="submit" value="Submit" />}
      </form>
    </FormProvider>
  );
}
