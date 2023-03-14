import React, { useCallback, useMemo, useRef } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import { startCase } from 'lodash';
import qs from 'querystring';
import { Popup, Icon } from 'semantic-ui-react';
import { flattenToAppURL } from '@plone/volto/helpers';
import Banner from '@eeacms/volto-eea-design-system/ui/Banner/Banner';
import {
  getImageSource,
  sharePage,
} from '@eeacms/volto-eea-design-system/ui/Banner/Banner';
import Copyright from '@eeacms/volto-eea-design-system/ui/Copyright/Copyright';

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
  const { banner = {}, intl, location, types = [] } = props;
  const metadata = props.metadata || props.properties;
  const popupRef = useRef(null);
  const {
    info = [],
    hideContentType,
    hideCreationDate,
    hidePublishingDate,
    hideModificationDate,
    hideShareButton,
    hideDownloadButton,
    copyright,
    copyrightIcon,
    copyrightPosition,
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
      return !hidden && metadata[key] ? metadata[key] : null;
    },
    [metadata],
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
  const image = getImageSource(metadata['image']);
  // Get type
  const type = useMemo(() => {
    return (
      types?.filter?.(
        (type) =>
          flattenToAppURL(type['@id']) ===
          `/@types/${metadata['@type'] || parameters.type}`,
      )[0]?.title ||
      friendlyId(metadata['@type']) ||
      metadata['@type'] ||
      parameters.type
    );
  }, [types, metadata, parameters]);

  return (
    <Banner {...props} image={image}>
      <Banner.Content
        actions={
          <>
            {!hideShareButton && (
              <Popup
                onMount={() => {
                  if (popupRef.current?.firstChild?.firstChild)
                    popupRef.current.firstChild.firstChild.focus();
                }}
                className="share-popup"
                content={() => (
                  <>
                    <p>{intl.formatMessage(messages.share_to)}</p>
                    <div className="actions" ref={popupRef} id="popup-content">
                      <Banner.Action
                        icon="ri-facebook-fill"
                        onClick={() => {
                          sharePage(metadata['@id'], 'facebook');
                        }}
                      />
                      <Banner.Action
                        icon="ri-twitter-fill"
                        onClick={() => {
                          sharePage(metadata['@id'], 'twitter');
                        }}
                      />
                      <Banner.Action
                        icon="ri-linkedin-fill"
                        onClick={() => {
                          sharePage(metadata['@id'], 'linkedin');
                        }}
                      />
                    </div>
                  </>
                )}
                position="bottom center"
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
        <Title config={banner.title} properties={metadata} />
        <Banner.Metadata>
          <Banner.MetadataField
            type="type"
            hidden={hideContentType}
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
          {info.map((item, index) => (
            <Banner.MetadataField
              key={`header-info-${index}`}
              value={item.description}
            />
          ))}
        </Banner.Metadata>
        {copyright ? (
          <Copyright copyrightPosition={copyrightPosition}>
            <Copyright.Icon>
              <Icon className={copyrightIcon} />
            </Copyright.Icon>
            <Copyright.Text>{copyright}</Copyright.Text>
          </Copyright>
        ) : (
          ''
        )}
      </Banner.Content>
    </Banner>
  );
};

export default compose(
  injectIntl,
  withRouter,
  connect((state) => {
    return {
      types: state.types.types,
    };
  }),
)(View);
