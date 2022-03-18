import React, { useMemo } from 'react';
import { compose } from 'redux';
import { Container, Popup } from 'semantic-ui-react';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import Banner from './Banner';
import { getImageSource, sharePage } from './Banner';

import './styles.less';

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
  const { banner = {}, properties, moment, fluid } = props;
  const {
    metadata = [],
    hideContentType,
    hidePublishingDate,
    hideCreationDate,
    hideShareButton,
    hideDownloadButton,
    contentType,
  } = props.data;
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
      ></div>
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
                        <p>Share to:</p>
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
            <Title config={banner.title} properties={properties} />
            <Banner.Metadata>
              <Banner.MetadataField
                hidden={hideContentType}
                value={contentType || properties['@type']}
              />
              <Banner.MetadataField
                hidden={hideCreationDate}
                type="date"
                label="Created"
                value={creationDate}
                title="Created on {}"
              />
              <Banner.MetadataField
                hidden={hidePublishingDate}
                type="date"
                label="Published"
                value={publishingDate}
                title="Published on {}"
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
    </Banner>
  );
};

export default compose(injectLazyLibs(['moment']))(View);
