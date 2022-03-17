/**
 * Edit title block.
 * @module components/manage/Blocks/Title/Edit
 */

import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { stateFromHTML } from 'draft-js-import-html';
import { isEqual } from 'lodash';
import { Map } from 'immutable';
import { Editor, DefaultDraftBlockRenderMap, EditorState } from 'draft-js';
import { Popup } from 'semantic-ui-react';
import { defineMessages, injectIntl } from 'react-intl';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import config from '@plone/volto/registry';

import Banner from './Banner';
import { getImageSource, sharePage } from './Banner';

import './styles.less';

const messages = defineMessages({
  title: {
    id: 'Type the title…',
    defaultMessage: 'Type the title…',
  },
});

const blockRenderMap = Map({
  unstyled: {
    element: 'h1',
  },
});

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);

/**
 * Edit title block class.
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
    properties: PropTypes.objectOf(PropTypes.any).isRequired,
    selected: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    onChangeField: PropTypes.func.isRequired,
    onSelectBlock: PropTypes.func.isRequired,
    onDeleteBlock: PropTypes.func.isRequired,
    onAddBlock: PropTypes.func.isRequired,
    onFocusPreviousBlock: PropTypes.func.isRequired,
    onFocusNextBlock: PropTypes.func.isRequired,
    block: PropTypes.string.isRequired,
    editable: PropTypes.bool,
  };

  /**
   * Default properties
   * @property {Object} defaultProps Default properties.
   * @static
   */
  static defaultProps = {
    editable: true,
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs WysiwygEditor
   */
  constructor(props) {
    super(props);

    if (!__SERVER__) {
      let editorState;
      if (props.properties && props.properties.title) {
        const contentState = stateFromHTML(props.properties.title);
        editorState = EditorState.createWithContent(contentState);
      } else {
        editorState = EditorState.createEmpty();
      }
      this.state = {
        editorState,
        focus: true,
        publishingDate: null,
        modificationDate: null,
      };
    }

    this.onChange = this.onChange.bind(this);
  }

  /**
   * Component did mount lifecycle method
   * @method componentDidMount
   * @returns {undefined}
   */
  componentDidMount() {
    if (this.node) {
      this.node.focus();
      this.node._onBlur = () => this.setState({ focus: false });
      this.node._onFocus = () => this.setState({ focus: true });
    }

    this.setState({
      publishingDate: this.props.properties['effective']
        ? this.props.moment.default(this.props.properties['effective'])
        : null,
      modificationDate: this.props.properties['modified']
        ? this.props.moment.default(this.props.properties['modified'])
        : null,
    });
  }

  /**
   * @param {*} nextProps
   * @returns {boolean}
   * @memberof Edit
   */
  shouldComponentUpdate(nextProps) {
    return this.props.selected || !isEqual(this.props.data, nextProps.data);
  }
  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.properties.title &&
      this.props.properties.title !== nextProps.properties.title &&
      !this.state.focus
    ) {
      const contentState = stateFromHTML(nextProps.properties.title);
      this.setState({
        editorState: nextProps.properties.title
          ? EditorState.createWithContent(contentState)
          : EditorState.createEmpty(),
      });
    }

    if (!this.props.selected && nextProps.selected) {
      this.node.focus();
      this.setState({ focus: true });
    }

    if (
      this.props.properties?.['effective'] !==
      nextProps.properties?.['effective']
    ) {
      this.setState({
        publishingDate: nextProps['effective']
          ? this.props.moment.default(nextProps['effective'])
          : null,
      });
    }

    if (
      this.props.properties?.['modified'] !== nextProps.properties?.['modified']
    ) {
      this.setState({
        modificationDate: nextProps['modified']
          ? this.props.moment.default(nextProps['modified'])
          : null,
      });
    }
  }

  /**
   * Change handler
   * @method onChange
   * @param {object} editorState Editor state.
   * @returns {undefined}
   */
  onChange(editorState) {
    this.setState({ editorState }, () => {
      this.props.onChangeField(
        'title',
        editorState.getCurrentContent().getPlainText(),
      );
    });
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    const { properties } = this.props;
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
    } = this.props.data;

    const placeholder =
      this.props.data.placeholder ||
      this.props.intl.formatMessage(messages.title);

    const image = getImageSource(properties['image']);

    return (
      <Banner {...this.props}>
        <div
          className="image"
          style={
            image
              ? {
                  backgroundImage: `url(${image})`,
                }
              : {}
          }
        ></div>
        <div className="gradient">
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
            style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
          >
            <Banner.Title>
              <Editor
                readOnly={!this.props.editable}
                onChange={this.onChange}
                editorState={this.state.editorState}
                blockRenderMap={extendedBlockRenderMap}
                handleReturn={() => {
                  if (this.props.data.disableNewBlocks) {
                    return 'handled';
                  }
                  this.props.onSelectBlock(
                    this.props.onAddBlock(
                      config.settings.defaultBlockType,
                      this.props.index + 1,
                    ),
                  );
                  return 'handled';
                }}
                placeholder={placeholder}
                onUpArrow={() => {
                  const selectionState = this.state.editorState.getSelection();
                  const { editorState } = this.state;
                  if (
                    editorState
                      .getCurrentContent()
                      .getBlockMap()
                      .first()
                      .getKey() === selectionState.getFocusKey()
                  ) {
                    this.props.onFocusPreviousBlock(
                      this.props.block,
                      this.node,
                    );
                  }
                }}
                onDownArrow={() => {
                  const selectionState = this.state.editorState.getSelection();
                  const { editorState } = this.state;
                  if (
                    editorState
                      .getCurrentContent()
                      .getBlockMap()
                      .last()
                      .getKey() === selectionState.getFocusKey()
                  ) {
                    this.props.onFocusNextBlock(this.props.block, this.node);
                  }
                }}
                ref={(node) => {
                  this.node = node;
                }}
              />
            </Banner.Title>
            <Banner.Metadata>
              <Banner.MetadataField
                hidden={hideContentType}
                value={contentType || properties['@type']}
              />
              <Banner.MetadataField
                hidden={hidePublishingDate}
                type="date"
                value={this.state.publishingDate}
                title="Published on {}"
                format={dateFormat}
              />
              <Banner.MetadataField
                hidden={hideModificationDate}
                type="date"
                value={this.state.modificationDate}
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
          </Banner.Content>
        </div>
      </Banner>
    );
  }
}

export default compose(injectLazyLibs(['moment']), injectIntl)(Edit);
