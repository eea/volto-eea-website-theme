import React, { useCallback, useMemo, useRef } from 'react';
import { Helmet } from '@plone/volto/helpers';
import { compose } from 'redux';
import { connect, useDispatch } from 'react-redux';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import startCase from 'lodash/startCase';
import { Icon, Loader } from 'semantic-ui-react';
import Popup from '@eeacms/volto-eea-design-system/ui/Popup/Popup';
import config from '@plone/volto/registry';
import Banner from '@eeacms/volto-eea-design-system/ui/Banner/Banner';
import {
  getImageSource,
  sharePage,
} from '@eeacms/volto-eea-design-system/ui/Banner/Banner';
import Copyright from '@eeacms/volto-eea-design-system/ui/Copyright/Copyright';
import { setIsPrint } from '@eeacms/volto-eea-website-theme/actions/print';
import cx from 'classnames';
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
  published: {
    id: 'Published',
    defaultMessage: 'Published',
  },
  modified: {
    id: 'Modified',
    defaultMessage: 'Modified',
  },
  rssFeed: {
    id: 'rssFeed',
    defaultMessage: 'RSS Feed',
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
  const dispatch = useDispatch();
  const { banner = {}, intl } = props;
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
    rssLinks,
    subtitle,
    styles,
    // contentType,
  } = props.data;
  const copyrightPrefix =
    config.blocks.blocksConfig.title.copyrightPrefix || '';

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
  const type = metadata.type_title || friendlyId(metadata['@type']);

  return (
    <Banner {...props} image={image} styles={styles}>
      <Banner.Content
        actions={
          <>
            {!hideShareButton && (
              <>
                <Popup
                  className={'share-popup'}
                  trigger={
                    <Banner.Action
                      icon="ri-share-fill"
                      title={intl.formatMessage(messages.share)}
                      className="share"
                      onClick={() => {}}
                    />
                  }
                  content={
                    <>
                      <p>{intl.formatMessage(messages.share_to)}</p>
                      <div className="actions" ref={popupRef}>
                        <Banner.Action
                          icon="ri-facebook-fill"
                          title={'Share page to Facebook'}
                          titleClass={'hiddenStructure'}
                          onClick={() => {
                            sharePage(metadata['@id'], 'facebook');
                          }}
                        />
                        <Banner.Action
                          icon="ri-twitter-x-line"
                          title={'Share page to Twitter'}
                          titleClass={'hiddenStructure'}
                          onClick={() => {
                            sharePage(metadata['@id'], 'twitter');
                          }}
                        />
                        <Banner.Action
                          icon="ri-linkedin-fill"
                          title={'Share page to Linkedin'}
                          titleClass={'hiddenStructure'}
                          onClick={() => {
                            sharePage(metadata['@id'], 'linkedin');
                          }}
                        />
                      </div>
                    </>
                  }
                />
              </>
            )}
            {!hideDownloadButton && (
              <>
                <Banner.Action
                  icon="ri-download-2-fill"
                  title={intl.formatMessage(messages.download)}
                  className="download"
                  onClick={() => {
                    // set tabs to be visible
                    const tabs = document.getElementsByClassName('ui tab');
                    Array.from(tabs).forEach((tab) => {
                      tab.style.display = 'block';
                    });

                    dispatch(setIsPrint(true));
                    // display loader
                    const printLoader = document.getElementById(
                      'download-print-loader',
                    );
                    printLoader.style.display = 'flex';

                    let timeoutValue = 1000;
                    // if we have plotlycharts increase timeout
                    setTimeout(() => {
                      const plotlyCharts = document.getElementsByClassName(
                        'visualization-wrapper',
                      );
                      if (plotlyCharts.length > 0) {
                        timeoutValue = timeoutValue + 1000;
                      }
                    }, timeoutValue);

                    // scroll to iframes to make them be in the viewport
                    // use timeout to wait for load
                    setTimeout(() => {
                      const iframes = document.getElementsByTagName('iframe');
                      if (iframes.length > 0) {
                        timeoutValue = timeoutValue + 2000;
                        Array.from(iframes).forEach((element, index) => {
                          setTimeout(() => {
                            element.scrollIntoView({
                              behavior: 'instant',
                              block: 'nearest',
                              inline: 'center',
                            });
                          }, timeoutValue);
                          timeoutValue = timeoutValue + 3000;
                        });
                        timeoutValue = timeoutValue + 1000;
                      }

                      setTimeout(() => {
                        window.scrollTo({
                          top: 0,
                        });
                        Array.from(tabs).forEach((tab) => {
                          tab.style.display = '';
                        });
                        printLoader.style.display = 'none';
                        dispatch(setIsPrint(false));
                        window.print();
                      }, timeoutValue);
                    }, timeoutValue);
                  }}
                />
                <div
                  id="download-print-loader"
                  className={cx('ui warning message')}
                  style={{
                    position: 'fixed',
                    left: '40%',
                    right: '40%',
                    backgroundColor: '#fff',
                    padding: '1em',
                    display: 'none',
                    flexDirection: 'column',
                    alignItems: 'center',
                    top: '40%',
                    zIndex: '9999',
                  }}
                >
                  <Loader
                    disabled={false}
                    indeterminate
                    active
                    inline
                    size="medium"
                  ></Loader>
                  <div>Preparing download</div>
                </div>
              </>
            )}
            {rssLinks?.map((rssLink, index) => (
              <>
                <Helmet
                  link={[
                    {
                      rel: 'alternate',
                      title:
                        rssLink.title ?? intl.formatMessage(messages.rssFeed),
                      href: rssLink.href,
                      type:
                        rssLink.feedType === 'atom'
                          ? 'application/atom+xml'
                          : 'application/rss+xml',
                    },
                  ]}
                />
                <Banner.Action
                  icon="ri-rss-fill"
                  title={rssLink.title ?? intl.formatMessage(messages.rssFeed)}
                  className="rssfeed"
                  href={rssLink.href}
                  target="_blank"
                />
              </>
            ))}
          </>
        }
      >
        {subtitle && <Banner.Subtitle>{subtitle}</Banner.Subtitle>}
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
          />
          <Banner.MetadataField
            type="date"
            label={intl.formatMessage(messages.published)}
            value={publishingDate}
          />
          <Banner.MetadataField
            type="date"
            label={intl.formatMessage(messages.modified)}
            value={modificationDate}
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
            <Copyright.Prefix>{copyrightPrefix}</Copyright.Prefix>
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
      isPrint: state.isPrint,
    };
  }),
)(View);
