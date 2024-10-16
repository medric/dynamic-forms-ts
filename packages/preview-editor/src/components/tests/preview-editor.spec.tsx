import {
  render,
  screen,
  fireEvent,
  waitFor,
  RenderOptions,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynamicFormContext } from '~renderers/dynamic-form';

import { PreviewEditor } from '../preview-editor';

jest.mock('@uiw/react-codemirror', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(<div>CodeMirror</div>),
}));

jest.mock('@swc/wasm-web', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

const mockContextValue = {
  formMethods: {},
  setFormMethods: () => {},
};

const customRender = (
  ui: React.ReactElement,
  { ...renderOptions }: Omit<RenderOptions, 'queries'> = {}
) => {
  return render(
    <DynamicFormContext.Provider value={mockContextValue}>
      {ui}
    </DynamicFormContext.Provider>,
    renderOptions
  );
};

jest.mock('@swc/wasm-web', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

jest.mock('~core/parsers/dynamic-form-wasm-parser', () => ({
  DynamicFormWasmParser: jest.fn().mockImplementation(() => ({
    parseInline: jest.fn().mockResolvedValue({ models: { testModel: {} } }),
  })),
}));

describe('<PreviewEditor />', () => {
  it('renders without crashing', async () => {
    customRender(<PreviewEditor />);
    expect(screen.getByText('Preview editor')).toBeInTheDocument();
    expect(screen.getByText('Form preview')).toBeInTheDocument();
  });

  it('compiles code on button click', async () => {
    customRender(<PreviewEditor />);

    // wait for state initialazed to be true
    await waitFor(() => {
      expect(screen.getByText('CodeMirror')).toBeInTheDocument();
    });

    const compileButton = screen.getByTestId('compile-button');

    compileButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('models')).toBeInTheDocument();
    });

    // it('toggles live reload', async () => {
    //   render(<PreviewEditor />);
    //   const liveReloadCheckbox = screen.getByRole('checkbox', {
    //     name: /live reload/i,
    //   });
    //   fireEvent.click(liveReloadCheckbox);

    //   expect(liveReloadCheckbox).toBeChecked();
    // });
  });
});
