import './App.css';

import formSchema from './generated-form-schema.json';

import { DefaultFormRenderer } from '~renderers/default-renderer';

function App() {
  const handleUserFormSubmit = (data: typeof formSchema.models.User) => {
    console.log(data);
  };

  return (
    <>
      <div id="user-form">
        <DefaultFormRenderer
          formDefinition={formSchema.models.User}
          formSchema={formSchema}
          onSubmit={handleUserFormSubmit}
          level={0}
        />
      </div>
    </>
  );
}

export default App;
