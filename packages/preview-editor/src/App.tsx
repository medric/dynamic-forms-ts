import { DynamicFormProvider } from '~renderers/dynamic-form';
import './App.css';
import { PreviewEditor } from './components/preview-editor';
import Header from './components/header';

function App() {
  return (
    <DynamicFormProvider>
      <Header />
      <PreviewEditor />
    </DynamicFormProvider>
  );
}

export default App;
