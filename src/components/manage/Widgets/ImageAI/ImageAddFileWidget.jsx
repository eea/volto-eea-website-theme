import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Confirm } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import cx from 'classnames';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import FileWidget from '@plone/volto/components/manage/Widgets/FileWidget';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';
import ImageMetadataConsentModal from './ImageMetadataConsentModal';
import GenAISettings from '@eeacms/volto-eea-website-theme/components/manage/GenAISettings/GenAISettings';
import { isImageAIAllowed } from '@eeacms/volto-eea-website-theme/helpers/genAISettings';
import {
  abortImageAIRequest,
  isSupportedImage,
  isImageUpload,
  readImageAIErrorCode,
  requestImageMetadata,
  requestImageMetadataRegeneration,
} from '@eeacms/volto-eea-website-theme/helpers/imageAI';
import genaiSVG from '@eeacms/volto-eea-website-theme/icons/genai.svg';
import './imageAIFileWidget.less';

const messages = defineMessages({
  generate: {
    id: 'Generate with AI',
    defaultMessage: 'Generate with AI',
  },
  regenerate: {
    id: 'Regenerate with AI',
    defaultMessage: 'Regenerate with AI',
  },
  scopeNote: {
    id: "Updates this item's title and description.",
    defaultMessage: "Updates this item's title and description.",
  },
  confirmHeader: {
    id: 'Replace Image metadata?',
    defaultMessage: 'Replace Image metadata?',
  },
  confirmContent: {
    id: 'AI generation will replace the current title and description. You can edit the generated values before saving.',
    defaultMessage:
      'AI generation will replace the current title and description. You can edit the generated values before saving.',
  },
  cancel: { id: 'Cancel', defaultMessage: 'Cancel' },
});

const idleWorkflow = { status: 'idle', source: null, errorCode: null };

