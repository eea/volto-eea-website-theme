import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Confirm, Loader, Message } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import Api from '@plone/volto/helpers/Api/Api';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import TextareaWidget from '@plone/volto/components/manage/Widgets/TextareaWidget';
import { toApiPath } from '@eeacms/volto-eea-website-theme/helpers/toApiPath';
import {
  altMatchesImageTitle,
  effectiveImageAlt,
  readImageAIErrorCode,
  requestImageAlt,
} from '@eeacms/volto-eea-website-theme/helpers/imageAI';
import { isImageAIEnabled } from '@eeacms/volto-eea-website-theme/helpers/genAISettings';
import genaiSVG from '@eeacms/volto-eea-website-theme/icons/genai.svg';
import './imageAltWidget.less';
import '@eeacms/volto-eea-website-theme/components/manage/ImageAI/imageAIModal.less';

const messages = defineMessages({
  success: { id: 'Success', defaultMessage: 'Success' },
  warning: { id: 'Warning', defaultMessage: 'Warning' },
  error: { id: 'Error', defaultMessage: 'Error' },
  generate: { id: 'Generate AI alt', defaultMessage: 'Generate AI alt' },
  regenerate: { id: 'Regenerate AI alt', defaultMessage: 'Regenerate AI alt' },
  generated: { id: 'AI alt generated', defaultMessage: 'AI alt generated' },
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
  useTitle: {
    id: 'Use Image title',
    defaultMessage: 'Use Image title',
  },
  inherited: {
    id: 'Using linked Image title',
    defaultMessage: 'Using linked Image title',
  },
  externalWarning: {
    id: 'This external image needs custom alt text.',
    defaultMessage: 'This external image needs custom alt text.',
  },
});

