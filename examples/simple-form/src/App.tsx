import './App.css';

import { DynamicForm } from 'dynamic-forms-ts';

import 'dynamic-forms-ts/dist/dynamic-form.css';

import formSchema from './dynamic-form-ts-schema.json';

function App() {
  const handleUserFormSubmit = (data: typeof formSchema.models.User) => {
    console.log(data);
  };

  return (
    <>
      <div id="user-form">
        <DynamicForm
          model="User"
          formSchema={formSchema}
          onSubmit={handleUserFormSubmit}
          level={0}
          title="User"
        />
      </div>
    </>
  );
}

export default App;
