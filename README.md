# Dynamic Forms TS

## Overview

**Dynamic Forms TS** is a TypeScript-first utility that automates the creation of dynamic, type-safe forms in React. By parsing TypeScript types, this module generates form schemas and builds forms dynamically using [React Hook Form](https://react-hook-form.com/). This tool aims to streamline form development by aligning forms with your TypeScript models and business logic, reducing boilerplate code and enhancing maintainability.

⚠️ **Note:** This module is currently experimental and not intended for production use. It is designed primarily for testing and exploration purposes while evaluating its real-world applicability.

## Key Features
- **TypeScript-Driven**: Automatically generates form schemas based on TypeScript models.
- **Dynamic Form Generation**: Build dynamic React forms without manual configuration.
- **Seamless Integration**: Works seamlessly with [React Hook Form](https://react-hook-form.com/).
- **Type-Safe**: Ensures all form fields are type-checked against your TypeScript definitions.
- **Customizable and Extensible**: Easily adaptable with full customization options for various use cases.

## Directory Structure

```bash
ts-dynamic-forms/
├── packages/
│   ├── core/            # Core logic for parsing and generating form schemas
│   ├── renderers/       # React form components for rendering schemas
│   ├── utils/           # Helper utilities and tools
│   └── plugins/         # Optional plugins for schema generation or form rendering
├── tests/               # Unit tests for schema parsing and form rendering
├── README.md            # Documentation
└── package.json         # NPM configuration
```

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/medric/ts-dynamic-forms
    cd ts-dynamic-forms
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

## Usage

### 1. Define TypeScript Types

Start by defining your TypeScript model, which will serve as the foundation for generating the form schema.

```ts
type User = {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
};
```

You can also leverage custom field types to handle input validations:

```ts
type User = {
  firstname: FieldString<1, 50, '[a-zA-Z]+$', 'Incorrect name', 'First Name'>;
  lastname: FieldString<1, 50, '[a-zA-Z]+$', 'Incorrect name', 'Last Name'>;
  age: FieldNumber<1, 100, 'Incorrect age'>;
};
```

Available field types are:

```ts
type FieldString<
  Min = number,
  Max = number,
  Pattern = string,
  Message = string,
  Label = string,
> = string;

type FieldNumber<
  Min = number,
  Max = number,
  Message = string,
  Label = string,
> = number;

type FieldEmail<Message = string, Label = string> = string;
```

The validation rules and field options defined within the generic parameters are parsed and used within the `<DynamicForm />` renderer, utilizing the validation mechanism of React Hook Form.

### 2. Generate Form Schema

You can generate form schemas using two approaches:

#### a. Build-Time/Server-Side Parsing
You can pre-generate the schema at build time or parse it dynamically on the server side, depending on your use case.

```ts
import { DynamicFormParser } from 'ts-dynamic-forms';

const parser = new DynamicFormParser({ filename: 'schema.ts' });
const formSchema = parser.parse();

// Write the output to a JSON file or serve it dynamically
```

If you're using Vite, the provided `generateFormSchemaVitePlugin` can help automate schema generation:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { generateFormSchemaVitePlugin } from 'ts-dynamic-forms';

export default defineConfig({
  plugins: [react(), generateFormSchemaVitePlugin()],
});
```

#### b. Inline Model Parsing

You can also use class-based models to define and parse forms directly in your code:

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

const parser = new DynamicFormParser();

// Parse form models directly
parser.fromClass(PhoneForm);
parser.fromClass(UserForm);

const formSchema = parser.getFormSchema();
```

### 3. Create a Dynamic Form

Once you have the schema, you can use the `DynamicForm` component to generate the form UI automatically.

```tsx
import React from 'react';
import { DynamicForm } from 'ts-dynamic-forms';

const UserForm = () => (
  <DynamicForm
    formDefinition={formSchema.models.User}
    formSchema={formSchema}
    onSubmit={handleUserFormSubmit}
    level={0}
  />
);

export default UserForm;
```

### 4. Customize

You can customize the generated form by adding validation rules, default values, and other configurations directly within the schema to suit specific business needs.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss your proposal.

## License

This project is licensed under the MIT License.
