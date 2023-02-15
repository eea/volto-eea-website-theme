/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Edit image block.
 * @module components/manage/Blocks/Image/Edit
 */

import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { readAsDataURL } from 'promise-file-reader';
import {
  Button,
  Dimmer,
  Input,
  Loader,
  Message,
  Icon as IconSemantic,
} from 'semantic-ui-react';
import { defineMessages, injectIntl } from 'react-intl';
import loadable from '@loadable/component';
import cx from 'classnames';

import { Icon, ImageSidebar, SidebarPortal } from '@plone/volto/components';
import { createContent, getContent } from '@plone/volto/actions';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';

import {
  flattenToAppURL,
  getBaseUrl,
  withBlockExtensions,
} from '@plone/volto/helpers';
import { setImageSize } from '@eeacms/volto-eea-website-theme/helpers';
import { LazyLoadComponent } from 'react-lazy-load-image-component';

import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import navTreeSVG from '@plone/volto/icons/nav.svg';
import aheadSVG from '@plone/volto/icons/ahead.svg';
import uploadSVG from '@plone/volto/icons/upload.svg';

import './style.less';

const Dropzone = loadable(() => import('react-dropzone'));

const messages = defineMessages({
  ImageBlockInputPlaceholder: {
    id: 'Browse the site, drop an image, or type an URL',
    defaultMessage: 'Browse the site, drop an image, or type an URL',
  },
});

