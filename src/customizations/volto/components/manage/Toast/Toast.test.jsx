import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Toast from './Toast';

describe('Toast', () => {
  it('renders the title, content, and Volto compatibility class', () => {
    const { container, getByText } = render(
      <Toast success title="Saved" content="The content was saved." />,
    );

    expect(getByText('Saved')).toBeInTheDocument();
    expect(getByText('The content was saved.')).toBeInTheDocument();
    expect(container.querySelector('.eea-toast')).toHaveClass(
      'ui',
      'message',
      'success',
      'small',
      'icon',
      'eea-toast--success',
    );
    expect(
      container.querySelector('.exclamation.circle.icon'),
    ).toBeInTheDocument();
    expect(container.querySelector('.toast-inner-content')).toBeInTheDocument();
  });

  it.each([
    ['info', { info: true }, 'eea-toast--info'],
    ['success', { success: true }, 'eea-toast--success'],
    ['error', { error: true }, 'eea-toast--error'],
    ['warning', { warning: true }, 'eea-toast--warning'],
  ])('applies the %s status class', (status, props, className) => {
    const { container } = render(
      <Toast {...props} title={status} content={`${status} content`} />,
    );

    expect(container.querySelector('.eea-toast')).toHaveClass(className);
  });
});
