import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Confirm } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import Api from '@plone/volto/helpers/Api/Api';
import { getBlocksFieldname } from '@plone/volto/helpers/Blocks/Blocks';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import TextareaWidget from '@plone/volto/components/manage/Widgets/TextareaWidget';
import { toApiPath } from '../../../helpers/toApiPath';
import { stripAiMarkers } from '../../../customizations/volto/components/manage/Blocks/Image/aiSummary';
import genaiSVG from '../../../icons/genai.svg';
import './imageAltWidget.less';

const messages = defineMessages({
  generate: { id: 'Generate AI alt', defaultMessage: 'Generate AI alt' },
  regenerate: { id: 'Regenerate AI alt', defaultMessage: 'Regenerate AI alt' },
  generated: { id: 'AI alt generated', defaultMessage: 'AI alt generated' },
  empty: { id: 'Empty alt returned', defaultMessage: 'Empty alt returned' },
  failed: {
    id: 'Alt generation failed: {error}',
    defaultMessage: 'Alt generation failed: {error}',
  },
  confirmHeader: {
    id: 'Regenerate AI alt?',
    defaultMessage: 'Regenerate AI alt?',
  },
  confirmContent: {
    id: 'This will overwrite the current alt text with a freshly generated one.',
    defaultMessage:
      'This will overwrite the current alt text with a freshly generated one.',
  },
  cancel: { id: 'Cancel', defaultMessage: 'Cancel' },
});

/**
 * Edit widget for the image block alt field: the standard textarea plus a
 * button that generates an AI alt for the linked Image object via the
 * preview-only POST @llm-summary endpoint (the object itself is not
 * modified). The generated text is marker-stripped and written to the
 * block-local alt.
 *
 * The linked block is resolved from the `block` prop (the block id, passed
 * by the block form) and the in-progress form data in redux
 * (`state.form.global.blocks`); the button is only shown when the block url
 * resolves to an internal application url (external images have no Image
 * object to summarize).
 */
const ImageAltWidget = (props) => {
  const { id, value, onChange, block } = props;
  const blockData = useSelector((state) => {
    const global = state?.form?.global;
    if (!global) return undefined;
    const blocksFieldname = getBlocksFieldname(global);
    return blocksFieldname ? global[blocksFieldname]?.[block] : undefined;
  });
  const blockUrl = blockData?.url;
  const intl = useIntl();
  const api = useRef(new Api());
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Track the latest target so a stale response (the linked image changed
  // while the request was in flight) is discarded.
  const targetRef = useRef(null);
  targetRef.current = blockUrl ? toApiPath(blockUrl) : null;
  const target = targetRef.current;

  const hasValue = typeof value === 'string' && value.trim() !== '';

  async function generate() {
    const path = blockUrl ? toApiPath(blockUrl) : null;
    if (!path || loading) return;
    setLoading(true);
    try {
      const response = await api.current.post(`${path}/@llm-summary`);
      // Discard stale responses: the linked image changed mid-request.
      if (targetRef.current !== path) return;
      const alt = stripAiMarkers(response?.llm_summary);
      if (alt && alt.trim() !== '') {
        onChange(id, alt);
        toast.success(intl.formatMessage(messages.generated));
      } else {
        toast.warn(intl.formatMessage(messages.empty));
      }
    } catch (err) {
      const detail = err?.response?.body?.error || err?.message || String(err);
      toast.error(intl.formatMessage(messages.failed, { error: detail }));
    } finally {
      setLoading(false);
    }
  }

  function onClickButton() {
    if (hasValue) {
      setConfirmOpen(true);
    } else {
      generate();
    }
  }

  return (
    <div className="image-alt-widget">
      <TextareaWidget {...props} />
      {target ? (
        <div className="image-alt-actions">
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
                hasValue ? messages.regenerate : messages.generate,
              )}
            </span>
          </Button>
        </div>
      ) : null}
      <Confirm
        open={confirmOpen}
        header={intl.formatMessage(messages.confirmHeader)}
        content={intl.formatMessage(messages.confirmContent)}
        cancelButton={intl.formatMessage(messages.cancel)}
        confirmButton={intl.formatMessage(messages.regenerate)}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          generate();
        }}
      />
    </div>
  );
};

export default ImageAltWidget;
