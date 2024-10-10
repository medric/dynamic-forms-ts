Here’s a draft for your README:

---

# Dynamic Forms TS

## Description

**Dynamic Forms TS** is a TypeScript-first utility that parses TypeScript types, automatically generates form schemas, and dynamically builds React forms using [React Hook Form](https://react-hook-form.com/). It simplifies the process of creating robust, type-safe forms in React by leveraging your existing TypeScript models.

This module automates form creation, ensuring the forms are fully type-checked and align with your business logic, reducing boilerplate code and improving maintainability.

## Features
- Parse TypeScript types to generate form schemas.
- Build dynamic React forms with zero manual form configuration.
- Integrates seamlessly with [React Hook Form](https://react-hook-form.com/).
- Type-safe form generation based on TypeScript models.
- Highly customizable and extensible.

## Directory Structure

```bash
ts-dynamic-forms/
├── packages/
│   ├── core/            # Parser & Form schema generators
│   ├── renderers/       # React form renderers 
│   ├── utils/           # Helper utilities
│   └── plugins/            
├── tests/                # Unit tests for schema parsing and form generation
├── README.md             # Project documentation
└── package.json          # NPM package configuration
```

## Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/medric/ts-dynamic-forms
    cd ts-dynamic-forms
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

## Usage

1. **Define TypeScript Types**: Start by defining your TypeScript model, which will be parsed to generate the form schema.

    ```ts
    interface User {
        firstName: string;
        lastName: string;
        age: number;
        email: string;
    }
    ```

2. **Generate Form Schema**: Use the `generateSchema` utility to create the form schema from your TypeScript types.

    ```ts
    import { generateSchema } from 'ts-dynamic-forms';
    
    const userSchema = generateSchema<User>();
    ```

3. **Create a Dynamic Form**: Leverage the dynamic form component powered by React Hook Form to generate the form UI based on the schema.

    ```tsx
    import React from 'react';
    import { DynamicForm } from 'ts-dynamic-forms';

    const UserForm = () => {
      return (
        <DynamicForm schema={userSchema} onSubmit={data => console.log(data)} />
      );
    };

    export default UserForm;
    ```

4. **Customize**: Add validation, default values, or other configurations directly to the generated schema for full control over your form.

## Contributing

We welcome contributions! Please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you'd like to change.

## License

MIT License

---

This README provides a clear overview of the module, along with instructions on how to set it up and use it. Feel free to customize further!
