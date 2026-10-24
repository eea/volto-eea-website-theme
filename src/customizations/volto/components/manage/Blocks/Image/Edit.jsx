/**
 * Edit image block.
 * @module components/manage/Blocks/Image/Edit
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { readAsDataURL } from 'promise-file-reader';
import { Button, Dimmer, Input, Loader, Message } from 'semantic-ui-react';
import { defineMessages, injectIntl } from 'react-intl';
import loadable from '@loadable/component';
import cx from 'classnames';
import isEqual from 'lodash/isEqual';

import Icon from '@plone/volto/components/theme/Icon/Icon';
import ImageSidebar from './ImageSidebar';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import { Icon as IconSemantic } from 'semantic-ui-react';
import { createContent } from '@plone/volto/actions/content/content';
import Copyright from '@eeacms/volto-eea-design-system/ui/Copyright/Copyright';

import {
  flattenToAppURL,
  getBaseUrl,
  isInternalURL,
} from '@plone/volto/helpers/Url/Url';
import { withBlockExtensions } from '@plone/volto/helpers//Extensions';
import { validateFileUploadSize } from '@plone/volto/helpers//FormValidation/FormValidation';
import config from '@plone/volto/registry';

import ImageMetadataConsentModal from '@eeacms/volto-eea-website-theme/components/manage/Widgets/ImageAI/ImageMetadataConsentModal';
import { isImageAIAllowed } from '@eeacms/volto-eea-website-theme/helpers/genAISettings';
import {
  abortImageAIRequest,
  composeImageMetadata,
  createImageAIState,
  effectiveImageAlt,
  imageAIReducer,
  isSupportedImage,
  readImageAIErrorCode,
  requestImageMetadata,
  sameImageReference,
} from '@eeacms/volto-eea-website-theme/helpers/imageAI';

import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import navTreeSVG from '@plone/volto/icons/nav.svg';
import aheadSVG from '@plone/volto/icons/ahead.svg';
import uploadSVG from '@plone/volto/icons/upload.svg';

// please Volto 16 test
export const getImageBlockSizes = function (data) {
  if (data.align === 'full') return '100vw';
  if (data.align === 'center') {
    if (data.size === 'l') return '100vw';
    if (data.size === 'm') return '50vw';
    if (data.size === 's') return '25vw';
  }
  if (data.align === 'left' || data.align === 'right') {
    if (data.size === 'l') return '50vw';
    if (data.size === 'm') return '25vw';
    if (data.size === 's') return '15vw';
  }
  return undefined;
};

const Dropzone = loadable(() => import('react-dropzone'));

const messages = defineMessages({
  ImageBlockInputPlaceholder: {
    id: 'Browse the site, drop an image, or type an URL',
    defaultMessage: 'Browse the site, drop an image, or type an URL',
  },
  uploadingImage: {
    id: 'Uploading image',
    defaultMessage: 'Uploading image',
  },
});

/**
 * Edit image block class.
 * @class Edit
 * @extends Component
 */