const ImageAddFileWidget = (props) => {
  const { id, value, onChange, isDisabled, disabled, className } = props;
  const isReadOnly = Boolean(isDisabled || disabled);
  const location = useLocation();
  const intl = useIntl();
  const language = useSelector((state) => state.intl?.locale || 'en');
  const globalFormData = useSelector((state) => state.form?.global || {});
  const content = useSelector((state) => state.content?.data);
  const formData = props.formData || globalFormData;
  const isAdd = location.pathname.endsWith('/add');
  const type = isAdd
    ? new URLSearchParams(location.search).get('type')
    : content?.['@type'] || formData?.['@type'];
  const imageAIEnabled = useSelector((state) => isImageAIAllowed(state, type));
  const latestContext = useRef(null);
  latestContext.current = {
    enabled: imageAIEnabled,
    isReadOnly,
    pathname: location.pathname,
    type,
    id,
    isAdd,
    language,
    value,
    title: formData?.title,
    description: formData?.description,
    onChange,
  };
  const [workflow, setWorkflowState] = useState(idleWorkflow);
  const [metadataGenerated, setMetadataGenerated] = useState(false);
  const workflowRef = useRef(idleWorkflow);
  const requestRef = useRef(null);

  function setWorkflow(next) {
    workflowRef.current = next;
    setWorkflowState(next);
  }

  function invalidateRequest() {
    const record = requestRef.current;
    requestRef.current = null;
    abortImageAIRequest(record?.request);
  }

  function applyNewSelection(source) {
    if (source?.kind === 'newSelection' && isImageUpload(source.image)) {
      const current = latestContext.current;
      if (current.isReadOnly) return;
      current.onChange(current.id, source.image);
    }
  }

  useEffect(() => () => invalidateRequest(), []);

  useEffect(() => {
    invalidateRequest();
    setWorkflow(idleWorkflow);
    setMetadataGenerated(false);
  }, [location.pathname, type, id]);

  useEffect(() => {
    invalidateRequest();
    setWorkflow(idleWorkflow);
  }, [value]);

  useEffect(() => {
    if (isReadOnly) {
      invalidateRequest();
      setWorkflow(idleWorkflow);
    }
  }, [isReadOnly]);

  useEffect(() => {
    if (!imageAIEnabled) {
      invalidateRequest();
      const { source } = workflowRef.current;
      setWorkflow(idleWorkflow);
      // Context/value resets above discard obsolete selections before release.
      applyNewSelection(source);
    }
  }, [imageAIEnabled]);

  const handlePassthroughChange = (field, image) => {
    if (latestContext.current.isReadOnly) return;
    onChange(field, image);
  };

  if (!imageAIEnabled) {
    return (
      <FileWidget
        {...props}
        isDisabled={isReadOnly}
        onChange={handlePassthroughChange}
      />
    );
  }

  const selectFile = (field, image) => {
    invalidateRequest();
    if (latestContext.current.isReadOnly) {
      setWorkflow(idleWorkflow);
      return;
    }
    if (!image) {
      setWorkflow(idleWorkflow);
      setMetadataGenerated(false);
      onChange(field, image);
      return;
    }
    setWorkflow({
      status: 'choice',
      source: { kind: 'newSelection', image },
      errorCode: null,
    });
  };

  const startAnalysis = async (source) => {
    invalidateRequest();
    const snapshot = latestContext.current;
    const image = source?.image;
    if (!snapshot.enabled || snapshot.isReadOnly || !image) return;
    if (image['content-type'] && !isSupportedImage(image)) return;

    const record = { request: null, snapshot, source };
    requestRef.current = record;
    setWorkflow({ status: 'analyzing', source, errorCode: null });
    const isCurrentRequest = () => {
      const current = latestContext.current;
      return (
        requestRef.current === record &&
        current.enabled &&
        !current.isReadOnly &&
        record.snapshot.pathname === current.pathname &&
        record.snapshot.type === current.type &&
        record.snapshot.id === current.id &&
        record.snapshot.value === current.value &&
        workflowRef.current.source === record.source
      );
    };

    try {
      record.request = snapshot.isAdd
        ? requestImageMetadata(
            getBaseUrl(snapshot.pathname),
            image,
            snapshot.language,
            snapshot.type,
          )
        : requestImageMetadataRegeneration(
            getBaseUrl(snapshot.pathname),
            snapshot.id,
            snapshot.language,
            image,
          );
      const metadata = await record.request;
      if (!isCurrentRequest()) return;
      const current = latestContext.current;
      if (
        snapshot.title !== current.title ||
        snapshot.description !== current.description
      ) {
        setWorkflow({
          status: 'failed',
          source,
          errorCode: 'metadata_changed',
        });
        return;
      }
      requestRef.current = null;
      setWorkflow(idleWorkflow);
      applyNewSelection(source);
      current.onChange('title', metadata.title);
      current.onChange('description', metadata.description);
      setMetadataGenerated(true);
    } catch (error) {
      if (!isCurrentRequest()) return;
      setWorkflow({
        status: 'failed',
        source,
        errorCode: readImageAIErrorCode(error),
      });
    } finally {
      if (requestRef.current === record) requestRef.current = null;
    }
  };

  const useWithoutAI = () => {
    invalidateRequest();
    const { source } = workflowRef.current;
    setWorkflow(idleWorkflow);
    if (latestContext.current.isReadOnly) return;
    applyNewSelection(source);
    setMetadataGenerated(false);
  };

  const cancel = () => {
    invalidateRequest();
    setWorkflow(idleWorkflow);
  };

  const requestRegeneration = () => {
    invalidateRequest();
    const current = latestContext.current;
    if (!current.enabled || current.isReadOnly) return;
    const source = { kind: 'currentValue', image: current.value };
    if (current.title || current.description) {
      setWorkflow({ status: 'confirming', source, errorCode: null });
    } else {
      startAnalysis(source);
    }
  };

  const generationMessage =
    !isAdd || metadataGenerated ? messages.regenerate : messages.generate;
  const isUnsupportedValue =
    Boolean(value?.['content-type']) && !isSupportedImage(value);
  const isActionDisabled = isReadOnly || isUnsupportedValue;
  const scopeNoteId = `field-${id}-ai-scope`;

  return (
    <FormFieldWrapper
      {...props}
      isDisabled={isReadOnly}
      className={cx('file', 'image-ai-file-widget', className)}
    >
      <div className="image-ai-file-widget image-ai-file-widget-body">
        <FileWidget
          {...props}
          wrapped={false}
          error={[]}
          isDisabled={isReadOnly}
          onChange={selectFile}
        />
        {value ? (
          <div className="image-ai-file-meta">
            <div className="image-ai-file-actions">
              <button
                type="button"
                className={cx(
                  'ui tiny basic primary button image-ai-file-button',
                  {
                    disabled: isActionDisabled,
                  },
                )}
                disabled={isActionDisabled}
                aria-busy={workflow.status === 'analyzing'}
                aria-describedby={scopeNoteId}
                onClick={requestRegeneration}
              >
                <Icon name={genaiSVG} size="14px" ariaHidden={true} />
                <span>{intl.formatMessage(generationMessage)}</span>
              </button>
              <GenAISettings
                isDisabled={isReadOnly || workflow.status === 'analyzing'}
                className="image-ai-settings-button"
              />
            </div>
            <p id={scopeNoteId} className="image-ai-file-scope">
              {intl.formatMessage(messages.scopeNote)}
            </p>
          </div>
        ) : null}
        <ImageMetadataConsentModal
          state={
            isReadOnly || workflow.status === 'confirming'
              ? idleWorkflow
              : workflow
          }
          supported={
            Boolean(workflow.source?.image) &&
            (!workflow.source.image['content-type'] ||
              isSupportedImage(workflow.source.image))
          }
          canUpload={
            workflow.source?.kind === 'newSelection' &&
            isImageUpload(workflow.source.image)
          }
          editing={!isAdd}
          willReplaceMetadata={Boolean(
            formData?.title || formData?.description,
          )}
          onGenerate={() => startAnalysis(workflowRef.current.source)}
          onWithoutAI={useWithoutAI}
          onCancel={cancel}
        />
        <Confirm
          open={!isReadOnly && workflow.status === 'confirming'}
          header={intl.formatMessage(messages.confirmHeader)}
          content={intl.formatMessage(messages.confirmContent)}
          cancelButton={intl.formatMessage(messages.cancel)}
          confirmButton={intl.formatMessage(generationMessage)}
          onCancel={cancel}
          onConfirm={() => startAnalysis(workflowRef.current.source)}
        />
      </div>
    </FormFieldWrapper>
  );
};

ImageAddFileWidget.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  formData: PropTypes.object,
  isDisabled: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default ImageAddFileWidget;
