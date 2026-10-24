import React from 'react';
import { IntlProvider } from 'react-intl';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import ImageMetadataConsentModal from './ImageMetadataConsentModal';

const renderModal = (status, onCancel = jest.fn()) => {
  render(
    <IntlProvider locale="en" messages={{}}>
      <ImageMetadataConsentModal
        state={{ status, errorCode: null }}
        supported
        onGenerate={jest.fn()}
        onWithoutAI={jest.fn()}
        onCancel={onCancel}
      />
    </IntlProvider>,
  );
  return onCancel;
};

describe('ImageMetadataConsentModal', () => {
  it('keeps the modal loader visible while analysis is running', () => {
    const onCancel = renderModal('analyzing');
    const loader = screen.getByText('Analyzing image…');

    expect(loader).toBeVisible();
    expect(loader).toHaveClass('loader');
    expect(loader.closest('.ui.modal')).toHaveClass('image-ai-consent-modal');
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('treats Escape during analysis as Cancel', async () => {
    const onCancel = renderModal('analyzing');

    fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });
    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
  });

  it('does not offer dismissal after creation has been dispatched', () => {
    const onCancel = renderModal('creating');

    expect(screen.getByText('Uploading image…')).toBeVisible();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });
    expect(onCancel).not.toHaveBeenCalled();
  });
});
