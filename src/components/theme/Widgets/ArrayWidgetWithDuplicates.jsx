/**
 * ArrayWidget component that allows duplicates.
 * @module components/manage/Widgets/ArrayWidgetWithDuplicates
 */

import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import find from 'lodash/find';
import isObject from 'lodash/isObject';

import {
  getVocabFromHint,
  getVocabFromField,
  getVocabFromItems,
} from '@plone/volto/helpers/Vocabularies/Vocabularies';
import { getVocabulary } from '@plone/volto/actions/vocabularies/vocabularies';

import {
  Option,
  DropdownIndicator,
  ClearIndicator,
  selectTheme,
  customSelectStyles,
  MenuList,
  SortableMultiValue,
  SortableMultiValueLabel,
  MultiValueContainer,
} from '@plone/volto/components/manage/Widgets/SelectStyling';

import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';

const messages = defineMessages({
  select: {
    id: 'Select…',
    defaultMessage: 'Select…',
  },
  no_value: {
    id: 'No value',
    defaultMessage: 'No value',
  },
  no_options: {
    id: 'No options',
    defaultMessage: 'No options',
  },
});

function arrayMove(array, from, to) {
  const slicedArray = array.slice();
  slicedArray.splice(
    to < 0 ? array.length + to : to,
    0,
    slicedArray.splice(from, 1)[0],
  );
  return slicedArray;
}

function normalizeArrayValue(choices, value) {
  if (!value || !Array.isArray(value)) return [];
  if (value.length === 0) return value;

  if (typeof value[0] === 'string' || typeof value[0] === 'number') {
    // raw value like ['foo', 'bar'] or [1, 2]
    return value.map((v) => {
      const stringValue = String(v);
      return {
        label: find(choices, (c) => String(c.value) === stringValue)?.label || stringValue,
        value: v,
      };
    });
  }

  if (
    isObject(value[0]) &&
    Object.keys(value[0]).includes('token') // Array of objects, w/ label+value
  ) {
    return value
      .map((v) => {
        const item = find(choices, (c) => c.value === v.token);
        return item
          ? {
              label: item.label || item.title || item.token,
              value: v.token,
            }
          : {
              // avoid a crash if choices doesn't include this item
              label: v.label,
              value: v.token,
            };
      })
      .filter((f) => !!f);
  }

  return [];
}

function normalizeChoices(choices) {
  if (Array.isArray(choices) && choices.length && Array.isArray(choices[0])) {
    return choices.map((option) => ({
      value: option[0],
      label:
        // Fix "None" on the serializer, to remove when fixed in p.restapi
        option[1] !== 'None' && option[1] ? option[1] : option[0],
    }));
  }

  return choices;
}

/**
 * ArrayWidgetWithDuplicates component class.
 * @class ArrayWidgetWithDuplicates
 * @extends Component
 */
