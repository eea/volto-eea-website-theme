/**
 * SelectAutoComplete component.
 * @module components/manage/Widgets/SelectAutoComplete
 */

import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect, useSelector } from 'react-redux';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { Popup } from 'semantic-ui-react'; // Import Popup for tooltip
import {
  normalizeValue,
  normalizeChoices,
  convertValueToVocabQuery,
} from '@plone/volto/components/manage/Widgets/SelectUtils';

import {
  getVocabFromHint,
  getVocabFromField,
  getVocabFromItems,
} from '@plone/volto/helpers';
import { getVocabulary, getVocabularyTokenTitle } from '@plone/volto/actions';

import {
  ClearIndicator,
  DropdownIndicator,
  MultiValueContainer,
  selectTheme,
  customSelectStyles,
  MenuList,
} from '@plone/volto/components/manage/Widgets/SelectStyling';

import { FormFieldWrapper } from '@plone/volto/components';

const messages = defineMessages({
  select: {
    id: 'Select…',
    defaultMessage: 'Select…',
  },
  no_options: {
    id: 'No options',
    defaultMessage: 'No options',
  },
  type_text: {
    id: 'Type text...',
    defaultMessage: 'Type text...',
  },
});

/**
 * Custom Option component with a tooltip
 */
const Option = (props) => {
  const { data, innerRef, innerProps, isFocused, isSelected } = props;
  const color = isFocused && !isSelected ? '#b8c6c8' : '#007bc1';

  return (
    <Popup
      content={data.label} // Tooltip on hover
      position="top center"
      trigger={
        <div ref={innerRef} {...innerProps}>
          <span style={{ flexGrow: 1 }}>{data.label}</span>
        </div>
      }
    />
  );
};

/**
 * SelectAutoComplete component class.
 * @class SelectAutoComplete
 * @extends Component
 */
class SelectAutoComplete extends Component {
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
    items: PropTypes.shape({
      vocabulary: PropTypes.object,
    }),
    widgetOptions: PropTypes.shape({
      vocabulary: PropTypes.object,
    }),
    value: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    ),
    onChange: PropTypes.func.isRequired,
    wrapped: PropTypes.bool,
    isDisabled: PropTypes.bool,
    placeholder: PropTypes.string,
  };

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
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      searchLength: 0,
      termsPairsCache: [],
    };
  }

  componentDidMount() {
    const { id, lang, value, choices } = this.props;
    if (value && value?.length > 0) {
      const tokensQuery = convertValueToVocabQuery(
        normalizeValue(choices, value, this.props.intl),
      );

      this.props.getVocabularyTokenTitle({
        vocabNameOrURL: this.props.vocabBaseUrl,
        subrequest: `widget-${id}-${lang}`,
        ...tokensQuery,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { value, choices } = this.props;
    if (
      this.state.termsPairsCache.length === 0 &&
      value?.length > 0 &&
      choices?.length > 0
    ) {
      this.setState((state) => ({
        termsPairsCache: [...state.termsPairsCache, ...choices],
      }));
    }
  }

  handleChange(selectedOption) {
    this.props.onChange(
      this.props.id,
      selectedOption ? selectedOption.map((item) => item.value) : null,
    );
    this.setState((state) => ({
      termsPairsCache: [...state.termsPairsCache, ...selectedOption],
    }));
  }

  timeoutRef = React.createRef();
  SEARCH_HOLDOFF = 2;

  loadOptions = (query) => {
    if (query.length > this.SEARCH_HOLDOFF) {
      if (this.timeoutRef.current) clearTimeout(this.timeoutRef.current);
      return new Promise((resolve) => {
        this.timeoutRef.current = setTimeout(async () => {
          const res = await this.fetchAvailableChoices(query);
          resolve(res);
        }, 400);
      });
    } else {
      return Promise.resolve([]);
    }
  };

  fetchAvailableChoices = async (query) => {
    const resp = await this.props.getVocabulary({
      vocabNameOrURL: this.props.vocabBaseUrl,
      query,
      size: -1,
      subrequest: this.props.lang,
    });

    return normalizeChoices(resp.items || [], this.props.intl);
  };

  render() {
    const selectedOption = normalizeValue(
      this.state.termsPairsCache,
      this.props.value,
      this.props.intl,
    );
    const SelectAsync = this.props.reactSelectAsync.default;

    return (
      <FormFieldWrapper {...this.props}>
        <SelectAsync
          id={`field-${this.props.id}`}
          key={this.props.id}
          isDisabled={this.props.disabled || this.props.isDisabled}
          className="react-select-container"
          classNamePrefix="react-select"
          cacheOptions
          defaultOptions={[]}
          loadOptions={this.loadOptions}
          onInputChange={(search) =>
            this.setState({ searchLength: search.length })
          }
          noOptionsMessage={() =>
            this.props.intl.formatMessage(
              this.state.searchLength > this.SEARCH_HOLDOFF
                ? messages.no_options
                : messages.type_text,
            )
          }
          styles={customSelectStyles}
          theme={selectTheme}
          components={{
            ...(this.props.choices?.length > 25 && { MenuList }),
            MultiValueContainer,
            ClearIndicator,
            DropdownIndicator,
            Option, // Use the fixed Option component
          }}
          value={selectedOption || []}
          placeholder={
            this.props.placeholder ??
            this.props.intl.formatMessage(messages.select)
          }
          onChange={this.handleChange}
          isMulti
        />
      </FormFieldWrapper>
    );
  }
}

export const SelectAutoCompleteComponent = injectIntl(SelectAutoComplete);

export default compose(
  injectIntl,
  injectLazyLibs(['reactSelectAsync']),
  connect(
    (state, props) => {
      const vocabBaseUrl =
        getVocabFromHint(props) ||
        getVocabFromField(props) ||
        getVocabFromItems(props);

      const vocabState =
        state.vocabularies?.[vocabBaseUrl]?.subrequests?.[
          `widget-${props.id}-${state.intl.locale}`
        ]?.items;

      return props.items?.choices
        ? { choices: props.items.choices, lang: state.intl.locale }
        : vocabState
        ? {
            choices: vocabState,
            vocabBaseUrl,
            lang: state.intl.locale,
          }
        : { vocabBaseUrl, lang: state.intl.locale };
    },
    { getVocabulary, getVocabularyTokenTitle },
  ),
)(SelectAutoComplete);
