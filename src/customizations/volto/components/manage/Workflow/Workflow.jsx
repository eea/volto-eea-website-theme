/**
 * Workflow component.
 * @module components/manage/Workflow/Workflow
 */

import { FormFieldWrapper, Icon, Toast } from '@plone/volto/components';
import {
  flattenToAppURL,
  getCurrentStateMapping,
  getWorkflowOptions,
} from '@plone/volto/helpers';
import { uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { compose } from 'redux';

import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';

import {
  getContent,
  getWorkflow,
  transitionWorkflow,
} from '@plone/volto/actions';

import checkSVG from '@plone/volto/icons/check.svg';
import downSVG from '@plone/volto/icons/down-key.svg';
import upSVG from '@plone/volto/icons/up-key.svg';

const messages = defineMessages({
  messageUpdated: {
    id: 'Workflow updated.',
    defaultMessage: 'Workflow updated.',
  },
  notAllowedToUpdateWorkflow: {
    id: 'notAllowedToUpdateWorkflow',
    defaultMessage: 'Please fill out all the required fields',
  },
  messageNoWorkflow: {
    id: 'No workflow',
    defaultMessage: 'No workflow',
  },
  state: {
    id: 'State',
    defaultMessage: 'State',
  },
});

const filter_remaining_steps = (values, key) => {
  return values.filter((value) => {
    const is_not_ready = !value.is_ready;
    if (!is_not_ready) {
      return false;
    }
    const states = value.states;
    const required_for_all = states?.indexOf('all') !== -1;
    return (
      (is_not_ready && required_for_all) ||
      (is_not_ready && states?.indexOf(key) !== -1)
    );
  });
};

const SingleValue = injectLazyLibs('reactSelect')(({ children, ...props }) => {
  const stateDecorator = {
    marginRight: '10px',
    display: 'inline-block',
    backgroundColor: props.selectProps.value.color || null,
    content: ' ',
    height: '10px',
    width: '10px',
    borderRadius: '50%',
  };
  const { SingleValue } = props.reactSelect.components;
  return (
    <SingleValue {...props}>
      <span style={stateDecorator} />
      {children}
    </SingleValue>
  );
});

const Option = injectLazyLibs('reactSelect')((props) => {
  const stateDecorator = {
    marginRight: '10px',
    display: 'inline-block',
    backgroundColor:
      props.selectProps.value.value === props.data.value
        ? props.selectProps.value.color
        : null,
    content: ' ',
    height: '10px',
    width: '10px',
    borderRadius: '50%',
    border:
      props.selectProps.value.value !== props.data.value
        ? `1px solid ${props.data.color}`
        : null,
  };

  const { Option } = props['reactSelect'].components;
  return (
    <Option {...props}>
      <span style={stateDecorator} />
      <div style={{ marginRight: 'auto' }}>{props.label}</div>
      {props.isFocused && !props.isSelected && (
        <Icon name={checkSVG} size="18px" color="#b8c6c8" />
      )}
      {props.isSelected && <Icon name={checkSVG} size="18px" color="#007bc1" />}
    </Option>
  );
});

const DropdownIndicator = injectLazyLibs('reactSelect')((props) => {
  const { DropdownIndicator } = props.reactSelect.components;
  return (
    <DropdownIndicator {...props} data-testid="workflow-select-dropdown">
      {props.selectProps.menuIsOpen ? (
        <Icon name={upSVG} size="24px" color="#007bc1" />
      ) : (
        <Icon name={downSVG} size="24px" color="#007bc1" />
      )}
    </DropdownIndicator>
  );
});

const selectTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: {
    ...theme.colors,
    primary25: 'hotpink',
    primary: '#b8c6c8',
  },
});

const customSelectStyles = {
  control: (styles, state) => ({
    ...styles,
    border: 'none',
    borderBottom: '2px solid #b8c6c8',
    boxShadow: 'none',
    borderBottomStyle: state.menuIsOpen ? 'dotted' : 'solid',
  }),
  menu: (styles, state) => ({
    ...styles,
    top: null,
    marginTop: 0,
    boxShadow: 'none',
    borderBottom: '2px solid #b8c6c8',
  }),
  indicatorSeparator: (styles) => ({
    ...styles,
    width: null,
  }),
  valueContainer: (styles) => ({
    ...styles,
    padding: 0,
  }),
  option: (styles, state) => ({
    ...styles,
    backgroundColor: null,
    minHeight: '50px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 12px',
    color: state.isSelected
      ? '#007bc1'
      : state.isFocused
      ? '#4a4a4a'
      : 'inherit',
    ':active': {
      backgroundColor: null,
    },
    span: {
      flex: '0 0 auto',
    },
    svg: {
      flex: '0 0 auto',
    },
  }),
};

/**
 * Workflow container class.
 * @class Workflow
 * @extends Component
 */