const Edit = (props) => {
  const [uploading, setUploading] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [dragging, setDragging] = React.useState(false);
  const [scaledImage, setScaledImage] = React.useState('');
  const [viewLoaded, setViewLoaded] = React.useState(false);

  React.useEffect(() => {
    if (props.request.loading && props.request.loaded && uploading) {
      setUploading(false);
      props.onChangeBlock(props.block, {
        ...props.data,
        url: props.content['@id'],
        alt: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.request.loading, props.request.loaded, uploading]);

  React.useEffect(() => {
    if (props.data.url) {
      props.getContent(flattenToAppURL(props.data.url), null, props.block);
    }
  }, [props.data.url, props.block]);

  React.useEffect(() => {
    if (props.scales) {
      const scaledImage = data?.url
        ? setImageSize(data?.url, scales, align === 'full' ? 'h' : size)
        : '';

      setScaledImage(scaledImage);
    }
  }, [props.scales, props.data.url]);

  React.useEffect(() => {
    setViewLoaded(true);
  }, []);

  const onUploadImage = (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    setUploading(true);

    readAsDataURL(file).then((data) => {
      const fields = data.match(/^data:(.*);(.*),(.*)$/);
      props.createContent(
        getBaseUrl(props.pathname),
        {
          '@type': 'Image',
          title: file.name,
          image: {
            data: fields[3],
            encoding: fields[2],
            'content-type': fields[1],
            filename: file.name,
          },
        },
        props.block,
      );
    });
  };

  const onChangeUrl = ({ target }) => {
    setUrl(target.value);
  };

  const onSubmitUrl = () => {
    props.onChangeBlock(props.block, {
      ...props.data,
      url: flattenToAppURL(url),
    });
  };

  const onDrop = (file) => {
    setUploading(true);

    readAsDataURL(file[0]).then((data) => {
      const fields = data.match(/^data:(.*);(.*),(.*)$/);
      props.createContent(
        getBaseUrl(props.pathname),
        {
          '@type': 'Image',
          title: file[0].name,
          image: {
            data: fields[3],
            encoding: fields[2],
            'content-type': fields[1],
            filename: file[0].name,
          },
        },
        props.block,
      );
    });
  };

  const onKeyDownVariantMenuForm = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onSubmitUrl();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      //   TODO: Do something on ESC key
    }
  };
  const onDragEnter = () => {
    setDragging(true);
  };
  const onDragLeave = () => {
    setDragging(false);
  };

  const { data = {}, scales = {} } = props;

  const {
    size = 'l',
    align = 'center',
    copyright,
    copyrightIcon,
    copyrightPosition,
    alt,
  } = data;

  const placeholder =
    props.data.placeholder ||
    props.intl.formatMessage(messages.ImageBlockInputPlaceholder);

  return (
    <>
      {viewLoaded && (
        <div
          className={cx(
            'block image align',
            {
              center: !Boolean(align),
            },
            align,
          )}
        >
          {scaledImage ? (
            <div className="image-block">
              {!alt && (
                <span className="alt-text-warning">
                  Alt text not set. It will default to 'image-block'. Please add
                  Alt text if you want a specific one.
                </span>
              )}
              <LazyLoadComponent>
                <img
                  height={'auto'}
                  width={align === 'center' ? '100%' : scaledImage?.width}
                  className={cx({
                    'full-width': align === 'full',
                    large: size === 'l',
                    medium: size === 'm',
                    small: size === 's',
                  })}
                  src={scaledImage?.download}
                  alt={alt || 'image-block'}
                  loading="lazy" //even if lazy is used, it's not working properly. That's why we use the LazyLoadComponent
                />
              </LazyLoadComponent>
              <div className="copyright-image">
                {copyright ? (
                  <Copyright copyrightPosition={copyrightPosition}>
                    <Copyright.Icon>
                      <IconSemantic name={copyrightIcon} />
                    </Copyright.Icon>
                    <Copyright.Text>{copyright}</Copyright.Text>
                  </Copyright>
                ) : (
                  ''
                )}
              </div>
            </div>
          ) : (
            <div>
              {props.editable && (
                <Dropzone
                  noClick
                  onDrop={onDrop}
                  onDragEnter={onDragEnter}
                  onDragLeave={onDragLeave}
                  className="dropzone"
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()}>
                      <Message>
                        {dragging && <Dimmer active></Dimmer>}
                        {uploading && (
                          <Dimmer active>
                            <Loader indeterminate>Uploading image</Loader>
                          </Dimmer>
                        )}
                        <div className="no-image-wrapper">
                          <img src={imageBlockSVG} alt="" />
                          <div className="toolbar-inner">
                            <Button.Group>
                              <Button
                                basic
                                icon
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  props.openObjectBrowser();
                                }}
                              >
                                <Icon name={navTreeSVG} size="24px" />
                              </Button>
                            </Button.Group>
                            <Button.Group>
                              <label className="ui button basic icon">
                                <Icon name={uploadSVG} size="24px" />
                                <input
                                  {...getInputProps({
                                    type: 'file',
                                    onChange: onUploadImage,
                                    style: { display: 'none' },
                                  })}
                                />
                              </label>
                            </Button.Group>
                            <Input
                              onKeyDown={onKeyDownVariantMenuForm}
                              onChange={onChangeUrl}
                              placeholder={placeholder}
                              value={url}
                              onClick={(e) => {
                                e.target.focus();
                              }}
                              onFocus={(e) => {
                                props.onSelectBlock(props.id);
                              }}
                            />
                            {url && (
                              <Button.Group>
                                <Button
                                  basic
                                  className="cancel"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUrl('');
                                  }}
                                >
                                  <Icon name={clearSVG} size="30px" />
                                </Button>
                              </Button.Group>
                            )}
                            <Button.Group>
                              <Button
                                basic
                                primary
                                disabled={!url}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSubmitUrl();
                                }}
                              >
                                <Icon name={aheadSVG} size="30px" />
                              </Button>
                            </Button.Group>
                          </div>
                        </div>
                      </Message>
                    </div>
                  )}
                </Dropzone>
              )}
            </div>
          )}
          <SidebarPortal selected={props.selected}>
            <ImageSidebar {...props} />
          </SidebarPortal>
        </div>
      )}
    </>
  );
};

export default compose(
  injectIntl,
  withBlockExtensions,
  connect(
    (state, ownProps) => ({
      request: state.content.subrequests[ownProps.block] || {},
      scales: state.content.subrequests[ownProps.block]?.data?.image?.scales,
    }),
    { createContent, getContent },
  ),
)(Edit);
