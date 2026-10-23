import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '@plone/volto/registry';
import withSaveAsDraft from './withSaveAsDraft';

const voltoVersion = vi.hoisted(() => ({ isVolto18: false }));

vi.mock('@eeacms/volto-eea-website-theme/helpers/voltoVersion', () => ({
  get isVolto18() {
    return voltoVersion.isVolto18;
  },
}));

vi.mock('react-toastify', () => ({ toast: { info: vi.fn() } }));

const schema = { properties: { title: {}, description: {} } };

const renderForm = (props = {}, { forwardRef = true, path } = {}) => {
  const received = {};
  const Form = (formProps) => {
    Object.assign(received, formProps);
    return null;
  };
  const Wrapped = withSaveAsDraft({ forwardRef })(Form);
  render(
    <IntlProvider locale="en">
      <MemoryRouter initialEntries={[path || '/page/edit']}>
        <Wrapped schema={schema} type="Document" isEditForm {...props} />
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

// The Volto test setup stubs localStorage with mocks.
const storage = () => ({
  getItem: vi.mocked(localStorage.getItem),
  setItem: vi.mocked(localStorage.setItem),
  removeItem: vi.mocked(localStorage.removeItem),
});

// Render the toast content passed to toast.info and return its props.
const lastToast = () => {
  const { content } = vi.mocked(toast.info).mock.calls.at(-1)[0].props;
  render(content);
  return content.props;
};

describe('withSaveAsDraft', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setAutosave(true);
  });

  afterEach(() => {
    voltoVersion.isVolto18 = false;
    storage().getItem.mockReset();
    storage().setItem.mockReset();
    storage().removeItem.mockReset();
    vi.mocked(toast.info).mockReset();
    vi.useRealTimers();
  });

  it('leaves the form untouched when autosave is disabled', () => {
    setAutosave(false);
    expect(renderForm().onSaveDraft).toBeUndefined();
  });

  it('leaves the form untouched without forwardRef when disabled', () => {
    setAutosave(false);
    expect(renderForm({}, { forwardRef: false }).onSaveDraft).toBeUndefined();
  });

  it('gives the form the draft callbacks when autosave is enabled', () => {
    const props = renderForm();
    expect(props.checkSavedDraft).toBeInstanceOf(Function);
    expect(props.onSaveDraft).toBeInstanceOf(Function);
    expect(props.onCancelDraft).toBeInstanceOf(Function);
  });

  it('gives the draft callbacks without forwardRef too', () => {
    expect(renderForm({}, { forwardRef: false }).onSaveDraft).toBeInstanceOf(
      Function,
    );
  });

  it('keeps autosave off on Volto 18 even when enabled', () => {
    voltoVersion.isVolto18 = true;
    expect(renderForm().onSaveDraft).toBeUndefined();
  });

  it('stores the schema fields of the form in localStorage', () => {
    storage().getItem.mockReturnValue(null);
    renderForm().onSaveDraft({ title: 'Draft', other: 'ignored' });
    vi.advanceTimersByTime(300);

    const [key, value] = storage().setItem.mock.calls.at(-1);
    const saved = JSON.parse(value);
    expect(key).toBe('form-Document-/page/edit');
    expect(saved.title).toBe('Draft');
    expect(saved.other).toBeUndefined();
    expect(saved.autoSaveDate).toBeDefined();
  });

  it('keeps one id per add form and per comment form', () => {
    storage().getItem.mockReturnValue(null);
    renderForm({ isEditForm: false }, { path: '/folder/add' }).onSaveDraft({
      title: 'New',
    });
    vi.advanceTimersByTime(300);
    expect(storage().setItem.mock.calls.at(-1)[0]).toBe(
      'form-/folder/add-Document',
    );

    renderForm(
      {
        isEditForm: false,
        type: undefined,
        schema: { properties: { comment: {} } },
      },
      { path: '/page' },
    ).onSaveDraft({ comment: 'Hi' });
    vi.advanceTimersByTime(300);
    expect(storage().setItem.mock.calls.at(-1)[0]).toBe('form-/page-comment');

    renderForm(
      { isEditForm: false, type: undefined },
      { path: '/page/contact' },
    ).onSaveDraft({ title: 'Hi' });
    vi.advanceTimersByTime(300);
    expect(storage().setItem.mock.calls.at(-1)[0]).toBe('form-/page/contact');
  });

  it('does nothing without a schema', () => {
    const props = renderForm({ schema: undefined });
    props.onSaveDraft({ title: 'Draft' });
    props.onCancelDraft();
    props.checkSavedDraft({ title: 'Draft' }, vi.fn());
    vi.advanceTimersByTime(1000);
    expect(storage().setItem).not.toHaveBeenCalled();
    expect(storage().removeItem).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
  });

  it('does not offer a draft that matches the form', () => {
    storage().getItem.mockReturnValue(
      JSON.stringify({ title: 'Same', autoSaveDate: new Date() }),
    );
    renderForm().checkSavedDraft({ title: 'Same' }, vi.fn());
    vi.advanceTimersByTime(300);
    expect(toast.info).not.toHaveBeenCalled();
  });

  it('offers to restore a different draft', () => {
    storage().getItem.mockReturnValue(
      JSON.stringify({ title: 'Draft', autoSaveDate: new Date() }),
    );
    const restore = vi.fn();
    renderForm().checkSavedDraft({ title: 'Saved' }, restore);
    vi.advanceTimersByTime(300);

    const toastProps = lastToast();
    expect(
      screen.getByText('Do you want to restore your autosaved content?'),
    ).toBeInTheDocument();
    toastProps.onUpdate();
    expect(restore).toHaveBeenCalledWith({ title: 'Draft' });
  });

  it('warns when the content changed on the server after the draft', () => {
    storage().getItem.mockReturnValue(
      JSON.stringify({ title: 'Draft', autoSaveDate: '2026-01-01T00:00:00Z' }),
    );
    renderForm().checkSavedDraft(
      { title: 'Saved', modified: '2026-06-01T00:00:00Z' },
      vi.fn(),
    );
    vi.advanceTimersByTime(300);

    lastToast();
    expect(
      screen.getByText(/Another person edited this content/),
    ).toBeInTheDocument();
  });

  it('restores the draft from the OK button and drops it from Cancel', () => {
    storage().getItem.mockReturnValue(
      JSON.stringify({ title: 'Draft', autoSaveDate: new Date() }),
    );
    const restore = vi.fn();
    renderForm().checkSavedDraft({ title: 'Saved' }, restore);
    vi.advanceTimersByTime(300);
    lastToast();

    const [ok, cancel] = screen.getAllByRole('button');
    fireEvent.click(ok);
    expect(restore).toHaveBeenCalledWith({ title: 'Draft' });
    fireEvent.click(cancel);
    vi.advanceTimersByTime(500);
    expect(storage().removeItem).toHaveBeenCalledWith(
      'form-Document-/page/edit',
    );
  });

  it('drops the draft when the edit is cancelled', () => {
    renderForm().onCancelDraft();
    vi.advanceTimersByTime(500);
    expect(storage().removeItem).toHaveBeenCalledWith(
      'form-Document-/page/edit',
    );
  });
});
