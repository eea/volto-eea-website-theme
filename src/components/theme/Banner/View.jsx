import React, { useState, useMemo } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Container } from 'semantic-ui-react';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import Banner from './Banner';
import { getImageSource, ShareModal } from './Banner';

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
  const [share, setShare] = useState(false);
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
                    icon="share"
                    title="Share"
                    className="share"
                    onClick={() => {
                      setShare(true);
                    }}
                  />
                )}
                {!hideDownloadButton && (
                  <Banner.Action
                    icon="download"
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
            <ShareModal
              open={share}
              setOpen={setShare}
              url={content['@id']}
              title={content['title']}
            />
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
