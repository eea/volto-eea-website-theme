import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Segment } from 'semantic-ui-react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers/Url/Url';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import Image from '@plone/volto/components/theme/Image/Image';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import imageSVG from '@plone/volto/icons/image.svg';
import trashSVG from '@plone/volto/icons/delete.svg';

import { ImageSchema } from './schema';

const ImageSidebar = (props) => {
  const {
    blocksConfig,
    blocksErrors,
    data,
    block,
    onChangeBlock,
    navRoot,
    contentType,
  } = props;
  const intl = useIntl();
  const schema = ImageSchema({ formData: data, intl });
  const dataRef = useRef(data);
  dataRef.current = data;

  const changeField = (id, value) => {
    const nextData = {
      ...dataRef.current,
      [id]: value,
    };
    dataRef.current = nextData;
    onChangeBlock(block, nextData);
  };

  return (
    <>
      <header className="header pulled">
        <h2>
          <FormattedMessage id="Image" defaultMessage="Image" />
        </h2>
        <Button.Group>
          <Button
            title={intl.formatMessage(messages.clear)}
            type="button"
            basic
            disabled={!data.url}
            onClick={() => {
              const nextData = {
                ...dataRef.current,
                url: undefined,
                image_scales: undefined,
                image_field: undefined,
                alt_source: undefined,
                image_title: undefined,
                image_description: undefined,
                image_metadata: undefined,
                alt:
                  dataRef.current.alt_source === 'image-metadata' ||
                  dataRef.current.url?.title === dataRef.current.alt
                    ? undefined
                    : dataRef.current.alt,
              };
              dataRef.current = nextData;
              onChangeBlock(block, nextData);
            }}
          >
            <Icon name={trashSVG} size="24px" color="red" />
          </Button>
        </Button.Group>
      </header>

      <Segment
        className="sidebar-metadata-container image-sidebar"
        secondary
        attached
      >
        {data.url ? (
          <>
            <div>{(data.url?.['@id'] ?? data.url).split('/').slice(-1)[0]}</div>
            <Image
              item={
                data.image_scales
                  ? {
                      '@id': data.url,
                      image_field: data.image_field,
                      image_scales: data.image_scales,
                    }
                  : undefined
              }
              src={
                data.image_scales
                  ? undefined
                  : isInternalURL(data.url)
                    ? `${flattenToAppURL(data.url)}/@@images/image/preview`
                    : data.url
              }
              sizes="188px"
              alt={intl.formatMessage(messages.preview)}
              loading="lazy"
              responsive
              style={{ width: '50%' }}
            />
          </>
        ) : (
          <>
            <FormattedMessage
              id="No image selected"
              defaultMessage="No image selected"
            />
            <Icon name={imageSVG} size="100px" color="#b8c6c8" />
          </>
        )}
      </Segment>
      <BlockDataForm
        schema={schema}
        title={schema.title}
        onChangeField={changeField}
        onChangeBlock={onChangeBlock}
        formData={data}
        block={block}
        blocksConfig={blocksConfig}
        navRoot={navRoot}
        contentType={contentType}
        errors={blocksErrors}
      />
    </>
  );
};

ImageSidebar.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  block: PropTypes.string.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
};

export default ImageSidebar;

const messages = defineMessages({
  preview: {
    id: 'image_block_preview',
    defaultMessage: 'Image preview',
  },
  clear: {
    id: 'image_block_clear',
    defaultMessage: 'Clear image',
  },
});
