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
import { isEqual } from 'lodash';

import { Icon, ImageSidebar, SidebarPortal } from '@plone/volto/components';
import { Icon as IconSemantic } from 'semantic-ui-react';
import { withBlockExtensions } from '@plone/volto/helpers';
import { createContent } from '@plone/volto/actions';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';

import {
  flattenToAppURL,
  getBaseUrl,
  isInternalURL,
} from '@plone/volto/helpers';

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
    content: PropTypes.objectOf(PropTypes.any).isRequired,
    request: PropTypes.shape({
      loading: PropTypes.bool,
      loaded: PropTypes.bool,
    }).isRequired,
    pathname: PropTypes.string.isRequired,
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
    hovering: false,
  };

  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.props.request.loading &&
      nextProps.request.loaded &&
      this.state.uploading
    ) {
      this.setState({
        uploading: false,
      });
      this.props.onChangeBlock(this.props.block, {
        ...this.props.data,
        url: nextProps.content['@id'],
        alt: '',
      });
    }
  }

  /**
   * @param {*} nextProps
   * @returns {boolean}
   * @memberof Edit
   */
  shouldComponentUpdate(nextProps) {
    return (
      this.props.selected ||
      nextProps.selected ||
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
    this.setState({
      uploading: true,
    });
    readAsDataURL(file).then((data) => {
      const fields = data.match(/^data:(.*);(.*),(.*)$/);
      this.props.createContent(
        getBaseUrl(this.props.pathname),
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
        this.props.block,
      );
    });
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
   * Submit url handler
   * @method onSubmitUrl
   * @param {object} e Event
   * @returns {undefined}
   */
  onSubmitUrl = () => {
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      url: flattenToAppURL(this.state.url),
    });
  };

  /**
   * Drop handler
   * @method onDrop
   * @param {array} files File objects
   * @returns {undefined}
   */
  onDrop = (file) => {
    this.setState({
      uploading: true,
    });

    readAsDataURL(file[0]).then((data) => {
      const fields = data.match(/^data:(.*);(.*),(.*)$/);
      this.props.createContent(
        getBaseUrl(this.props.pathname),
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
        this.props.block,
      );
    });
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

  handleHoverEnter = () => {
    this.setState({ hovering: true });
  };

  handleHoverLeave = () => {
    this.setState({ hovering: false });
  };

  node = React.createRef();

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    const { data } = this.props;
    const placeholder =
      this.props.data.placeholder ||
      this.props.intl.formatMessage(messages.ImageBlockInputPlaceholder);
    const {
      copyright,
      copyrightIcon,
      copyrightPosition,
      size = 'l',
      url,
      align,
      alt,
    } = data;

    const showCopyrightHovering = copyright?.length > 50;

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
        {data.url ? (
          <div className="image-block">
            <img
              className={cx({
                'full-width': data.align === 'full',
                large: size === 'l',
                medium: size === 'm',
                small: size === 's',
              })}
              style={{ margin: 'unset', padding: 'unset' }}
              src={
                isInternalURL(data.url)
                  ? // Backwards compat in the case that the block is storing the full server URL
                    (() => {
                      if (size === 'l')
                        return `${flattenToAppURL(url)}/@@images/image`;
                      if (size === 'm')
                        return `${flattenToAppURL(url)}/@@images/image/preview`;
                      if (size === 's')
                        return `${flattenToAppURL(url)}/@@images/image/mini`;
                      return `${flattenToAppURL(url)}/@@images/image`;
                    })()
                  : url
              }
              alt={alt || ''}
            />
            <div
              className={cx('copyright-image-block ', {
                right: align === 'right',
              })}
            >
              {copyright && size === 'l' ? (
                <Copyright
                  copyrightPosition={
                    align === 'right'
                      ? align
                      : align === 'left'
                      ? 'left'
                      : copyrightPosition
                  }
                >
                  <Copyright.Icon
                    onMouseEnter={() =>
                      showCopyrightHovering ? this.handleHoverEnter() : ''
                    }
                    onMouseLeave={() =>
                      showCopyrightHovering ? this.handleHoverLeave() : ''
                    }
                    id="copyright-icon-hoverable"
                  >
                    <IconSemantic size="large" name={copyrightIcon} />
                  </Copyright.Icon>
                  {showCopyrightHovering ? (
                    <Copyright.Text
                      id={`copyright-hovering-text-${
                        this.state.hovering ? 'active' : 'inactive'
                      }-${
                        align === 'right'
                          ? align
                          : align === 'left'
                          ? 'left'
                          : copyrightPosition
                      }`}
                    >
                      {copyright}
                    </Copyright.Text>
                  ) : (
                    <Copyright.Text id={'copyright-text'}>
                      {copyright}
                    </Copyright.Text>
                  )}
                </Copyright>
              ) : (
                ''
              )}
            </div>
          </div>
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
                                this.props.openObjectBrowser();
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
    }),
    { createContent },
  ),
)(Edit);