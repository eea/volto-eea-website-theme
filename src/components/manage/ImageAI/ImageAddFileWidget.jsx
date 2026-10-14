import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Button, Confirm } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import FileWidget from '@plone/volto/components/manage/Widgets/FileWidget';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';
import ImageMetadataConsentModal from './ImageMetadataConsentModal';
import { isImageAIEnabled } from '@eeacms/volto-eea-website-theme/helpers/genAISettings';
import {
  abortImageAIRequest,
  createImageAIState,
  imageAIReducer,
  isSupportedImage,
  readImageAIErrorCode,
  requestImageMetadata,
} from '@eeacms/volto-eea-website-theme/helpers/imageAI';

const messages = defineMessages({
  generate: {
    id: 'Generate metadata with AI',
    defaultMessage: 'Generate metadata with AI',
  },
  regenerate: {
    id: 'Regenerate metadata with AI',
    defaultMessage: 'Regenerate metadata with AI',
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

const ImageAddFileWidget = (props) => {
  const { id, value, onChange } = props;
  const location = useLocation();
  const intl = useIntl();
  const language = useSelector((state) => state.intl?.locale || 'en');
  const imageAIEnabled = useSelector(isImageAIEnabled);
  const enabledRef = useRef(imageAIEnabled);
  enabledRef.current = imageAIEnabled;
  const globalFormData = useSelector((state) => state.form?.global || {});
  const formData = props.formData || globalFormData;
  const [aiState, setAIState] = useState(createImageAIState);
  const [metadataGenerated, setMetadataGenerated] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const requestSequence = useRef(0);
  const activeRequest = useRef(null);
  const analysisRequest = useRef(null);
  const stateRef = useRef(aiState);
  stateRef.current = aiState;

  useEffect(
    () => () => {
      activeRequest.current = null;
      abortImageAIRequest(analysisRequest.current);
      analysisRequest.current = null;
    },
    [],
  );

  const type = new URLSearchParams(location.search).get('type');
  const isImageAdd = location.pathname.endsWith('/add') && type === 'Image';

  useEffect(() => {
    if (!imageAIEnabled) {
      activeRequest.current = null;
      abortImageAIRequest(analysisRequest.current);
      analysisRequest.current = null;
      setConfirmOpen(false);
      // Preserve a selected file if capability changes while consent is open.
      const image = stateRef.current.pendingFile;
      if (image) {
        onChange(id, image);
        setAIState(createImageAIState());
      }
    }
  }, [imageAIEnabled, id, onChange]);

  if (!isImageAdd || !imageAIEnabled) return <FileWidget {...props} />;

  const updateState = (event) => {
    setAIState((state) => imageAIReducer(state, event));
  };

  const selectFile = (field, image) => {
    activeRequest.current = null;
    abortImageAIRequest(analysisRequest.current);
    analysisRequest.current = null;
    if (!image) {
      onChange(field, image);
      setMetadataGenerated(false);
      setAIState(createImageAIState());
      return;
    }
    updateState({ type: 'select', file: image });
  };

  const applyMetadata = (image, metadata) => {
    activeRequest.current = null;
    analysisRequest.current = null;
    onChange(id, image);
    onChange('title', metadata.title);
    onChange('description', metadata.description);
    setMetadataGenerated(true);
    setAIState(createImageAIState());
  };

  const analyze = async (image = stateRef.current.pendingFile) => {
    if (!enabledRef.current || !image || !isSupportedImage(image)) return;
    const requestId = `add-image-analysis-${++requestSequence.current}`;
    activeRequest.current = requestId;
    updateState({ type: 'generate', requestId });
    const request = requestImageMetadata(
      getBaseUrl(location.pathname),
      image,
      language,
    );
    analysisRequest.current = request;
    try {
      const metadata = await request;
      if (!enabledRef.current || activeRequest.current !== requestId) return;
      setAIState((state) =>
        imageAIReducer(state, {
          type: 'analysisSucceeded',
          requestId,
          metadata,
        }),
      );
      applyMetadata(image, metadata);
    } catch (error) {
      if (!enabledRef.current || activeRequest.current !== requestId) return;
      setAIState((state) =>
        imageAIReducer(state, {
          type: 'analysisFailed',
          requestId,
          errorCode: readImageAIErrorCode(error),
        }),
      );
    } finally {
      if (analysisRequest.current === request) analysisRequest.current = null;
    }
  };

  const useWithoutAI = () => {
    activeRequest.current = null;
    abortImageAIRequest(analysisRequest.current);
    analysisRequest.current = null;
    const image = stateRef.current.pendingFile;
    if (image) onChange(id, image);
    setMetadataGenerated(false);
    setAIState(createImageAIState());
  };

  const cancel = () => {
    requestSequence.current += 1;
    activeRequest.current = null;
    const request = analysisRequest.current;
    analysisRequest.current = null;
    abortImageAIRequest(request);
    setAIState(createImageAIState());
  };

  const generateCurrent = () => {
    if (!enabledRef.current || !value) return;
    const requestId = `add-image-analysis-${++requestSequence.current}`;
    activeRequest.current = requestId;
    setAIState(
      imageAIReducer(
        imageAIReducer(createImageAIState(), {
          type: 'select',
          file: value,
        }),
        { type: 'generate', requestId },
      ),
    );
    const request = requestImageMetadata(
      getBaseUrl(location.pathname),
      value,
      language,
    );
    analysisRequest.current = request;
    request
      .then((metadata) => {
        if (!enabledRef.current || activeRequest.current !== requestId) return;
        applyMetadata(value, metadata);
      })
      .catch((error) => {
        if (!enabledRef.current || activeRequest.current !== requestId) return;
        setAIState((state) =>
          imageAIReducer(state, {
            type: 'analysisFailed',
            requestId,
            errorCode: readImageAIErrorCode(error),
          }),
        );
      })
      .finally(() => {
        if (analysisRequest.current === request) analysisRequest.current = null;
      });
  };

  const requestRegeneration = () => {
    if (!enabledRef.current) return;
    if (formData?.title || formData?.description) setConfirmOpen(true);
    else generateCurrent();
  };

  return (
    <>
      <FileWidget {...props} onChange={selectFile} />
      {value ? (
        <Button
          type="button"
          basic
          primary
          size="small"
          onClick={requestRegeneration}
        >
          {intl.formatMessage(
            metadataGenerated ? messages.regenerate : messages.generate,
          )}
        </Button>
      ) : null}
      <ImageMetadataConsentModal
        state={aiState}
        supported={isSupportedImage(aiState.pendingFile)}
        willReplaceMetadata={Boolean(formData?.title || formData?.description)}
        onGenerate={() => analyze()}
        onWithoutAI={useWithoutAI}
        onCancel={cancel}
      />
      <Confirm
        open={confirmOpen}
        header={intl.formatMessage(messages.confirmHeader)}
        content={intl.formatMessage(messages.confirmContent)}
        cancelButton={intl.formatMessage(messages.cancel)}
        confirmButton={intl.formatMessage(
          metadataGenerated ? messages.regenerate : messages.generate,
        )}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          generateCurrent();
        }}
      />
    </>
  );
};

ImageAddFileWidget.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  formData: PropTypes.object,
};

export default ImageAddFileWidget;