class ArrayWidgetWithDuplicates extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    required: PropTypes.bool,
    error: PropTypes.arrayOf(PropTypes.string),
    getVocabulary: PropTypes.func.isRequired,
    choices: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    ),
    vocabLoading: PropTypes.bool,
    vocabLoaded: PropTypes.bool,
    items: PropTypes.shape({
      vocabulary: PropTypes.object,
    }),
    widgetOptions: PropTypes.shape({
      vocabulary: PropTypes.object,
    }),
    value: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    ),
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    wrapped: PropTypes.bool,
    creatable: PropTypes.bool,
  };

  /**
   * Default properties
   * @property {Object} defaultProps Default properties.
   * @static
   */
  static defaultProps = {
    description: null,
    required: false,
    items: {
      vocabulary: null,
    },
    widgetOptions: {
      vocabulary: null,
    },
    error: [],
    choices: [],
    value: null,
    creatable: false,
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs Actions
   */
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * Component did mount
   * @method componentDidMount
   * @returns {undefined}
   */
  componentDidMount() {
    if (
      !this.props.items?.choices?.length &&
      !this.props.choices?.length &&
      this.props.vocabBaseUrl
    ) {
      this.props.getVocabulary({
        vocabNameOrURL: this.props.vocabBaseUrl,
        size: -1,
        subrequest: this.props.lang,
      });
    }
  }

  componentDidUpdate() {
    if (
      !this.props.items?.choices?.length &&
      !this.props.choices?.length &&
      !this.props.vocabLoading &&
      !this.props.vocabLoaded &&
      this.props.vocabBaseUrl
    ) {
      this.props.getVocabulary({
        vocabNameOrURL: this.props.vocabBaseUrl,
        size: -1,
        subrequest: this.props.lang,
      });
    }
  }

  /**
   * Handle the field change, store it in the local state and back to simple
   * array of tokens for correct serialization
   * @method handleChange
   * @param {array} selectedOption The selected options (already aggregated).
   * @returns {undefined}
   */
  handleChange(selectedOption) {
    this.props.onChange(
      this.props.id,
      selectedOption ? selectedOption.map((item) => item.value) : null,
    );
  }

  onSortEnd = (selectedOption, { oldIndex, newIndex }) => {
    const newValue = arrayMove(selectedOption, oldIndex, newIndex);
    this.handleChange(newValue);
  };

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    // Get choices from items.choices if available, otherwise from props.choices
    const rawChoices = this.props.items?.choices || this.props?.choices || [];
    const choices = normalizeChoices(rawChoices);
    const selectedOption = normalizeArrayValue(choices, this.props.value);
    
    console.log('ArrayWidgetWithDuplicates debug:', {
      rawChoices,
      choices,
      value: this.props.value,
      selectedOption,
      items: this.props.items,
    });

    const CreatableSelect = this.props.reactSelectCreateable.default;
    const { SortableContainer } = this.props.reactSortableHOC;
    const Select = this.props.reactSelect.default;
    const SortableSelect =
      this.props?.choices &&
      !getVocabFromHint(this.props) &&
      !this.props.creatable
        ? SortableContainer(Select)
        : SortableContainer(CreatableSelect);

    return (
      <FormFieldWrapper {...this.props}>
        <SortableSelect
          useDragHandle
          // react-sortable-hoc props:
          axis="xy"
          onSortEnd={(sortProp) => {
            this.onSortEnd(selectedOption, sortProp);
          }}
          menuShouldScrollIntoView={false}
          distance={4}
          // small fix for https://github.com/clauderic/react-sortable-hoc/pull/352:
          getHelperDimensions={({ node }) => node.getBoundingClientRect()}
          id={`field-${this.props.id}`}
          aria-labelledby={`fieldset-${this.props.fieldSet}-field-label-${this.props.id}`}
          key={this.props.id}
          isDisabled={this.props.disabled || this.props.isDisabled}
          className="react-select-container"
          classNamePrefix="react-select"
          /* eslint-disable jsx-a11y/no-autofocus */
          autoFocus={this.props.focus}
          /* eslint-enable jsx-a11y/no-autofocus */
          options={
            this.props.vocabBaseUrl
              ? choices
              : rawChoices.length > 0
                ? [
                    ...choices,
                    ...(this.props.noValueOption &&
                    (this.props.default === undefined ||
                      this.props.default === null)
                      ? [
                          {
                            label: this.props.intl.formatMessage(
                              messages.no_value,
                            ),
                            value: 'no-value',
                          },
                        ]
                      : []),
                  ]
                : [
                    {
                      label: this.props.intl.formatMessage(messages.no_value),
                      value: 'no-value',
                    },
                  ]
          }
          styles={customSelectStyles}
          theme={selectTheme}
          components={{
            ...(rawChoices.length > 25 && {
              MenuList,
            }),
            MultiValueContainer,
            MultiValue: SortableMultiValue,
            MultiValueLabel: SortableMultiValueLabel,
            DropdownIndicator,
            ClearIndicator,
            Option,
          }}
          value={selectedOption || []}
          placeholder={
            this.props.placeholder ??
            this.props.intl.formatMessage(messages.select)
          }
          onChange={this.handleChange}
          // REMOVED: isValidNewOption - this allows duplicates
          // Always allow adding any option, even if it already exists
          isValidNewOption={() => true}
          // Prevent ReactSelect from hiding selected options
          hideSelectedOptions={false}
          // Allow selecting already selected options
          closeMenuOnSelect={false}
          isClearable
          isMulti
        />
      </FormFieldWrapper>
    );
  }
}

export const ArrayWidgetWithDuplicatesComponent = injectIntl(ArrayWidgetWithDuplicates);

export default compose(
  injectIntl,
  injectLazyLibs(['reactSelect', 'reactSelectCreateable', 'reactSortableHOC']),
  connect(
    (state, props) => {
      const vocabBaseUrl =
        getVocabFromHint(props) ||
        getVocabFromField(props) ||
        getVocabFromItems(props);

      const vocabState =
        state.vocabularies?.[vocabBaseUrl]?.subrequests?.[state.intl.locale];

      // If the schema already has the choices in it, then do not try to get the vocab,
      // even if there is one - and DON'T filter out selected values to allow duplicates
      if (props.items?.choices) {
        return {
          choices: props.items.choices, // Keep all choices available always
          lang: state.intl.locale,
        };
      } else if (vocabState) {
        return {
          choices: vocabState.items, // Keep all choices available always
          vocabBaseUrl,
          vocabLoading: vocabState.loading,
          vocabLoaded: vocabState.loaded,
          lang: state.intl.locale,
        };
      }
      return { vocabBaseUrl, lang: state.intl.locale };
    },
    { getVocabulary },
  ),
)(ArrayWidgetWithDuplicates);