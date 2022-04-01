import React, { useMemo } from 'react';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import qs from 'querystring';
import { Container, Popup } from 'semantic-ui-react';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import Banner from './Banner';
import { getImageSource, sharePage } from './Banner';

import './styles.less';

const messages = defineMessages({
  share: {
    id: 'Share',
    defaultMessage: 'Share',
  },
  share_to: {
    id: 'Share to',
    defaultMessage: 'Share to',
  },
  download: {
    id: 'Download',
    defaultMessage: 'Download',
  },
  created: {
    id: 'Created',
    defaultMessage: 'Created',
  },
  created_on: {
    id: 'Created on',
    defaultMessage: 'Created on',
  },
  published: {
    id: 'Published',
    defaultMessage: 'Published',
  },
  published_on: {
    id: 'Published on',
    defaultMessage: 'Published on',
  },
});

const ContainerWrapper = ({ fluid, children }) => {
  if (fluid) return <React.Fragment>{children}</React.Fragment>;
  return <Container>{children}</Container>;
};

const Title = ({ config = {}, properties }) => {
  const view = useMemo(() => {
    return config.view;
  }, [config.view]);

  if (view) {
    return view;
  }
  return <Banner.Title>{properties['title']}</Banner.Title>;
};

const View = (props) => {
  const { banner = {}, properties, moment, fluid, intl, location } = props;
  const {
    metadata = [],
    hideContentType,
    hidePublishingDate,
    hideCreationDate,
    hideShareButton,
    hideDownloadButton,
    contentType,
  } = props.data;
  // Set query parameters
  const parameters = useMemo(
    () => qs.parse(location.search.replace('?', '')) || {},
    [location],
  );
  // Set dates
  const publishingDate = useMemo(
    () =>
      properties['effective'] ? moment.default(properties['effective']) : null,
    [properties, moment],
  );
  const creationDate = useMemo(
    () =>
      properties['created'] ? moment.default(properties['created']) : null,
    [properties, moment],
  );
  // Set image source
  const image = getImageSource(properties['image']);

  return (
    <Banner {...props}>
      <div
        className="image"
        style={image ? { backgroundImage: `url(${image})` } : {}}
      >
        <div className="gradient">
          <ContainerWrapper fluid={fluid}>
            <Banner.Content
              actions={
                <>
                  {!hideShareButton && (
                    <Popup
                      className="share-popup"
                      content={() => (
                        <>
                          <p>{intl.formatMessage(messages.share_to)}</p>
                          <div className="actions">
                            <Banner.Action
                              icon="ri-facebook-fill"
                              color="blue"
                              onClick={() => {
                                sharePage(properties['@id'], 'facebook');
                              }}
                            />
                            <Banner.Action
                              icon="ri-twitter-fill"
                              color="blue"
                              onClick={() => {
                                sharePage(properties['@id'], 'twitter');
                              }}
                            />
                            <Banner.Action
                              icon="ri-linkedin-fill"
                              color="blue"
                              onClick={() => {
                                sharePage(properties['@id'], 'linkedin');
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
                          title={intl.formatMessage(messages.share)}
                          className="share"
                          onClick={() => {}}
                        />
                      }
                    />
                  )}
                  {!hideDownloadButton && (
                    <Banner.Action
                      icon="ri-download-2-fill"
                      title={intl.formatMessage(messages.download)}
                      className="download"
                      onClick={() => {
                        window.print();
                      }}
                    />
                  )}
                </>
              }
            >
              <Title config={banner.title} properties={properties} />
              <Banner.Metadata>
                <Banner.MetadataField
                  hidden={hideContentType}
                  value={contentType || properties['@type'] || parameters.type}
                />
                <Banner.MetadataField
                  hidden={hideCreationDate}
                  type="date"
                  label={intl.formatMessage(messages.created)}
                  value={creationDate}
                  title={`${intl.formatMessage(messages.created_on)} {}`}
                />
                <Banner.MetadataField
                  hidden={hidePublishingDate}
                  type="date"
                  label={intl.formatMessage(messages.published)}
                  value={publishingDate}
                  title={`${intl.formatMessage(messages.published_on)} {}`}
                />
                {metadata.map((item, index) => (
                  <Banner.MetadataField
                    key={`header-metadata-${index}`}
                    value={item.description}
                  />
                ))}
              </Banner.Metadata>
            </Banner.Content>
          </ContainerWrapper>
        </div>
      </div>
    </Banner>
  );
};

export default compose(
  injectIntl,
  injectLazyLibs(['moment']),
)(withRouter(View));
