import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { Confirm } from 'semantic-ui-react';
import cx from 'classnames';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import TextareaWidget from '@plone/volto/components/manage/Widgets/TextareaWidget';
import GenAISettings from '@eeacms/volto-eea-website-theme/components/manage/GenAISettings/GenAISettings';
import {
  abortImageAIRequest,
  applyAltChange,
  deriveAltDisplayState,
  readImageAIErrorCode,
  requestImageAlt,
} from '@eeacms/volto-eea-website-theme/helpers/imageAI';
import { isImageAIAllowed } from '@eeacms/volto-eea-website-theme/helpers/genAISettings';

import genaiSVG from '@eeacms/volto-eea-website-theme/icons/genai.svg';

import './imageAltWidget.less';

const messages = defineMessages({
  altText: {
    id: 'Alt text',
    defaultMessage: 'Alt text',
  },
  generate: {
    id: 'Generate with AI',
    defaultMessage: 'Generate with AI',
  },
  regenerate: {
    id: 'Regenerate with AI',
    defaultMessage: 'Regenerate with AI',
  },
  generateAria: {
    id: 'Generate with AI ({field})',
    defaultMessage: 'Generate with AI ({field})',
  },
  regenerateAria: {
    id: 'Regenerate with AI ({field})',
    defaultMessage: 'Regenerate with AI ({field})',
  },
  empty: {
    id: 'The AI service returned no valid alt text.',
    defaultMessage: 'The AI service returned no valid alt text.',
  },
  failed: {
    id: 'AI alt generation failed.',
    defaultMessage: 'AI alt generation failed.',
  },
  generating: {
    id: 'Generating AI alt…',
    defaultMessage: 'Generating AI alt…',
  },
  unsupported: {
    id: 'AI alt generation is unavailable for this image format.',
    defaultMessage: 'AI alt generation is unavailable for this image format.',
  },
  tooLarge: {
    id: 'The image is too large for AI alt generation.',
    defaultMessage: 'The image is too large for AI alt generation.',
  },
  confirmHeader: {
    id: 'Regenerate AI alt?',
    defaultMessage: 'Regenerate AI alt?',
  },
  confirmContent: {
    id: 'This will overwrite the current custom alt text with a freshly generated one.',
    defaultMessage:
      'This will overwrite the current custom alt text with a freshly generated one.',
  },
  cancel: { id: 'Cancel', defaultMessage: 'Cancel' },
  cancelAria: {
    id: 'Cancel AI alt generation ({field})',
    defaultMessage: 'Cancel AI alt generation ({field})',
  },
  retry: { id: 'Retry', defaultMessage: 'Retry' },
  retryAria: {
    id: 'Retry AI alt generation ({field})',
    defaultMessage: 'Retry AI alt generation ({field})',
  },
  useMetadata: {
    id: 'Use Image metadata',
    defaultMessage: 'Use Image metadata',
  },
  inherited: {
    id: 'Using linked Image metadata',
    defaultMessage: 'Using linked Image metadata',
  },
  customAlt: {
    id: 'Custom alt',
    defaultMessage: 'Custom alt',
  },
  externalWarning: {
    id: 'This external image needs custom alt text.',
    defaultMessage: 'This external image needs custom alt text.',
  },
});

const idleWorkflow = {
  status: 'idle',
  errorMessage: null,
  confirmedForValue: null,
};

/* -------------------------------------------------------------------------- */
/* Widget Helpers                                                             */
/* -------------------------------------------------------------------------- */

const selectBlockFormData = (state, block) => {
  const global = state?.form?.global;
  if (!global) return undefined;
  if (global.blocks?.[block]) return global.blocks[block];
  const blocks = Object.values(global).find(
    (entry) => entry && typeof entry === 'object' && entry[block],
  );
  return blocks?.[block];
};

const getGenerationErrorMessage = (error, intl) => {
  const code = readImageAIErrorCode(error);
  if (code === 'unsupported_media_type') {
    return intl.formatMessage(messages.unsupported);
  }
  if (code === 'image_too_large') {
    return intl.formatMessage(messages.tooLarge);
  }
  return intl.formatMessage(messages.failed);
};

/* -------------------------------------------------------------------------- */
/* AI Alt Generation Hook                                                     */
/* -------------------------------------------------------------------------- */

