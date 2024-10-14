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

### 1. Define TypeScript Types

Start by defining your TypeScript model. This model will serve as the blueprint for generating the form schema.

```ts
type User = {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
};
```

You can also use specialized field types to handle validation rules:

```ts
type User = {
  name: StringField<0, 5, '', 'Invalid name'>;
  address: StructField<{ 
    street: StringField<0, 5>,
    city: StringField<0, 5>,
  }>;
  email: EmailField;
}
```

Available field types include:

```ts
type StringField<Min = number, Max = number, Pattern = string, Message = string, Label = string> = string;
type NumberField<Min = number, Max = number, Message = string, Label = string> = number;
type EmailField<Message = string, Label = string> = string;
type StructField<Struct, Message = string, Label = string> = Struct;
```

Validation rules specified in these field types are used by the `<DynamicForm />` component, taking advantage of React Hook Form's validation system.

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

#### b. Inline Model Parsing

You can define and parse forms directly in your code using class-based models:

```ts
class PhoneForm {
  num: string = '';
  type: 'home' | 'work' = 'home';
}

class UserForm {
  firstname: string = '';
  lastname: string = '';
  age: number = 0;
  phone: PhoneForm = new PhoneForm();
  posts: string[] = [''];
}

const parser = new DynamicFormNodeParser();

// Parse models directly from class definitions
parser.fromClass(PhoneForm);
parser.fromClass(UserForm);

const formSchema = parser.getFormSchema();
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

const formSchema = dynamicFormParser.parse(code);
```

### 3. Render a Dynamic Form

Once you have the schema, use the `DynamicForm` component to generate the form UI:

```tsx
import React from 'react';
import { DynamicForm } from 'dynamic-forms-ts';

const UserForm = () => (
  <DynamicForm
    model="User"
    formSchema={formSchema}
    onSubmit={handleUserFormSubmit}
    level={0}
    title="User"
  />
);

export default UserForm;
```

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
