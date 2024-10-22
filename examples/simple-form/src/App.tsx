import './App.css';

import { DynamicForm } from 'ts-dynamic-forms/dist/ui/dynamic-form';

import 'ts-dynamic-forms/dist/dynamic-form.css';

import formSchema from './generated-form-schema.json';

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
