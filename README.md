# Dynamic Forms TS

## Overview

**Dynamic Forms TS** is a TypeScript-first utility that automates the creation of dynamic, type-safe forms in React. By parsing TypeScript types, this module generates form schemas and builds forms dynamically using [React Hook Form](https://react-hook-form.com/). It helps you streamline form development, ensuring that your forms align with TypeScript models and business logic, while reducing boilerplate and improving maintainability.

⚠️ Note: This module is currently experimental and not intended for production use. It is mainly for testing and exploration purposes. I'm still evaluating its overall usefulness and real-world applicability.

## Key Features
- **TypeScript-Driven**: Automatically generates form schemas from TypeScript models.
- **Dynamic Form Generation**: Build dynamic React forms with zero manual configuration.
- **Seamless Integration**: Works out of the box with [React Hook Form](https://react-hook-form.com/).
- **Type-Safe**: Ensures form fields are type-checked based on your TypeScript definitions.
- **Customizable and Extensible**: Adaptable to various use cases with full customization options.

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

### 2. Generate Form Schema

You can generate form schemas using two approaches:

#### a. Build-Time/Server-Side Parsing
You can write the parsed form schema to a JSON file and serve it, or use an endpoint to parse and return the JSON payload on the fly. This gives you flexibility depending on whether you want to pre-generate the schema or handle it dynamically at runtime.

```ts
import { DynamicFormParser } from 'ts-dynamic-forms';

const parser = new DynamicFormParser({ filename: 'schema.ts' });
const formSchema = parser.parse();

// Write the output to a JSON file to serve it statically or via an API endpoint
// Alternatively, expose an API that parses and returns the JSON payload dynamically
```

If you're using Vite, you can streamline the process by using the provided generateFormSchemaVitePlugin:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { generateFormSchemaVitePlugin } from 'ts-dynamic-forms';

export default defineConfig({
  plugins: [react(), generateFormSchemaVitePlugin()],
});
```

This approach allows you to either pre-generate the schema or dynamically generate and serve it on-demand, offering flexibility for different use cases.

#### b. Inline Model Parsing

Alternatively, use class-based models to define and parse forms inline:

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

// Parse the form models
parser.fromClass(PhoneForm);
parser.fromClass(UserForm);

const formSchema = parser.getFormSchema();
```

### 3. Create a Dynamic Form

Once you have the schema, use the `DynamicForm` component to automatically generate the form UI.

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

You can further customize the generated form by adding validation rules, default values, or other configurations directly within the schema to meet specific business needs.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request. For major changes, open an issue first to discuss your proposal.

## License

This project is licensed under the MIT License.
