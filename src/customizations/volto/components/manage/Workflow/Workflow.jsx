import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { uniqBy } from 'lodash';
import { toast } from 'react-toastify';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Icon, Toast } from '@plone/volto/components';
import { FormFieldWrapper } from '@plone/volto/components';
import {
  flattenToAppURL,
  getWorkflowOptions,
  getCurrentStateMapping,
} from '@plone/volto/helpers';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';

import {
  getContent,
  getWorkflow,
  transitionWorkflow,
} from '@plone/volto/actions';
import downSVG from '@plone/volto/icons/down-key.svg';
import upSVG from '@plone/volto/icons/up-key.svg';
import checkSVG from '@plone/volto/icons/check.svg';

const messages = defineMessages({
  messageUpdated: {
    id: 'Workflow updated.',
    defaultMessage: 'Workflow updated.',
  },
  messageNoWorkflow: {
    id: 'No workflow',
    defaultMessage: 'No workflow',
  },
  notAllowedToUpdateWorkflow: {
    id: 'notAllowedToUpdateWorkflow',
    defaultMessage: 'Please fill out all the required fields',
  },
  state: {
    id: 'State',
    defaultMessage: 'State',
  },
});

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

function useWorkflow() {
  const history = useSelector((state) => state.workflow.history, shallowEqual);
  const transitions = useSelector(
    (state) => state.workflow.transitions,
    shallowEqual,
  );
  const editingProgressSteps = useSelector((state) =>
    state?.editingProgress?.editing?.loaded === true
      ? state?.editingProgress?.result?.steps
      : [],
  );
  const workflowLoaded = useSelector((state) => state.workflow.get?.loaded);
  const loaded = useSelector((state) => state.workflow.transition.loaded);
  const currentStateValue = useSelector(
    (state) => getCurrentStateMapping(state.workflow.currentState),
    shallowEqual,
  );

  return {
    loaded,
    history,
    transitions,
    currentStateValue,
    workflowLoaded,
    editingProgressSteps,
  };
}

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

const Workflow = (props) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useDispatch();
  const {
    loaded,
    currentStateValue,
    transitions,
    workflowLoaded,
    editingProgressSteps,
  } = useWorkflow();
  const content = useSelector((state) => state.content?.data, shallowEqual);
  const [selectedOption, setSelectedOption] = React.useState(currentStateValue);
  const { pathname } = props;

  useEffect(() => {
    dispatch(getWorkflow(pathname));
    dispatch(getContent(pathname));
  }, [dispatch, pathname, loaded]);

  const transition = (selectedOption) => {
    if (
      filter_remaining_steps(
        editingProgressSteps,
        props?.content?.review_state || '',
      ).length === 0
    ) {
      dispatch(transitionWorkflow(flattenToAppURL(selectedOption.url)));
      setSelectedOption(selectedOption);
      toast.success(
        <Toast
          success
          title={intl.formatMessage(messages.messageUpdated)}
          content=""
        />,
      );
    } else {
      toast.error(
        <Toast
          error
          title={intl.formatMessage(messages.notAllowedToUpdateWorkflow)}
          content=""
        />,
      );
    }
  };

  useEffect(() => {
    if (
      selectedOption?.value === 'createNewVersion' &&
      workflowLoaded &&
      loaded
    ) {
      history.push(`${pathname}.1`);
    }
  }, [history, pathname, selectedOption?.value, workflowLoaded, loaded]);

  const { Placeholder } = props.reactSelect.components;
  const Select = props.reactSelect.default;

  const filterd_transitions = transitions.filter((transition) => {
    if (
      transition?.['@id']?.endsWith('markForDeletion') &&
      props.content?.review_state === 'published'
    ) {
      return false;
    }
    return true;
  });

  return (
    <FormFieldWrapper
      id="state-select"
      title={intl.formatMessage(messages.state)}
      intl={intl}
      {...props}
    >
      <Select
        name="state-select"
        className="react-select-container"
        classNamePrefix="react-select"
        isDisabled={!content.review_state || filterd_transitions.length === 0}
        options={uniqBy(
          filterd_transitions.map((transition) =>
            getWorkflowOptions(transition),
          ),
          'label',
        ).concat(currentStateValue)}
        styles={customSelectStyles}
        theme={selectTheme}
        components={{
          DropdownIndicator,
          Placeholder,
          Option,
          SingleValue,
        }}
        onChange={transition}
        value={
          content.review_state
            ? currentStateValue
            : {
                label: intl.formatMessage(messages.messageNoWorkflow),
                value: 'noworkflow',
              }
        }
        isSearchable={false}
      />
    </FormFieldWrapper>
  );
};

Workflow.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default compose(injectLazyLibs(['reactSelect']))(Workflow);
