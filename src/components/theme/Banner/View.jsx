import React, { useMemo } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Container } from 'semantic-ui-react';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import Banner from './Banner';
import { getImageSource } from './Banner';

const View = (props) => {
  const { content, moment } = props;
  const {
    metadata = [],
    hideContentType,
    hidePublishingDate,
    hideModificationDate,
    hideReadingTime,
    hideShareButton,
    hideDownloadButton,
    dateFormat,
    contentType,
  } = props.data;
  const publishingDate = useMemo(
    () => (content['effective'] ? moment.default(content['effective']) : null),
    [content, moment],
  );
  const modificationDate = useMemo(
    () => (content['modified'] ? moment.default(content['modified']) : null),
    [content, moment],
  );
  const image = getImageSource(content['image']);
  return (
    <Banner {...props}>
      <div
        className="image"
        style={image ? { backgroundImage: `url(${image})` } : {}}
      ></div>
      <div className="gradient">
        <Container>
          <Banner.Content
            actions={
              <>
                {!hideShareButton && (
                  <Banner.Action
                    icon="ri-share-fill"
                    title="Share"
                    className="share"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.setAttribute(
                        'href',
                        `https://www.facebook.com/sharer.php?u=${content['@id']}`,
                      );
                      link.setAttribute('target', '_blank');
                      link.setAttribute('rel', 'noreferrer');
                      link.click();
                    }}
                  />
                )}
                {!hideDownloadButton && (
                  <Banner.Action
                    icon="ri-arrow-down-s-line"
                    title="Download"
                    className="download"
                    onClick={() => {
                      window.print();
                    }}
                  />
                )}
              </>
            }
          >
            <Banner.Title>{content['title']}</Banner.Title>
            <Banner.Metadata>
              <Banner.MetadataField
                hidden={hideContentType}
                value={contentType || content['@type']}
              />
              <Banner.MetadataField
                hidden={hidePublishingDate}
                type="date"
                value={publishingDate}
                title="Published on {}"
                format={dateFormat}
              />
              <Banner.MetadataField
                hidden={hideModificationDate}
                type="date"
                value={modificationDate}
                title="Modified on {}"
                format={dateFormat}
              />
              <Banner.MetadataField
                hidden={hideReadingTime}
                value={'5 min read'}
              />
              {metadata.map((item, index) => (
                <Banner.MetadataField
                  key={`header-metadata-${index}`}
                  value={item.description}
                />
              ))}
            </Banner.Metadata>
          </Banner.Content>
        </Container>
      </div>
    </Banner>
  );
};

export default compose(
  injectLazyLibs(['moment']),
  connect((state) => ({
    content: state.content.data,
  })),
)(View);
