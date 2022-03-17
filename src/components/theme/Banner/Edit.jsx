/**
 * Edit title block.
 * @module components/manage/Blocks/Title/Edit
 */

import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { stateFromHTML } from 'draft-js-import-html';
import { isEqual } from 'lodash';
import { Map } from 'immutable';
import { Editor, DefaultDraftBlockRenderMap, EditorState } from 'draft-js';
import { defineMessages, injectIntl } from 'react-intl';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import config from '@plone/volto/registry';

import Banner from './Banner';
import { addBookmark } from './Banner';

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
      this.props.content?.['effective'] !== nextProps.content?.['effective']
    ) {
      this.setState({
        publishingDate: this.props.content['effective']
          ? this.props.moment.default(this.props.content['effective'])
          : null,
      });
    }

    if (this.props.content?.['modified'] !== nextProps.content?.['modified']) {
      this.setState({
        modificationDate: this.props.content['modified']
          ? this.props.moment.default(this.props.content['modified'])
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
    const { content, toastify } = this.props;

    const placeholder =
      this.props.data.placeholder ||
      this.props.intl.formatMessage(messages.title);

    return (
      <Banner {...this.props}>
        <Banner.Content
          actions={
            <>
              <Banner.Action
                icon="bookmark outline"
                title="Bookmark"
                className="bookmark"
                onClick={() => {
                  addBookmark(content['@id'], content['title'], toastify.toast);
                }}
              />
              <Banner.Action
                icon="download"
                title="Download"
                className="download"
                onClick={() => {
                  window.print();
                }}
              />
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
                  this.props.onFocusPreviousBlock(this.props.block, this.node);
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
            <span>{content['@type']} | </span>
            {this.state.publishingDate && (
              <span
                title={`Published on ${this.state.publishingDate.format(
                  'dddd, MMMM Do YYYY, h:mm:ss a',
                )}`}
              >
                {this.state.publishingDate.format('ddd hA')} |{' '}
              </span>
            )}
            {this.state.modificationDate && (
              <span
                title={`Modified on ${this.state.modificationDate.format(
                  'dddd, MMMM Do YYYY, h:mm:ss a',
                )}`}
              >
                {this.state.modificationDate.format('ddd hA')} |{' '}
              </span>
            )}
            <span>5 min read</span>
          </Banner.Metadata>
        </Banner.Content>
      </Banner>
    );
  }
}

export default compose(
  injectLazyLibs(['toastify', 'moment']),
  injectIntl,
  connect((state) => ({
    content: state.content.data,
  })),
)(Edit);
