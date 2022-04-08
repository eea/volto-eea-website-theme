import React, { useCallback, useMemo } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import { startCase } from 'lodash';
import qs from 'querystring';
import { Container, Popup } from 'semantic-ui-react';
import { flattenToAppURL } from '@plone/volto/helpers';
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
  modified: {
    id: 'Modified',
    defaultMessage: 'Modified',
  },
  modified_on: {
    id: 'Modified on',
    defaultMessage: 'Modified on',
  },
});

const friendlyId = (id) => {
  if (typeof id !== 'string') return id;
  return startCase(id);
};

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
  const {
    banner = {},
    properties,
    moment,
    fluid,
    intl,
    location,
    types = [],
  } = props;
  const {
    metadata = [],
    hideContentType,
    hideCreationDate,
    hidePublishingDate,
    hideModificationDate,
    hideShareButton,
    hideDownloadButton,
    // contentType,
  } = props.data;
  // Set query parameters
  const parameters = useMemo(
    () => qs.parse(location.search.replace('?', '')) || {},
    [location],
  );
  // Set dates
  const getDate = useCallback(
    (hidden, key) => {
      return !hidden && properties[key]
        ? moment.default(properties[key])
        : null;
    },
    [moment, properties],
  );
  const creationDate = useMemo(() => getDate(hideCreationDate, 'created'), [
    getDate,
    hideCreationDate,
  ]);
  const publishingDate = useMemo(
    () => getDate(hidePublishingDate, 'effective'),
    [getDate, hidePublishingDate],
  );
  const modificationDate = useMemo(
    () => getDate(hideModificationDate, 'modified'),
    [getDate, hideModificationDate],
  );
  // Set image source
  const image = getImageSource(properties['image']);
  // Get type
  const type = useMemo(() => {
    return (
      types.filter(
        (type) =>
          flattenToAppURL(type['@id']) ===
          `/@types/${properties['@type'] || parameters.type}`,
      )[0]?.title ||
      friendlyId(properties['@type']) ||
      properties['@type'] ||
      parameters.type
    );
  }, [types, properties, parameters]);

  return (
    <Banner {...props}>
      <div
        className={image ? 'image' : ''}
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
                  type="type"
                  hidden={hideContentType}
                  // value={contentType || properties['@type'] || parameters.type}
                  value={type}
                />
                <Banner.MetadataField
                  type="date"
                  label={intl.formatMessage(messages.created)}
                  value={creationDate}
                  title={`${intl.formatMessage(messages.created_on)} {}`}
                />
                <Banner.MetadataField
                  type="date"
                  label={intl.formatMessage(messages.published)}
                  value={publishingDate}
                  title={`${intl.formatMessage(messages.published_on)} {}`}
                />
                <Banner.MetadataField
                  type="date"
                  label={intl.formatMessage(messages.modified)}
                  value={modificationDate}
                  title={`${intl.formatMessage(messages.modified_on)} {}`}
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
  connect((state) => {
    return {
      types: state.types.types,
    };
  }),
)(withRouter(View));