class Workflow extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    getContent: PropTypes.func.isRequired,
    getWorkflow: PropTypes.func.isRequired,
    transitionWorkflow: PropTypes.func.isRequired,
    workflowLoaded: PropTypes.bool,
    loaded: PropTypes.bool.isRequired,
    pathname: PropTypes.string.isRequired,

    contentHistory: PropTypes.arrayOf(
      PropTypes.shape({
        review_state: PropTypes.string,
      }),
    ),
    transitions: PropTypes.arrayOf(
      PropTypes.shape({
        '@id': PropTypes.string,
        title: PropTypes.string,
      }),
    ),
  };

  /**
   * Default properties
   * @property {Object} defaultProps Default properties.
   * @static
   */
  static defaultProps = {
    history: [],
    transitions: [],
  };

  state = {
    selectedOption: this.props.currentStateValue,
  };

  componentDidMount() {
    this.props.getWorkflow(this.props.pathname);
  }

  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.pathname !== this.props.pathname) {
      this.props.getWorkflow(nextProps.pathname);
    }
    if (!this.props.loaded && nextProps.loaded) {
      this.props.getWorkflow(nextProps.pathname);
      this.props.getContent(nextProps.pathname);
    }
    if (!this.props.workflowLoaded && nextProps.workflowLoaded) {
      this.props.getContent(nextProps.pathname);
      // #153145 - Redirect to the newly created version
      if (this.state?.selectedOption?.value === 'createNewVersion') {
        this.props.history.push(`${nextProps.pathname}.1`);
      }
    }
  }

  /**
   * On transition handler
   * @method transition
   * @param {string} event Event object
   * @returns {undefined}
   */
  transition = (selectedOption) => {
    if (
      filter_remaining_steps(
        this.props.editingProgressSteps,
        this.props?.content?.review_state || '',
      ).length === 0
    ) {
      this.props.transitionWorkflow(flattenToAppURL(selectedOption.url));
      this.setState({ selectedOption });
      toast.success(
        <Toast
          success
          title={this.props.intl.formatMessage(messages.messageUpdated)}
          content=""
        />,
      );
    } else {
      toast.error(
        <Toast
          error
          title={this.props.intl.formatMessage(
            messages.notAllowedToUpdateWorkflow,
          )}
          content=""
        />,
      );
    }
  };

  selectValue = (option) => {
    const stateDecorator = {
      marginLeft: '10px',
      marginRight: '10px',
      display: 'inline-block',
      backgroundColor: option.color || null,
      content: ' ',
      height: '10px',
      width: '10px',
      borderRadius: '50%',
    };
    return (
      <Fragment>
        <span style={stateDecorator} />
        <span className="Select-value-label">{option.label}</span>
      </Fragment>
    );
  };

  optionRenderer = (option) => {
    const stateDecorator = {
      marginLeft: '10px',
      marginRight: '10px',
      display: 'inline-block',
      backgroundColor:
        this.props.currentStateValue.value === option.value
          ? option.color
          : null,
      content: ' ',
      height: '10px',
      width: '10px',
      borderRadius: '50%',
      border:
        this.props.currentStateValue.value !== option.value
          ? `1px solid ${option.color}`
          : null,
    };

    return (
      <Fragment>
        <span style={stateDecorator} />
        <span style={{ marginRight: 'auto' }}>{option.label}</span>
        <Icon name={checkSVG} size="24px" />
      </Fragment>
    );
  };

  render() {
    const { Placeholder } = this.props.reactSelect.components;
    const Select = this.props.reactSelect.default;
    // Remove markForDeletion transition if item is published
    // in order not to un-publish items by mistake. This transition
    // can still be executed from /contents - refs #256563, #153145
    const transitions = this.props.transitions.filter((transition) => {
      if (
        transition?.['@id']?.endsWith('markForDeletion') &&
        this.props?.content?.review_state === 'published'
      ) {
        return false;
      }
      return true;
    });

    return (
      <FormFieldWrapper
        id="state-select"
        title={this.props.intl.formatMessage(messages.state)}
        {...this.props}
      >
        <Select
          name="state-select"
          className="react-select-container"
          classNamePrefix="react-select"
          isDisabled={
            !this.props.content.review_state || transitions.length === 0
          }
          options={uniqBy(
            transitions.map((transition) => getWorkflowOptions(transition)),
            'label',
          ).concat(this.props.currentStateValue)}
          styles={customSelectStyles}
          theme={selectTheme}
          components={{
            DropdownIndicator,
            Placeholder,
            Option,
            SingleValue,
          }}
          onChange={this.transition}
          value={
            this.props.content.review_state
              ? this.props.currentStateValue
              : {
                  label: this.props.intl.formatMessage(
                    messages.messageNoWorkflow,
                  ),
                  value: 'noworkflow',
                }
          }
          isSearchable={false}
        />
      </FormFieldWrapper>
    );
  }
}

export default compose(
  injectIntl,
  injectLazyLibs(['reactSelect']),
  withRouter,
  connect(
    (state, props) => ({
      loaded: state.workflow.transition.loaded,
      content: state.content.data,
      workflowLoaded: state.workflow.get?.loaded,
      contentHistory: state.workflow.history,
      transitions: state.workflow.transitions,
      currentStateValue: getCurrentStateMapping(state.workflow.currentState),
      editingProgressSteps:
        state?.editingProgress?.editing?.loaded === true
          ? state?.editingProgress?.result?.steps
          : [],
    }),
    { getContent, getWorkflow, transitionWorkflow },
  ),
)(Workflow);