const useImageAltGeneration = ({
  enabled,
  isReadOnly,
  block,
  id,
  blockUrl,
  target,
  language,
  value,
  altSource,
  imageMetadata,
  customHasValue,
  onChange,
  intl,
}) => {
  const [workflow, setWorkflow] = useState(idleWorkflow);
  const requestRef = useRef(null);
  const triggerButtonRef = useRef(null);
  const cancelButtonRef = triggerButtonRef;
  const retryButtonRef = useRef(null);
  const pendingFocusRef = useRef(null);

  const latestContext = useRef(null);
  latestContext.current = {
    enabled,
    isReadOnly,
    block,
    id,
    blockUrl,
    target,
    language,
    value,
    altSource,
    imageMetadata,
    customHasValue,
    onChange,
  };

  const invalidateRequest = () => {
    const record = requestRef.current;
    requestRef.current = null;
    abortImageAIRequest(record?.request);
  };

  const resetWorkflow = () => {
    pendingFocusRef.current = null;
    invalidateRequest();
    setWorkflow(idleWorkflow);
  };

  useEffect(() => () => invalidateRequest(), []);

  // Context changes (target, field, policy, read-only) invalidate any
  // pending request and never move keyboard focus.
  useEffect(() => {
    resetWorkflow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockUrl, target, block, id, enabled, isReadOnly]);

  // Manual or external edits cancel the pending request so a stale
  // result can never overwrite newer content.
  useEffect(() => {
    if (requestRef.current) {
      pendingFocusRef.current = null;
      invalidateRequest();
    }
    setWorkflow((current) =>
      current.status === 'idle' ? current : idleWorkflow,
    );
  }, [value, altSource]);

  useEffect(() => {
    const desired = pendingFocusRef.current;
    if (!desired) return;
    if (
      (desired === 'cancel' || desired === 'trigger') &&
      triggerButtonRef.current &&
      !triggerButtonRef.current.disabled
    ) {
      triggerButtonRef.current.focus();
      pendingFocusRef.current = null;
    } else if (
      desired === 'retry' &&
      workflow.status === 'failed' &&
      retryButtonRef.current
    ) {
      retryButtonRef.current.focus();
      pendingFocusRef.current = null;
    }
  }, [workflow.status]);

  const isCurrentRequest = (record) => {
    const current = latestContext.current;
    return (
      requestRef.current === record &&
      current.enabled &&
      !current.isReadOnly &&
      Boolean(current.target) &&
      record.snapshot.block === current.block &&
      record.snapshot.id === current.id &&
      record.snapshot.blockUrl === current.blockUrl &&
      record.snapshot.target === current.target &&
      record.snapshot.value === current.value &&
      record.snapshot.altSource === current.altSource
    );
  };

  const startGeneration = async () => {
    const snapshot = latestContext.current;
    if (!snapshot.enabled || snapshot.isReadOnly || !snapshot.target) return;

    invalidateRequest();
    const confirmedForValue = snapshot.customHasValue ? snapshot.value : null;
    const record = { request: null, snapshot };
    requestRef.current = record;
    pendingFocusRef.current = 'cancel';
    setWorkflow({
      status: 'generating',
      errorMessage: null,
      confirmedForValue,
    });

    try {
      const request = requestImageAlt(snapshot.blockUrl, snapshot.language);
      record.request = request;
      const response = await request;
      if (!isCurrentRequest(record)) return;
      requestRef.current = null;
      const alt = response?.alt;
      if (typeof alt === 'string' && alt.trim() !== '') {
        const current = latestContext.current;
        applyAltChange({
          id: current.id,
          nextAlt: alt,
          imageMetadata: current.imageMetadata,
          onChange: current.onChange,
        });
        pendingFocusRef.current = 'trigger';
        setWorkflow(idleWorkflow);
      } else {
        pendingFocusRef.current = 'retry';
        setWorkflow({
          status: 'failed',
          errorMessage: intl.formatMessage(messages.empty),
          confirmedForValue,
        });
      }
    } catch (error) {
      if (!isCurrentRequest(record)) return;
      requestRef.current = null;
      pendingFocusRef.current = 'retry';
      setWorkflow({
        status: 'failed',
        errorMessage: getGenerationErrorMessage(error, intl),
        confirmedForValue,
      });
    } finally {
      if (requestRef.current === record) {
        requestRef.current = null;
      }
    }
  };

  const requestGenerate = () => {
    const current = latestContext.current;
    if (
      !current.enabled ||
      current.isReadOnly ||
      !current.target ||
      workflow.status === 'generating'
    ) {
      return;
    }
    if (current.customHasValue) {
      setWorkflow({ ...idleWorkflow, status: 'confirming' });
    } else {
      startGeneration();
    }
  };

  const confirmOverwrite = () => {
    if (workflow.status === 'generating') return;
    pendingFocusRef.current = 'cancel';
    startGeneration();
  };

  const cancelConfirm = () => {
    if (workflow.status === 'generating') return;
    pendingFocusRef.current = 'trigger';
    setWorkflow(idleWorkflow);
  };

  const cancelGeneration = () => {
    pendingFocusRef.current = 'trigger';
    invalidateRequest();
    setWorkflow(idleWorkflow);
  };

  const retryGeneration = () => {
    const current = latestContext.current;
    if (
      !current.enabled ||
      current.isReadOnly ||
      !current.target ||
      workflow.status === 'generating'
    ) {
      return;
    }
    if (
      current.customHasValue &&
      workflow.confirmedForValue !== current.value
    ) {
      setWorkflow({ ...idleWorkflow, status: 'confirming' });
    } else {
      startGeneration();
    }
  };

  return {
    workflow,
    isGenerating: workflow.status === 'generating',
    triggerButtonRef,
    cancelButtonRef,
    retryButtonRef,
    resetWorkflow,
    requestGenerate,
    confirmOverwrite,
    cancelConfirm,
    cancelGeneration,
    retryGeneration,
  };
};

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