const ImageAltWidget = (props) => {
  const { id, value, onChange, block, formData } = props;
  const reduxBlockData = useSelector((state) => {
    const global = state?.form?.global;
    if (!global) return undefined;
    if (global.blocks?.[block]) return global.blocks[block];
    const blocks = Object.values(global).find(
      (value) => value && typeof value === 'object' && value[block],
    );
    return blocks?.[block];
  });
  const language = useSelector((state) => state.intl?.locale || 'en');
  const imageAIEnabled = useSelector(isImageAIEnabled);
  const enabledRef = useRef(imageAIEnabled);
  enabledRef.current = imageAIEnabled;
  const blockData = formData || reduxBlockData || {};
  const blockUrl = blockData.url;
  const imageTitle = blockData.image_title || '';
  const altSource =
    blockData.alt_source || (value && value.trim() ? 'custom' : 'image-title');
  const intl = useIntl();
  const api = useRef(new Api());
  const activeGeneration = useRef(0);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const targetRef = useRef(null);
  targetRef.current = blockUrl ? toApiPath(blockUrl) : null;
  const target = targetRef.current;
  const customHasValue =
    altSource === 'custom' && typeof value === 'string' && value.trim() !== '';
  const effectiveSource =
    altSource === 'custom' && !customHasValue && imageTitle
      ? 'image-title'
      : altSource;
  const displayedValue =
    effectiveSource === 'image-title' ? imageTitle : value || '';
  const showUseTitle =
    Boolean(target && imageTitle) &&
    effectiveImageAlt(blockData) !== imageTitle;
  const showExternalWarning =
    Boolean(blockUrl && !target) &&
    !(typeof value === 'string' && value.trim());

  const setAlt = (alt) => {
    if (!alt || alt.trim() === '') {
      onChange(id, '');
      onChange('alt_source', imageTitle ? 'image-title' : 'custom');
    } else if (altMatchesImageTitle(alt, imageTitle)) {
      onChange(id, '');
      onChange('alt_source', 'image-title');
    } else {
      onChange(id, alt);
      onChange('alt_source', 'custom');
    }
  };

  useEffect(() => {
    activeGeneration.current += 1;
    setLoading(false);
    setConfirmOpen(false);
    return () => {
      activeGeneration.current += 1;
    };
  }, [blockUrl, imageAIEnabled]);

  async function generate(closeConfirmWhenDone = false) {
    const path = blockUrl ? toApiPath(blockUrl) : null;
    if (!enabledRef.current || !path || loading) return;
    const requestId = ++activeGeneration.current;
    setLoading(true);
    try {
      const response = await requestImageAlt(blockUrl, language, api.current);
      if (
        !enabledRef.current ||
        activeGeneration.current !== requestId ||
        targetRef.current !== path
      )
        return;
      const alt = response?.alt;
      if (alt && alt.trim() !== '') {
        setAlt(alt);
        toast.success(
          <Toast
            success
            title={intl.formatMessage(messages.success)}
            content={intl.formatMessage(messages.generated)}
          />,
        );
      } else {
        toast.warn(
          <Toast
            warning
            title={intl.formatMessage(messages.warning)}
            content={intl.formatMessage(messages.empty)}
          />,
        );
      }
    } catch (error) {
      if (
        !enabledRef.current ||
        activeGeneration.current !== requestId ||
        targetRef.current !== path
      )
        return;
      const code = readImageAIErrorCode(error);
      const message =
        code === 'unsupported_media_type'
          ? messages.unsupported
          : code === 'image_too_large'
            ? messages.tooLarge
            : messages.failed;
      toast.error(
        <Toast
          error
          title={intl.formatMessage(messages.error)}
          content={intl.formatMessage(message)}
        />,
      );
    } finally {
      if (activeGeneration.current === requestId) {
        setLoading(false);
        if (closeConfirmWhenDone) setConfirmOpen(false);
      }
    }
  }

  function onClickButton() {
    if (!enabledRef.current) return;
    if (customHasValue) {
      setConfirmOpen(true);
    } else {
      generate();
    }
  }

  return (
    <div className="image-alt-widget">
      <TextareaWidget
        {...props}
        value={displayedValue}
        isDisabled={loading || props.isDisabled}
        onChange={(field, nextValue) => setAlt(nextValue)}
      />
      {effectiveSource === 'image-title' && imageTitle ? (
        <Message
          size="tiny"
          info
          content={intl.formatMessage(messages.inherited)}
        />
      ) : null}
      {showExternalWarning ? (
        <Message
          size="tiny"
          warning
          content={intl.formatMessage(messages.externalWarning)}
        />
      ) : null}
      {target ? (
        <div className="image-alt-actions">
          {imageAIEnabled ? (
            <Button
              type="button"
              size="tiny"
              basic
              primary
              disabled={loading}
              loading={loading}
              onClick={onClickButton}
            >
              <Icon name={genaiSVG} size="14px" />
              <span>
                {intl.formatMessage(
                  customHasValue ? messages.regenerate : messages.generate,
                )}
              </span>
            </Button>
          ) : null}
          {showUseTitle ? (
            <Button
              type="button"
              size="tiny"
              basic
              onClick={() => {
                onChange(id, '');
                onChange('alt_source', 'image-title');
              }}
            >
              {intl.formatMessage(messages.useTitle)}
            </Button>
          ) : null}
        </div>
      ) : null}
      <Confirm
        className="image-ai-progress-modal image-ai-alt-confirm-modal"
        open={imageAIEnabled && confirmOpen}
        closeOnDimmerClick={!loading}
        closeOnEscape={!loading}
        header={intl.formatMessage(
          customHasValue ? messages.confirmHeader : messages.generate,
        )}
        content={
          loading ? (
            <Loader active inline="centered">
              {intl.formatMessage(messages.generating)}
            </Loader>
          ) : (
            intl.formatMessage(messages.confirmContent)
          )
        }
        cancelButton={{
          content: intl.formatMessage(messages.cancel),
          disabled: loading,
        }}
        confirmButton={{
          content: intl.formatMessage(
            customHasValue ? messages.regenerate : messages.generate,
          ),
          disabled: loading,
        }}
        onCancel={() => {
          if (!loading) setConfirmOpen(false);
        }}
        onConfirm={() => {
          if (!loading) generate(true);
        }}
      />
    </div>
  );
};

export default ImageAltWidget;
