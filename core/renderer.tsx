import { useForm, SubmitHandler, FieldValues, Path, UseFormRegister } from "react-hook-form"
import { FormDefinition } from "./types";

interface ObjectRendererProps<IFormInput extends FieldValues> {
  formDefinition: FormDefinition;
  formSchema: Record<string, FormDefinition>;
  level: number;
  parentKey: string;
}

function ObjectRenderer<IFormInput extends FieldValues>({
  formDefinition,
  formSchema,
  level,
  parentKey,
}: ObjectRendererProps<IFormInput>) {
  return (
    <div>
      <h3>{parentKey}</h3>
      <Renderer
        formDefinition={formDefinition}
        formSchema={formSchema}
        level={level + 1}
        parentKey={parentKey}
      />
    </div>
  );
}

interface ArrayRendererProps<IFormInput extends FieldValues> {
  formDefinition: FormDefinition;
  formSchema: Record<string, FormDefinition>;
  level: number;
  parentKey: string;
}

function ArrayRenderer<IFormInput extends FieldValues>({
  formDefinition,
  formSchema,
  level,
  parentKey,
}: ArrayRendererProps<IFormInput>) {
  return (
    <div>
      <h3>{parentKey}</h3>
      <Renderer
        formDefinition={formDefinition}
        formSchema={formSchema}
        level={level + 1}
        parentKey={parentKey}
      />
    </div>
  );
}

interface EnumRendererProps<IFormInput extends FieldValues> {
  enumValues: string[];
  key: Path<IFormInput>;
  register: UseFormRegister<IFormInput> 
}

function EnumRenderer<IFormInput extends FieldValues>({
  enumValues,
  key,
  register,
}: EnumRendererProps<IFormInput>) {
  return (
    <div>
      <label htmlFor={key}>{key}</label>
      <select {...register(key)}>
        {enumValues.map((enumKey: string) => (
          <option key={enumKey} value={enumKey}>
            {enumKey}
          </option>
        ))}
      </select>
    </div>
  );
}

export interface RendererProps<IFormInput extends FieldValues> {
  formDefinition: FormDefinition;
  formSchema: Record<string, FormDefinition>;
  level?: number;
  parentKey?: string;
}

export function Renderer<IFormInput extends FieldValues>({
  formDefinition,
  formSchema,
  level = 0,
  parentKey = '',
}: RendererProps<IFormInput>) {
  const { register } = useForm<IFormInput>();

  const renderObject = (key: string, value: FormDefinition) => {
    if (typeof value.ref !== 'string') {
      return null;
    }
    return (
      <ObjectRenderer
        key={key}
        formDefinition={formSchema[value.ref]}
        formSchema={formSchema}
        level={level + 1}
        parentKey={key}
      />
    );
  };

  const renderArray = (key: string, value: FormDefinition) => {
    if (typeof value.ref !== 'string') {
      return null;
    }
    return (
      <ArrayRenderer
        key={key}
        formDefinition={formSchema[value.ref]}
        formSchema={formSchema}
        level={level + 1}
        parentKey={key}
      />
    );
  };

  const renderEnum = (key: string, value: FormDefinition) => {
    if (typeof value.ref !== 'string') {
      return null;
    }
    const enumValues = formSchema[value.ref] as unknown as string[];
    const typedKey = key as Path<IFormInput>;
    return (
      <EnumRenderer
        key={typedKey}
        enumValues={enumValues}
        register={register}
      />
    );
  };

  return Object.entries(formDefinition).map(([key, value]) => {
    const isObject = value.type === 'object';
    const isArray = value.type === 'array';
    const isEnum = value.type === 'enum';

    if (isObject && typeof value.ref === 'string') {
      return renderObject(key, formSchema[value.ref]);
    }

    if (isArray && typeof value.ref === 'string') {
      return renderArray(key, formSchema[value.ref]);
    }

    if (isEnum && typeof value.ref === 'string') {
      return renderEnum(key, formSchema[value.ref]);
    }

    return (
      <div key={key}>
        <label htmlFor={key}>{key}</label>
        <input {...register(key as Path<IFormInput>)} />
      </div>
    );
  });
}
