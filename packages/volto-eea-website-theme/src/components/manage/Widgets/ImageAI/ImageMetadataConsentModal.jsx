import React from 'react';
import PropTypes from 'prop-types';
import { Button, Loader, Message, Modal } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';

import './imageAIModal.less';

const messages = defineMessages({
  title: {
    id: 'Generate Image metadata with AI?',
    defaultMessage: 'Generate Image metadata with AI?',
  },
  disclosure: {
    id: 'The configured AI service will analyse this image to generate its title and description. The title will also become the default alt text.',
    defaultMessage:
      'The configured AI service will analyse this image to generate its title and description. The title will also become the default alt text.',
  },
  replace: {
    id: 'Generating metadata will replace the current title and description.',
    defaultMessage:
      'Generating metadata will replace the current title and description.',
  },
  unsupported: {
    id: 'AI metadata is unavailable for this image format. You can still upload the image without AI.',
    defaultMessage:
      'AI metadata is unavailable for this image format. You can still upload the image without AI.',
  },
  analyzing: {
    id: 'Analyzing image…',
    defaultMessage: 'Analyzing image…',
  },
  creating: {
    id: 'Uploading image…',
    defaultMessage: 'Uploading image…',
  },
  failed: {
    id: 'Image analysis failed. No Image has been created.',
    defaultMessage: 'Image analysis failed. No Image has been created.',
  },
  editFailed: {
    id: 'Image analysis failed. No changes have been saved.',
    defaultMessage: 'Image analysis failed. No changes have been saved.',
  },
  metadataChanged: {
    id: 'The title or description changed during analysis. Your edits were kept. Retry to generate again.',
    defaultMessage:
      'The title or description changed during analysis. Your edits were kept. Retry to generate again.',
  },
  notEditable: {
    id: 'The image or metadata fields are not accessible for editing.',
    defaultMessage:
      'The image or metadata fields are not accessible for editing.',
  },
  invalid: {
    id: 'The selected image could not be analysed safely.',
    defaultMessage: 'The selected image could not be analysed safely.',
  },
  tooLarge: {
    id: 'The selected image is too large for AI analysis.',
    defaultMessage: 'The selected image is too large for AI analysis.',
  },
  notAddable: {
    id: 'The requested content type cannot be added at this location.',
    defaultMessage:
      'The requested content type cannot be added at this location.',
  },
  notAllowed: {
    id: 'Image AI is not allowed for this content type.',
    defaultMessage: 'Image AI is not allowed for this content type.',
  },
  creationFailed: {
    id: 'The Image could not be created. The generated metadata has been kept for retry.',
    defaultMessage:
      'The Image could not be created. The generated metadata has been kept for retry.',
  },
  generate: {
    id: 'Generate with AI',
    defaultMessage: 'Generate with AI',
  },
  withoutAI: {
    id: 'Upload without AI',
    defaultMessage: 'Upload without AI',
  },
  retry: { id: 'Retry', defaultMessage: 'Retry' },
  retryUpload: {
    id: 'Retry upload',
    defaultMessage: 'Retry upload',
  },
  cancel: { id: 'Cancel', defaultMessage: 'Cancel' },
});

const errorMessages = {
  invalid_request: messages.invalid,
  invalid_image: messages.invalid,
  image_too_large: messages.tooLarge,
  image_not_addable: messages.notAddable,
  image_ai_not_allowed: messages.notAllowed,
  image_not_editable: messages.notEditable,
  metadata_changed: messages.metadataChanged,
  unsupported_media_type: messages.unsupported,
  generation_failed: messages.failed,
};

const ImageMetadataConsentModal = ({
  state,
  supported,
  willReplaceMetadata,
  canUpload = true,
  editing = false,
  onGenerate,
  onWithoutAI,
  onRetryCreation,
  onCancel,
}) => {
  const intl = useIntl();
  const { status, errorCode } = state;
  const analyzing = status === 'analyzing';
  const creating = status === 'creating';
  const open = status !== 'idle' && status !== 'ready';
  // Analysis returns suggestions without saving anything. Once creation has
  // been dispatched, closing the modal cannot reliably prevent that upload.
  const canDismiss = !creating;

  return (
    <Modal
      className="image-ai-progress-modal image-ai-consent-modal"
      open={open}
      size="small"
      closeIcon={canDismiss}
      closeOnDimmerClick={canDismiss}
      closeOnEscape={canDismiss}
      onClose={canDismiss ? onCancel : undefined}
      aria-labelledby="image-ai-consent-title"
    >
      <Modal.Header id="image-ai-consent-title">
        {intl.formatMessage(messages.title)}
      </Modal.Header>
      <Modal.Content>
        {status === 'choice' ? (
          <>
            <p>{intl.formatMessage(messages.disclosure)}</p>
            {willReplaceMetadata ? (
              <Message warning content={intl.formatMessage(messages.replace)} />
            ) : null}
            {!supported ? (
              <Message
                warning
                content={intl.formatMessage(messages.unsupported)}
              />
            ) : null}
          </>
        ) : null}
        {status === 'analyzing' ? (
          <Loader active inline="centered">
            {intl.formatMessage(messages.analyzing)}
          </Loader>
        ) : null}
        {status === 'creating' ? (
          <Loader active inline="centered">
            {intl.formatMessage(messages.creating)}
          </Loader>
        ) : null}
        {status === 'failed' ? (
          <Message
            negative
            content={intl.formatMessage(
              editing && (!errorCode || errorCode === 'generation_failed')
                ? messages.editFailed
                : errorMessages[errorCode] || messages.failed,
            )}
          />
        ) : null}
        {status === 'creationFailed' ? (
          <Message
            negative
            content={intl.formatMessage(messages.creationFailed)}
          />
        ) : null}
      </Modal.Content>
      {!creating ? (
        <Modal.Actions>
          <Button type="button" onClick={onCancel}>
            {intl.formatMessage(messages.cancel)}
          </Button>
          {canUpload &&
          !analyzing &&
          (status === 'choice' || status === 'failed') ? (
            <Button type="button" onClick={onWithoutAI}>
              {intl.formatMessage(messages.withoutAI)}
            </Button>
          ) : null}
          {supported &&
          !analyzing &&
          (status === 'choice' || status === 'failed') ? (
            <Button type="button" primary onClick={onGenerate}>
              {intl.formatMessage(
                status === 'failed' ? messages.retry : messages.generate,
              )}
            </Button>
          ) : null}
          {status === 'creationFailed' ? (
            <Button type="button" primary onClick={onRetryCreation}>
              {intl.formatMessage(messages.retryUpload)}
            </Button>
          ) : null}
        </Modal.Actions>
      ) : null}
    </Modal>
  );
};

ImageMetadataConsentModal.propTypes = {
  state: PropTypes.shape({
    status: PropTypes.string.isRequired,
    errorCode: PropTypes.string,
  }).isRequired,
  supported: PropTypes.bool.isRequired,
  willReplaceMetadata: PropTypes.bool,
  canUpload: PropTypes.bool,
  editing: PropTypes.bool,
  onGenerate: PropTypes.func.isRequired,
  onWithoutAI: PropTypes.func.isRequired,
  onRetryCreation: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
};

ImageMetadataConsentModal.defaultProps = {
  willReplaceMetadata: false,
  onRetryCreation: () => {},
};

export default ImageMetadataConsentModal;
