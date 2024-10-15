# Dynamic Forms TS

## Overview

**Dynamic Forms TS** is a TypeScript-first utility that simplifies the creation of dynamic, type-safe forms in React. It generates form schemas based on TypeScript models and builds forms dynamically using [React Hook Form](https://react-hook-form.com/). By aligning forms with your TypeScript types, it reduces manual form setup, minimizes boilerplate, and enhances code maintainability.

⚠️ **Note:** This module is experimental and not ready for production use. It is designed for testing and exploration while evaluating its applicability to real-world scenarios.

## Key Features

- **TypeScript-Driven**: Form schemas are automatically generated from your TypeScript models.
- **Dynamic Form Generation**: Build forms dynamically without manual configuration.
- **Seamless Integration**: Works natively with [React Hook Form](https://react-hook-form.com/).
- **Type-Safe**: Ensures all form fields align with your TypeScript definitions.
- **Customizable and Extensible**: Provides full flexibility for custom use cases and extensions.

## Directory Structure

```bash
dynamic-forms-ts/
├── packages/
│   ├── core/            # Core logic for schema parsing and generation
│   ├── renderers/       # React components for rendering forms from schemas
│   ├── utils/           # Helper utilities and tools
│   └── plugins/         # Optional plugins for schema or form customization
├── README.md            # Documentation
└── package.json         # NPM configuration
```

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/medric/dynamic-forms-ts
    cd dynamic-forms-ts
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Usage

### 1. Define TypeScript Models

Start by defining your TypeScript model, which acts as the foundation for generating the form schema.

```ts
type User = {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
};
```

You can also use specialized field types to include validation rules directly in the type definition:

```ts
type Address = {
  street: StringField<0, 50, '', 'Invalid street name'>;
  city: StringField<0, 20, '', 'Invalid city name'>;
};

type User = {
  name: StringField<0, 5, '', 'Invalid name'>;
  address: Address;
  email: EmailField;
};
```

Available field types include:

```ts
type StringField<Min = number, Max = number, Pattern = string, Message = string, Label = string> = string;
type NumberField<Min = number, Max = number, Message = string, Label = string> = number;
type EmailField<Message = string, Label = string> = string;
type StructField<Struct, Message = string, Label = string> = Struct;
```

Alternatively, you can use class-based models with decorators for validations:

```ts
// Class-based syntax with decorators for validation
class User {
  @MinLength(1)
  @MaxLength(100)
  @Label('Name')
  firstName: string;

  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @Min(10)
  @Max(100)
  age: number;
}
```

Available decorators include:

```ts
@MinLength(10)
@MaxLength(10)
@Min(10)
@Min(10)
@Label(10)
@IsEmail(10)
@IsURL(10)
@Pattern('/^[A-Za-z]$/')
@Message('Please provide a valid value')
@Required()
```

Validation rules defined in these types or classes are used by the `<DynamicForm />` component, utilizing React Hook Form's validation system.

### 2. Generate Form Schema

There are multiple ways to generate form schemas:

#### a. Build-Time/Server-Side Parsing

Generate the schema at build time or server-side depending on your setup.

```ts
import { DynamicFormNodeParser } from 'dynamic-forms-ts';

const parser = new DynamicFormNodeParser({ filename: 'schema.ts' });
const formSchema = parser.parse();

// You can save this schema to a JSON file or serve it dynamically.
```

For Vite users, the provided `generateFormSchemaVitePlugin` automates schema generation:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { generateFormSchemaVitePlugin } from 'dynamic-forms-ts';

export default defineConfig({
  plugins: [react(), generateFormSchemaVitePlugin()],
});
```

#### c. Client-Side Schema Parsing

You can also parse TypeScript code directly in the browser or client-side:

```ts
import { DynamicFormWasmParser } from 'dynamic-forms-ts';

const dynamicFormParser = new DynamicFormWasmParser();

const code = `
type User = {
  name: string;
  age: number;
};
`;

const formSchema = dynamicFormParser.parseInline(code);
```

### 3. Render a Dynamic Form

Once you've generated the schema, the `DynamicForm` component will dynamically render your form based on the provided schema:

```tsx
import React from 'react';
import { DynamicForm } from 'dynamic-forms-ts';

const UserForm = () => (
  <DynamicForm
    model="User"              // Specifies which model from the schema to render
    formSchema={formSchema}    // The schema generated from your TypeScript model
    onSubmit={handleUserFormSubmit}  // Handles form submission
    level={0}                 // Defines the nesting level for complex schemas
    title="User"              // The title of the form (optional)
  />
);

export default UserForm;
```

To interact with the form's internal state and methods (provided by [React Hook Form](https://react-hook-form.com/)), you can access them through the dynamic form context:

```ts
import React from 'react';
import { DynamicForm, dynamicFormContext } from 'dynamic-forms-ts';

const UserForm = () => {
  const dynamicFormContext = useDynamicForm();

  // Example: clear form errors
  // dynamicFormContext.formMethods.clearErrors();

  return (
    <DynamicForm
      model="User"              // Specifies which model from the schema to render
      formSchema={formSchema}    // The schema generated from your TypeScript model
      onSubmit={handleUserFormSubmit}  // Handles form submission
      level={0}                 // Defines the nesting level for complex schemas
      title="User"              // The title of the form (optional)
    />
  );
};

export default UserForm;
```

This allows you to fully manage and manipulate the form dynamically, while still retaining full control over validation, errors, and submission states.

### 4. Customize

You can customize the form by adding validation rules, default values, or other configurations directly within the schema to suit your specific needs.

## Test & Build the Package Locally

You can test the module by linking it as a local npm package:

```bash
npm link
```

Once linked, you can also test the CLI locally by running:

```bash
dynamic-forms --help
dynamic-forms preview-editor
```

This will simulate using the package's CLI commands as if it were globally installed.

## TODO/Next Steps

- **Support for Classes and Decorators**: Add support for class-based models and decorators as an alternative to using custom field types with generics.
- **Additional Testing**: Write more comprehensive unit and integration tests to ensure robustness.
- **Publish to NPM**: Prepare the project for public release and publish the package to [npm](https://www.npmjs.com/).

## Contributing

Contributions are welcome! To contribute, fork the repository and submit a pull request. For significant changes, please open an issue to discuss your proposal before starting.

## License

This project is licensed under the MIT License.
