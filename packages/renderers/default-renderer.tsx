import React from 'react';
import {
  useForm,
  SubmitHandler,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form';
import { nanoid } from 'nanoid';
import { FormDefinition, FormField, FormSchema } from '~core/types';

interface SchemaRendererProps {
  formDefinition: FormDefinition;
  formSchema: FormSchema;
  level: number;
  parentField: string;
  renderLabel?: (key: string) => React.ReactNode;
  renderInput?: (
    key: string,
    type: FormField['type'],
    register: UseFormRegister<FieldValues>
  ) => React.ReactNode;
}

const SchemaRenderer = React.memo(function SchemaRenderer({
  formDefinition,
  formSchema,
  level,
  parentField,
  renderLabel,
  renderInput,
}: SchemaRendererProps) {
  return (
    <div>
      <h3>{parentField}</h3>
      <DefaultFormRenderer
        formDefinition={formDefinition}
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

interface DefaultFormRendererProps<IFormInput extends FieldValues> {
  formDefinition: FormDefinition;
  formSchema: FormSchema;
  level?: number;
  parentKey?: string;
  onSubmit?: SubmitHandler<IFormInput>;
  renderLabel?: (key: string) => React.ReactNode;
  renderInput?: (
    key: string,
    type: FormField['type'],
    register: UseFormRegister<FieldValues>
  ) => React.ReactNode;
}

export function DefaultFormRenderer<IFormInput extends FieldValues>({
  formDefinition,
  formSchema,
  level = 0,
  parentKey = '',
  onSubmit,
  renderLabel,
  renderInput,
}: DefaultFormRendererProps<IFormInput>) {
  const { register, handleSubmit } = useForm<IFormInput>();

  const formId = `dynamic-form-${nanoid()}`;

  const renderFormElement = (key: string, value: FormField) => {
    const field = key as Path<IFormInput>;

    if (value.type === 'object' && typeof value.ref === 'string') {
      return (
        <SchemaRenderer
          key={field}
          formDefinition={formSchema.models[value.ref]}
          formSchema={formSchema}
          level={level + 1}
          parentField={field}
          renderLabel={renderLabel}
          renderInput={renderInput}
        />
      );
    }

    if (value.type === 'array' && typeof value.ref === 'string') {
      return (
        <SchemaRenderer
          key={field}
          formDefinition={formSchema.models[value.ref]}
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

    // Render regular inputs
    return (
      <div key={key}>
        {renderLabel ? renderLabel(key) : <label htmlFor={key}>{key}</label>}
        {renderInput ? (
          renderInput(key, value.type, register as UseFormRegister<FieldValues>)
        ) : (
          <input {...register(field)} />
        )}
      </div>
    );
  };

  const renderForm = () => {
    return Object.entries(formDefinition).map(([key, value]) =>
      renderFormElement(key, value)
    );
  };

  if (parentKey) {
    return <div>{renderForm()}</div>;
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit ?? (() => {}))}>
      {renderForm()}
      <input type="submit" />
    </form>
  );
}