class Edit extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    selected: PropTypes.bool.isRequired,
    block: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    data: PropTypes.objectOf(PropTypes.any).isRequired,
    content: PropTypes.objectOf(PropTypes.any),
    request: PropTypes.shape({
      loading: PropTypes.bool,
      loaded: PropTypes.bool,
    }).isRequired,
    pathname: PropTypes.string.isRequired,
    language: PropTypes.string,
    imageAIEnabled: PropTypes.bool,
    onChangeBlock: PropTypes.func.isRequired,
    onSelectBlock: PropTypes.func.isRequired,
    onDeleteBlock: PropTypes.func.isRequired,
    onFocusPreviousBlock: PropTypes.func.isRequired,
    onFocusNextBlock: PropTypes.func.isRequired,
    handleKeyDown: PropTypes.func.isRequired,
    createContent: PropTypes.func.isRequired,
    openObjectBrowser: PropTypes.func.isRequired,
  };

  state = {
    uploading: false,
    url: '',
    dragging: false,
    imageAI: createImageAIState(),
  };

  analysisSequence = 0;

  analysisRequest = null;

  componentWillUnmount() {
    this.analysisSequence += 1;
    const request = this.analysisRequest;
    this.analysisRequest = null;
    abortImageAIRequest(request);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.imageAIEnabled &&
      !this.props.imageAIEnabled &&
      this.state.imageAI.pendingFile &&
      !this.state.uploading
    ) {
      this.analysisSequence += 1;
      const request = this.analysisRequest;
      this.analysisRequest = null;
      abortImageAIRequest(request);
      this.createPendingImage(null);
    }
  }

  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    // Update block data after upload finished
    if (
      this.props.request.loading &&
      nextProps.request.loaded &&
      this.state.uploading
    ) {
      this.setState({
        uploading: false,
        imageAI: createImageAIState(),
      });
      const title = (nextProps.content && nextProps.content.title) || '';
      const description =
        (nextProps.content && nextProps.content.description) || '';
      const metadata = composeImageMetadata(title, description);
      this.props.onChangeBlock(this.props.block, {
        ...this.props.data,
        url: nextProps.content['@id'],
        image_field: 'image',
        image_scales: { image: [nextProps.content.image] },
        alt: '',
        alt_source: 'image-metadata',
        decorative: false,
        image_title: title,
        image_description: description,
        image_metadata: metadata,
      });
    } else if (
      this.props.request.loading &&
      nextProps.request.error &&
      this.state.uploading
    ) {
      this.setState((state) => ({
        uploading: false,
        imageAI: imageAIReducer(state.imageAI, {
          type: 'creationFailed',
          errorCode: 'generation_failed',
        }),
      }));
    }
  }

  /**
   * @param {*} nextProps
   * @returns {boolean}
   * @memberof Edit
   */
  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.selected ||
      nextProps.selected ||
      this.props.imageAIEnabled !== nextProps.imageAIEnabled ||
      !isEqual(this.state, nextState) ||
      !isEqual(this.props.data, nextProps.data)
    );
  }

  /**
   * Upload image handler (not used), but useful in case that we want a button
   * not powered by react-dropzone
   * @method onUploadImage
   * @returns {undefined}
   */
  onUploadImage = (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;
    this.queueImageForUpload(file);
    e.target.value = '';
  };

  queueImageForUpload = (file) => {
    if (!validateFileUploadSize(file, this.props.intl.formatMessage)) return;
    readAsDataURL(file).then((data) => {
      const fields = data.match(/^data:(.*);(.*),(.*)$/);
      if (!fields) return;
      const image = {
        data: fields[3],
        encoding: fields[2],
        'content-type': fields[1],
        filename: file.name,
      };
      this.setState(
        (state) => ({
          dragging: false,
          imageAI: imageAIReducer(state.imageAI, {
            type: 'select',
            file: image,
          }),
        }),
        () => {
          if (!this.props.imageAIEnabled) this.createPendingImage(null);
        },
      );
    });
  };

  analyzePendingImage = async () => {
    const image = this.state.imageAI.pendingFile;
    if (!this.props.imageAIEnabled || !image || !isSupportedImage(image))
      return;
    const requestId = `image-analysis-${++this.analysisSequence}`;
    this.setState((state) => ({
      imageAI: imageAIReducer(state.imageAI, {
        type: 'generate',
        requestId,
      }),
    }));
    const request = requestImageMetadata(
      getBaseUrl(this.props.pathname),
      image,
      this.props.language,
    );
    this.analysisRequest = request;
    try {
      const metadata = await request;
      if (
        !this.props.imageAIEnabled ||
        this.analysisRequest !== request ||
        this.state.imageAI.requestId !== requestId
      )
        return;
      this.setState(
        (state) => ({
          imageAI: imageAIReducer(state.imageAI, {
            type: 'analysisSucceeded',
            requestId,
            metadata,
          }),
        }),
        () => this.createPendingImage(metadata),
      );
    } catch (error) {
      if (!this.props.imageAIEnabled || this.analysisRequest !== request)
        return;
      this.setState((state) => ({
        imageAI: imageAIReducer(state.imageAI, {
          type: 'analysisFailed',
          requestId,
          errorCode: readImageAIErrorCode(error),
        }),
      }));
    } finally {
      if (this.analysisRequest === request) this.analysisRequest = null;
    }
  };

  createPendingImage = (metadata = this.state.imageAI.metadata) => {
    const image = this.state.imageAI.pendingFile;
    if (!image) return;
    this.setState((state) => ({
      uploading: true,
      imageAI: imageAIReducer(
        { ...state.imageAI, metadata },
        { type: 'creating' },
      ),
    }));
    this.props.createContent(
      getBaseUrl(this.props.pathname),
      {
        '@type': 'Image',
        title: metadata?.title || image.filename,
        description: metadata?.description || '',
        image,
      },
      this.props.block,
    );
  };

  uploadPendingImageWithoutAI = () => this.createPendingImage(null);

  cancelPendingImage = () => {
    this.analysisSequence += 1;
    const request = this.analysisRequest;
    this.analysisRequest = null;
    abortImageAIRequest(request);
    this.setState({ imageAI: createImageAIState(), uploading: false });
  };

  /**
   * Change url handler
   * @method onChangeUrl
   * @param {Object} target Target object
   * @returns {undefined}
   */
  onChangeUrl = ({ target }) => {
    this.setState({
      url: target.value,
    });
  };

  /**
   * Object-browser selection handler.
   * method onSelectItem
   * @param {string} url URL
   * @param {object} item Selected item
   */
  onSelectItem = (url, item) => {
    const brainTitle = item.title || item.Title || '';
    const brainDescription = item.description || item.Description || '';
    const sameImage = sameImageReference(this.props.data.url, url);
    const internal = isInternalURL(url);
    const title = internal
      ? brainTitle || (sameImage ? this.props.data.image_title : '')
      : undefined;
    const description = internal
      ? brainDescription || (sameImage ? this.props.data.image_description : '')
      : undefined;
    const metadata = internal
      ? composeImageMetadata(title, description)
      : undefined;
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      url,
      image_field: item.image_field,
      image_scales: item.image_scales,
      image_title: title,
      image_description: description,
      image_metadata: metadata,
      ...(sameImage
        ? {}
        : {
            alt: '',
            alt_source: internal ? 'image-metadata' : 'custom',
            decorative: false,
          }),
    });
  };

  /**
   * Submit url handler
   * @method onSubmitUrl
   * @param {object} e Event
   * @returns {undefined}
   */
  onSubmitUrl = () => {
    const url = flattenToAppURL(this.state.url);
    const sameImage = sameImageReference(this.props.data.url, url);
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      url,
      image_field: undefined,
      image_scales: undefined,
      ...(sameImage
        ? {}
        : {
            alt: '',
            alt_source: 'custom',
            decorative: false,
            image_title: undefined,
            image_description: undefined,
            image_metadata: undefined,
          }),
    });
  };

  /**
   * Drop handler
   * @method onDrop
   * @param {array} files File objects
   * @returns {undefined}
   */
  onDrop = (files) => {
    if (files[0]) this.queueImageForUpload(files[0]);
  };

  /**
   * Keydown handler on Variant Menu Form
   * This is required since the ENTER key is already mapped to a onKeyDown
   * event and needs to be overriden with a child onKeyDown.
   * @method onKeyDownVariantMenuForm
   * @param {Object} e Event object
   * @returns {undefined}
   */
  onKeyDownVariantMenuForm = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      this.onSubmitUrl();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      // TODO: Do something on ESC key
    }
  };
  onDragEnter = () => {
    this.setState({ dragging: true });
  };
  onDragLeave = () => {
    this.setState({ dragging: false });
  };

  node = React.createRef();

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    const Image = config.getComponent({ name: 'Image' }).component;
    const { data } = this.props;
    const placeholder =
      this.props.data.placeholder ||
      this.props.intl.formatMessage(messages.ImageBlockInputPlaceholder);
    const { copyright, copyrightIcon, copyrightPosition } = data;
    const resolvedCopyrightPosition = copyrightPosition || 'left';

    const showCopyright = data?.size === 'l' || !data.size;

    return (
      <div
        className={cx(
          'block image align',
          {
            center: !Boolean(data.align),
          },
          data.align,
        )}
      >
        <div
          className={cx(
            'image-block-container',
            {
              large: data.size === 'l',
              medium: data.size === 'm',
              small: data.size === 's',
            },
            data?.align ? data?.align : '',
          )}
        >
          {data.url ? (
            <>
              <Image
                className={cx(
                  {
                    'full-width': data.align === 'full',
                    large: data.size === 'l',
                    medium: data.size === 'm',
                    small: data.size === 's',
                  },
                  data?.styles?.objectPosition,
                )}
                item={
                  data.image_scales
                    ? {
                        '@id': data.url,
                        image_field: data.image_field,
                        image_scales: data.image_scales,
                        data: data,
                      }
                    : undefined
                }
                src={
                  data.image_scales
                    ? undefined
                    : isInternalURL(data.url)
                      ? // Backwards compat in the case that the block is storing the full server URL
                        (() => {
                          if (data.size === 'l')
                            return `${flattenToAppURL(
                              data.url,
                            )}/@@images/image/large`;
                          if (data.size === 'm')
                            return `${flattenToAppURL(
                              data.url,
                            )}/@@images/image/preview`;
                          if (data.size === 's')
                            return `${flattenToAppURL(
                              data.url,
                            )}/@@images/image/mini`;
                          return `${flattenToAppURL(
                            data.url,
                          )}/@@images/image/large`;
                        })()
                      : data.url
                }
                sizes={config.blocks.blocksConfig.image.getSizes(data)}
                alt={effectiveImageAlt(data)}
                loading="lazy"
                responsive={true}
              />
              <div className={`copyright-wrapper ${resolvedCopyrightPosition}`}>
                {copyright && showCopyright ? (
                  <Copyright copyrightPosition={resolvedCopyrightPosition}>
                    <Copyright.Icon>
                      <IconSemantic className={copyrightIcon} />
                    </Copyright.Icon>
                    <Copyright.Text>{copyright}</Copyright.Text>
                  </Copyright>
                ) : (
                  ''
                )}
              </div>
            </>
          ) : (
            <div>
              {this.props.editable && (
                <Dropzone
                  noClick
                  onDrop={this.onDrop}
                  onDragEnter={this.onDragEnter}
                  onDragLeave={this.onDragLeave}
                  className="dropzone"
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()}>
                      <Message>
                        {this.state.dragging && <Dimmer active></Dimmer>}
                        {this.state.uploading && (
                          <Dimmer active>
                            <Loader indeterminate>
                              {this.props.intl.formatMessage(
                                messages.uploadingImage,
                              )}
                            </Loader>
                          </Dimmer>
                        )}
                        <div className="no-image-wrapper">
                          {/* eslint-disable-next-line no-restricted-syntax */}
                          <img src={imageBlockSVG} alt="" />
                          <div className="toolbar-inner">
                            <Button.Group>
                              <Button
                                basic
                                icon
                                data-testid="image-block-object-browser"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  this.props.openObjectBrowser({
                                    onSelectItem: this.onSelectItem,
                                  });
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
                                    onChange: this.onUploadImage,
                                    style: { display: 'none' },
                                  })}
                                />
                              </label>
                            </Button.Group>
                            <Input
                              onKeyDown={this.onKeyDownVariantMenuForm}
                              onChange={this.onChangeUrl}
                              placeholder={placeholder}
                              value={this.state.url}
                              onClick={(e) => {
                                e.target.focus();
                              }}
                              onFocus={(e) => {
                                this.props.onSelectBlock(this.props.id);
                              }}
                            />
                            {this.state.url && (
                              <Button.Group>
                                <Button
                                  basic
                                  className="cancel"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    this.setState({ url: '' });
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
                                disabled={!this.state.url}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.onSubmitUrl();
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
        </div>
        <ImageMetadataConsentModal
          state={
            this.props.imageAIEnabled ||
            this.state.imageAI.status === 'creationFailed'
              ? this.state.imageAI
              : createImageAIState()
          }
          supported={isSupportedImage(this.state.imageAI.pendingFile)}
          onGenerate={this.analyzePendingImage}
          onWithoutAI={this.uploadPendingImageWithoutAI}
          onRetryCreation={() =>
            this.createPendingImage(this.state.imageAI.metadata)
          }
          onCancel={this.cancelPendingImage}
        />
        <SidebarPortal selected={this.props.selected}>
          <ImageSidebar {...this.props} />
        </SidebarPortal>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withBlockExtensions,
  connect(
    (state, ownProps) => ({
      request: state.content.subrequests[ownProps.block] || {},
      content: state.content.subrequests[ownProps.block]?.data,
      language: state.intl?.locale || 'en',
      imageAIEnabled: isImageAIAllowed(state, 'Image'),
    }),
    { createContent },
  ),
)(Edit);
