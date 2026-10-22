import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import config from '@plone/volto/registry';
import withSaveAsDraft from './withSaveAsDraft';

const voltoVersion = vi.hoisted(() => ({ isVolto18: false }));

vi.mock('@eeacms/volto-eea-website-theme/helpers/voltoVersion', () => ({
  get isVolto18() {
    return voltoVersion.isVolto18;
  },
}));

const schema = { properties: { title: {} } };

const renderForm = () => {
  const received = {};
  const Form = (props) => {
    Object.assign(received, props);
    return null;
  };
  const Wrapped = withSaveAsDraft({ forwardRef: true })(Form);
  render(
    <IntlProvider locale="en">
      <MemoryRouter initialEntries={['/page/edit']}>
        <Wrapped schema={schema} type="Document" isEditForm />
      </MemoryRouter>
    </IntlProvider>,
  );
  return received;
};

const setAutosave = (enabled) => {
  config.experimental = {
    ...config.experimental,
    saveAsDraft: { enabled },
  };
};

describe('withSaveAsDraft', () => {
  afterEach(() => {
    voltoVersion.isVolto18 = false;
    vi.mocked(localStorage.getItem).mockReset();
    vi.mocked(localStorage.setItem).mockReset();
    vi.useRealTimers();
  });

  it('leaves the form untouched when autosave is disabled', () => {
    setAutosave(false);
    expect(renderForm().onSaveDraft).toBeUndefined();
  });

  it('gives the form the draft callbacks when autosave is enabled', () => {
    setAutosave(true);
    const props = renderForm();
    expect(props.checkSavedDraft).toBeInstanceOf(Function);
    expect(props.onSaveDraft).toBeInstanceOf(Function);
    expect(props.onCancelDraft).toBeInstanceOf(Function);
  });

  it('keeps autosave off on Volto 18 even when enabled', () => {
    voltoVersion.isVolto18 = true;
    setAutosave(true);
    expect(renderForm().onSaveDraft).toBeUndefined();
  });

  it('stores the schema fields of the form in localStorage', () => {
    // The Volto test setup stubs localStorage, so check the stored value.
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.useFakeTimers();
    setAutosave(true);
    renderForm().onSaveDraft({ title: 'Draft', other: 'ignored' });
    vi.advanceTimersByTime(300);

    const [key, value] = vi.mocked(localStorage.setItem).mock.calls.at(-1);
    const saved = JSON.parse(value);
    expect(key).toBe('form-Document-/page/edit');
    expect(saved.title).toBe('Draft');
    expect(saved.other).toBeUndefined();
    expect(saved.autoSaveDate).toBeDefined();
  });
});
