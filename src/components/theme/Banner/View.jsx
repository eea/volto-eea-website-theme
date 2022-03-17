import React, { useMemo } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Container, Popup } from 'semantic-ui-react';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import Banner from './Banner';
import { getImageSource, sharePage } from './Banner';

import './styles.less';

const View = (props) => {
  const { content, moment } = props;
  const {
    metadata = [],
    hideContentType,
    hidePublishingDate,
    hideCreationDate,
    hideShareButton,
    hideDownloadButton,
    dateFormat,
    contentType,
  } = props.data;
  const publishingDate = useMemo(
    () => (content['effective'] ? moment.default(content['effective']) : null),
    [content, moment],
  );
  const creationDate = useMemo(
    () => (content['created'] ? moment.default(content['created']) : null),
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
                  <Popup
                    className="share-popup"
                    content={() => (
                      <>
                        <p>Share to:</p>
                        <div className="actions">
                          <Banner.Action
                            icon="ri-facebook-fill"
                            color="blue"
                            onClick={() => {
                              sharePage(content['@id'], 'facebook');
                            }}
                          />
                          <Banner.Action
                            icon="ri-twitter-fill"
                            color="blue"
                            onClick={() => {
                              sharePage(content['@id'], 'twitter');
                            }}
                          />
                          <Banner.Action
                            icon="ri-linkedin-fill"
                            color="blue"
                            onClick={() => {
                              sharePage(content['@id'], 'linkedin');
                            }}
                          />
                        </div>
                      </>
                    )}
                    position="top center"
                    size="small"
                    trigger={
                      <Banner.Action
                        icon="ri-share-fill"
                        title="Share"
                        className="share"
                        onClick={() => {}}
                      />
                    }
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
                hidden={hideCreationDate}
                type="date"
                label="Created"
                value={creationDate}
                title="Created on {}"
                format={dateFormat}
              />
              <Banner.MetadataField
                hidden={hidePublishingDate}
                type="date"
                label="Published"
                value={publishingDate}
                title="Published on {}"
                format={dateFormat}
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