const ImageAltStatus = ({
  isGenerating,
  effectiveSource,
  imageMetadata,
  customHasValue,
  showUseMetadata,
  isReadOnly,
  onUseMetadata,
}) => {
  const intl = useIntl();
  const provenanceLabel =
    effectiveSource === 'image-metadata' && imageMetadata
      ? intl.formatMessage(messages.inherited)
      : customHasValue
        ? intl.formatMessage(messages.customAlt)
        : null;

  return (
    <div
      className="image-alt-status"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {isGenerating ? (
        <span className="image-alt-status-generating">
          {intl.formatMessage(messages.generating)}
        </span>
      ) : (
        <>
          {provenanceLabel ? (
            <span className="image-alt-provenance">{provenanceLabel}</span>
          ) : null}
          {showUseMetadata ? (
            <button
              type="button"
              className="image-alt-link-button image-alt-use-title"
              disabled={isReadOnly || isGenerating}
              onClick={onUseMetadata}
            >
              {intl.formatMessage(messages.useMetadata)}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
};

const ImageAltErrorFeedback = ({
  errorMessage,
  canRetry,
  isReadOnly,
  fieldLabel,
  retryButtonRef,
  onRetry,
}) => {
  const intl = useIntl();
  if (!errorMessage) return null;

  return (
    <div className="image-alt-feedback image-alt-feedback-error" role="alert">
      <span className="image-alt-error-text">{errorMessage}</span>
      {canRetry ? (
        <button
          ref={retryButtonRef}
          type="button"
          className="image-alt-link-button image-alt-retry-button"
          disabled={isReadOnly}
          aria-label={intl.formatMessage(messages.retryAria, {
            field: fieldLabel,
          })}
          onClick={onRetry}
        >
          {intl.formatMessage(messages.retry)}
        </button>
      ) : null}
    </div>
  );
};

const ImageAltActions = ({
  isGenerating,
  isReadOnly,
  customHasValue,
  fieldLabel,
  triggerButtonRef,
  onGenerate,
  onCancel,
}) => {
  const intl = useIntl();
  const triggerAriaMessage = isGenerating
    ? messages.cancelAria
    : customHasValue
      ? messages.regenerateAria
      : messages.generateAria;
  const triggerTextMessage = isGenerating
    ? messages.cancel
    : customHasValue
      ? messages.regenerate
      : messages.generate;

  return (
    <div className="image-alt-actions">
      <button
        ref={triggerButtonRef}
        type="button"
        className={cx('ui tiny basic primary button image-alt-ai-button', {
          disabled: isReadOnly,
        })}
        disabled={isReadOnly}
        aria-busy={isGenerating}
        aria-label={intl.formatMessage(triggerAriaMessage, {
          field: fieldLabel,
        })}
        onClick={isGenerating ? onCancel : onGenerate}
      >
        {isGenerating ? (
          <span className="image-alt-spinner" aria-hidden="true" />
        ) : (
          <Icon name={genaiSVG} size="14px" />
        )}
        <span>{intl.formatMessage(triggerTextMessage)}</span>
      </button>
      <GenAISettings
        isDisabled={isReadOnly || isGenerating}
        className="image-alt-settings-button"
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Widget                                                                */
/* -------------------------------------------------------------------------- */

const ImageAltWidget = (props) => {
  const {
    id,
    title,
    value,
    onChange,
    block,
    formData,
    isDisabled,
    disabled,
    className,
  } = props;
  const intl = useIntl();
  const reduxBlockData = useSelector((state) =>
    selectBlockFormData(state, block),
  );
  const language = useSelector((state) => state.intl?.locale || 'en');
  // The existing alt endpoint supports standard Image targets only.
  const imageAIEnabled = useSelector((state) =>
    isImageAIAllowed(state, 'Image'),
  );

  const isReadOnly = Boolean(isDisabled || disabled);
  const blockData = formData || reduxBlockData || {};
  const fieldLabel = title || intl.formatMessage(messages.altText);

  const {
    blockUrl,
    target,
    imageMetadata,
    normalizedValue,
    altSource,
    customHasValue,
    effectiveSource,
    displayedValue,
    showUseMetadata,
    showExternalWarning,
  } = deriveAltDisplayState({ blockData, value });

  const {
    workflow,
    isGenerating,
    triggerButtonRef,
    cancelButtonRef,
    retryButtonRef,
    resetWorkflow,
    requestGenerate,
    confirmOverwrite,
    cancelConfirm,
    cancelGeneration,
    retryGeneration,
  } = useImageAltGeneration({
    enabled: imageAIEnabled,
    isReadOnly,
    block,
    id,
    blockUrl,
    target,
    language,
    value: normalizedValue,
    altSource,
    imageMetadata,
    customHasValue,
    onChange,
    intl,
  });

  const handleManualChange = (nextValue) => {
    resetWorkflow();
    applyAltChange({ id, nextAlt: nextValue, imageMetadata, onChange });
  };

  const handleUseMetadata = () => {
    if (isReadOnly || isGenerating) return;
    resetWorkflow();
    onChange(id, '');
    onChange('alt_source', 'image-metadata');
  };

  return (
    <FormFieldWrapper
      {...props}
      isDisabled={isReadOnly}
      className={cx('textarea', 'image-alt-widget', className)}
    >
      <div className="image-alt-widget image-alt-widget-body">
        <TextareaWidget
          {...props}
          wrapped={false}
          error={[]}
          value={displayedValue}
          isDisabled={isReadOnly || isGenerating}
          onChange={(field, nextValue) => handleManualChange(nextValue)}
        />
        {target ? (
          <div className="image-alt-meta">
            <ImageAltStatus
              isGenerating={isGenerating}
              effectiveSource={effectiveSource}
              imageMetadata={imageMetadata}
              customHasValue={customHasValue}
              showUseMetadata={showUseMetadata}
              isReadOnly={isReadOnly}
              onUseMetadata={handleUseMetadata}
            />
            <ImageAltErrorFeedback
              errorMessage={
                workflow.status === 'failed' ? workflow.errorMessage : null
              }
              canRetry={imageAIEnabled}
              isReadOnly={isReadOnly}
              fieldLabel={fieldLabel}
              retryButtonRef={retryButtonRef}
              onRetry={retryGeneration}
            />
            {imageAIEnabled ? (
              <ImageAltActions
                isGenerating={isGenerating}
                isReadOnly={isReadOnly}
                customHasValue={customHasValue}
                fieldLabel={fieldLabel}
                triggerButtonRef={triggerButtonRef}
                cancelButtonRef={cancelButtonRef}
                onGenerate={requestGenerate}
                onCancel={cancelGeneration}
              />
            ) : null}
          </div>
        ) : null}
        {showExternalWarning ? (
          <div className="image-alt-warning" role="status" aria-live="polite">
            {intl.formatMessage(messages.externalWarning)}
          </div>
        ) : null}
        <Confirm
          className="image-ai-alt-confirm-modal"
          open={
            imageAIEnabled && !isReadOnly && workflow.status === 'confirming'
          }
          header={intl.formatMessage(messages.confirmHeader)}
          content={intl.formatMessage(messages.confirmContent)}
          cancelButton={{
            content: intl.formatMessage(messages.cancel),
          }}
          confirmButton={{
            content: intl.formatMessage(messages.regenerate),
          }}
          onCancel={cancelConfirm}
          onConfirm={confirmOverwrite}
        />
      </div>
    </FormFieldWrapper>
  );
};

export default ImageAltWidget;
