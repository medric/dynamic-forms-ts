import { DynamicFormProvider } from '~renderers/dynamic-form';
import './App.css';
import { PreviewEditor } from './components/preview-editor';

function App() {
  return (
    <DynamicFormProvider>
      <PreviewEditor />
    </DynamicFormProvider>
  );
}

export default App;
