import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Icon, BlockDataForm } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import { LeadImageSchema } from './schema';
import imageSVG from '@plone/volto/icons/image.svg';

const LeadImageSidebar = ({ properties, data, block, onChangeBlock, intl }) => {
  const defaultValueCopyrightIcon = 'ri-copyright-line';
  const defaultValueCopyrightPosition = 'left';
  const schema = LeadImageSchema({ formData: properties, intl });

  useEffect(() => {
    if (data.copyrightIcon === '' || data.copyrightIcon === undefined)
      onChangeBlock(block, {
        ...data,
        copyrightIcon: defaultValueCopyrightIcon,
      });
    if (data.copyrightPosition === '' || data.copyrightPosition === undefined)
      onChangeBlock(block, {
        ...data,
        copyrightPosition: defaultValueCopyrightPosition,
      });
  }, [block, data, onChangeBlock]);

  return (
    <Segment.Group raised>
      <header className="header pulled">
        <h2>
          <FormattedMessage id="Lead Image" defaultMessage="Lead Image" />
        </h2>
      </header>

      {!properties.image && (
        <>
          <Segment className="sidebar-metadata-container" secondary>
            <FormattedMessage
              id="No image set in Lead Image content field"
              defaultMessage="No image set in Lead Image content field"
            />
            <Icon name={imageSVG} size="100px" color="#b8c6c8" />
          </Segment>
        </>
      )}
      {properties.image && (
        <>
          <Segment className="sidebar-metadata-container" secondary>
            {properties.image.filename}
            <img
              src={
                properties.image.data
                  ? `data:${properties.image['content-type']};base64,${properties.image.data}`
                  : flattenToAppURL(properties.image.scales.mini.download)
              }
              alt={properties.image_caption || ''}
            />
          </Segment>
          <BlockDataForm
            schema={schema}
            title={schema.title}
            onChangeField={(id, value) => {
              onChangeBlock(block, {
                ...data,
                [id]: value,
              });
            }}
            onChangeBlock={onChangeBlock}
            formData={data}
            block={block}
          />
        </>
      )}
    </Segment.Group>
  );
};

LeadImageSidebar.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  block: PropTypes.string.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
  openObjectBrowser: PropTypes.func.isRequired,
  onChangeField: PropTypes.func.isRequired,
};

export default injectIntl(LeadImageSidebar);
