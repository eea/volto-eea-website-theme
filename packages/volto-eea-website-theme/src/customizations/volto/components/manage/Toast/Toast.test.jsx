import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import '@testing-library/jest-dom';

import Toast from './Toast';

const voltoVersion = vi.hoisted(() => ({ isVolto18: false }));

vi.mock('@eeacms/volto-eea-website-theme/helpers/voltoVersion', () => ({
  get isVolto18() {
    return voltoVersion.isVolto18;
  },
}));

const renderToast = (props) =>
  render(
    <IntlProvider locale="en">
      <Toast {...props} />
    </IntlProvider>,
  );

describe('Toast', () => {
  afterEach(() => {
    voltoVersion.isVolto18 = false;
  });

  it('renders the title, content, and Volto compatibility class', () => {
    const { container, getByText } = renderToast({
      success: true,
      title: 'Saved',
      content: 'The content was saved.',
    });

    expect(getByText('Saved')).toBeInTheDocument();
    expect(getByText('Saved')).toHaveClass('header');
    expect(getByText('The content was saved.')).toBeInTheDocument();
    expect(container.querySelector('.eea-toast')).toHaveClass(
      'ui',
      'message',
      'success',
      'large',
      'icon',
      'eea-toast--success',
    );
    expect(
      container.querySelector('.exclamation.circle.icon'),
    ).toBeInTheDocument();
    expect(container.querySelector('.exclamation.circle.icon')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(
      container.querySelector('.content.toast-inner-content'),
    ).toBeInTheDocument();
  });

  it.each([
    ['info', { info: true }, 'eea-toast--info'],
    ['success', { success: true }, 'eea-toast--success'],
    ['error', { error: true }, 'eea-toast--error'],
    ['warning', { warning: true }, 'eea-toast--warning'],
  ])('applies the %s status class', (status, props, className) => {
    const { container } = renderToast({
      ...props,
      title: status,
      content: `${status} content`,
    });

    expect(container.querySelector('.eea-toast')).toHaveClass(className);
    expect(container.querySelector('.eea-toast')).toHaveClass(status);
  });

  it('defaults to the success style when no status is given', () => {
    const { container } = renderToast({ content: 'No status' });

    expect(container.querySelector('.eea-toast')).toHaveClass(
      'success',
      'eea-toast--success',
    );
    expect(container.querySelector('.visually-hidden')).not.toBeInTheDocument();
  });

  it('does not render a header without a title', () => {
    const { container } = renderToast({ info: true, content: 'Only content' });

    expect(container.querySelector('.header')).not.toBeInTheDocument();
  });

  it.each([
    ['info', { info: true }, 'Information'],
    ['success', { success: true }, 'Success'],
    ['error', { error: true }, 'Error'],
    ['warning', { warning: true }, 'Warning'],
  ])(
    'renders the %s type label for screen readers on Volto 19',
    (status, props, label) => {
      const { container } = renderToast({ ...props, content: 'content' });
      const typeLabel = container.querySelector(
        '.toast-inner-content > .visually-hidden',
      );

      expect(typeLabel).toHaveTextContent(label);
      expect(
        container.querySelector('.visually-hidden-volto'),
      ).not.toBeInTheDocument();
    },
  );

  it('uses the Volto 18 screen reader class on Volto 18', () => {
    voltoVersion.isVolto18 = true;
    const { container } = renderToast({ error: true, content: 'content' });

    expect(container.querySelector('.visually-hidden-volto')).toHaveTextContent(
      'Error',
    );
    expect(container.querySelector('.visually-hidden')).not.toBeInTheDocument();
  });

  it('translates the type label', () => {
    const { container } = render(
      <IntlProvider
        locale="de"
        messages={{ toast_type_warning: 'Warnung' }}
        onError={() => {}}
      >
        <Toast warning content="content" />
      </IntlProvider>,
    );

    expect(container.querySelector('.visually-hidden')).toHaveTextContent(
      'Warnung',
    );
  });
});
