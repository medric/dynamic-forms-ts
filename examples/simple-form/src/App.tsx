import './App.css';

import formSchema from './dynamic-form-ts-schema.json';

import { DynamicForm } from '~renderers/dynamic-form';

function App() {
  const handleUserFormSubmit = (data: typeof formSchema.models.User) => {
    console.log(data);
  };

  return (
    <>
      <div id="user-form">
        <DynamicForm
          formDefinition={formSchema.models.User}
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
