/**
 * ADUserGroupSelectWidget component.
 * @module components/manage/Widgets/ADUserGroupSelectWidget
 */

import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { Popup } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';
import { getSharing } from '@plone/volto/actions/sharing/sharing';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';

import checkSVG from '@plone/volto/icons/check.svg';
import checkBlankSVG from '@plone/volto/icons/check-blank.svg';
import userSVG from '@plone/volto/icons/user.svg';
import groupSVG from '@plone/volto/icons/group.svg';

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
  user: {
    id: 'User',
    defaultMessage: 'User',
  },
  group: {
    id: 'Group',
    defaultMessage: 'Group',
  },
});

export const normalizeSharingEntry = (entry, intl) => {
  if (!entry) return entry;

  const token = entry.id || entry.login || 'no-value';
  const label = entry.title || entry.login || token;
  const type = entry.type || 'user';

  return {
    value: token,
    label: `${label}${
      entry.login && entry.login !== label ? ` (${entry.login})` : ''
    }`,
    type: type,
    email: entry.email || entry.login || label,
    originalEntry: entry,
  };
};

export const normalizeSharingChoices = (entries, intl) =>
  entries.map((entry) => normalizeSharingEntry(entry, intl));

/**
 * Custom Option component with icon and tooltip for users/groups
 */
const CustomSharingOption = injectLazyLibs('reactSelect')((props) => {
  const { Option } = props.reactSelect.components;
  const color = props.isFocused && !props.isSelected ? '#b8c6c8' : '#007bc1';
  const svgIcon =
    props.isFocused || props.isSelected ? checkSVG : checkBlankSVG;

  const { data, innerRef, innerProps } = props;
  const { label, email, type } = data;
  const typeIcon = type === 'user' ? userSVG : groupSVG;

  return (
    <Option {...props}>
      <div ref={innerRef} {...innerProps}>
        <Popup
          content={email}
          position="top center"
          trigger={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Icon
                  name={typeIcon}
                  size="16px"
                  color="#666"
                  title={type === 'user' ? 'User' : 'Group'}
                />
                <span>{label}</span>
              </div>
              <Icon name={svgIcon} size="20px" color={color} />
            </div>
          }
        />
      </div>
    </Option>
  );
});

/**
 * Custom MultiValue component to show user/group icons
 */
const CustomMultiValue = injectLazyLibs('reactSelect')((props) => {
  const { MultiValue } = props.reactSelect.components;
  const { data } = props;
  const typeIcon = data.type === 'user' ? userSVG : groupSVG;

  return (
    <MultiValue {...props}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Icon name={typeIcon} size="12px" color="#666" />
        <span>{data.label}</span>
      </div>
    </MultiValue>
  );
});

/**
 * ADUserGroupSelectWidget component class.
 * @class ADUserGroupSelectWidget
 * @extends Component
 */
class ADUserGroupSelectWidget extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    required: PropTypes.bool,
    error: PropTypes.arrayOf(PropTypes.string),
    getSharing: PropTypes.func.isRequired,
    value: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    ),
    onChange: PropTypes.func.isRequired,
    wrapped: PropTypes.bool,
    isDisabled: PropTypes.bool,
    placeholder: PropTypes.string,
    pathname: PropTypes.string,
  };

  static defaultProps = {
    description: null,
    required: false,
    error: [],
    value: null,
    pathname: '',
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      searchLength: 0,
      entriesCache: [],
    };
  }

  componentDidMount() {
    // Initialize with empty search to get some default entries if needed
    if (this.props.value && this.props.value.length > 0) {
      this.fetchAvailableChoices('');
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { value } = this.props;

    // Cache any selected values that come from props
    if (
      value?.length > 0 &&
      prevProps.value !== value &&
      this.state.entriesCache.length === 0
    ) {
      // Convert value to entries format if they're simple strings
      const valueEntries = value.map((val) => {
        if (typeof val === 'string') {
          return { id: val, title: val, type: 'user' };
        }
        return val;
      });

      this.setState((state) => ({
        entriesCache: [...state.entriesCache, ...valueEntries],
      }));
    }
  }

  componentWillUnmount() {
    if (this.timeoutRef.current) {
      clearTimeout(this.timeoutRef.current);
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

    // Update cache with selected entries
    if (selectedOption) {
      this.setState((state) => ({
        entriesCache: [
          ...state.entriesCache.filter(
            (cached) =>
              !selectedOption.find((selected) => selected.value === cached.id),
          ),
          ...selectedOption.map(
            (option) =>
              option.originalEntry || {
                id: option.value,
                title: option.label,
                type: option.type || 'user',
              },
          ),
        ],
      }));
    }
  }

  timeoutRef = React.createRef();
  // How many characters to hold off searching from. Search starts at this plus one.
  SEARCH_HOLDOFF = 2;

  loadOptions = (query) => {
    // Implement a debounce of 400ms and a min search of 3 chars
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
    try {
      // Use the same sharing endpoint as the Sharing component
      const baseUrl = this.props.pathname
        ? getBaseUrl(this.props.pathname)
        : '/';
      const response = await this.props.getSharing(baseUrl, query);

      // The response should contain entries from the sharing data
      const entries = response?.entries || [];

      // Update local cache
      this.setState((state) => ({
        entriesCache: [
          ...state.entriesCache.filter(
            (cached) => !entries.find((entry) => entry.id === cached.id),
          ),
          ...entries,
        ],
      }));

      return normalizeSharingChoices(entries, this.props.intl);
    } catch (error) {
      console.error('Error fetching users/groups:', error);
      return [];
    }
  };

  render() {
    // Normalize selected values using cached entries
    const selectedOption =
      this.props.value
        ?.map((val) => {
          const cached = this.state.entriesCache.find(
            (entry) =>
              entry.id === val ||
              entry.id === val?.value ||
              entry.id === val?.id,
          );

          if (cached) {
            return normalizeSharingEntry(cached, this.props.intl);
          }

          // Fallback for values not in cache
          if (typeof val === 'string') {
            return {
              value: val,
              label: val,
              type: 'user',
              email: val,
              originalEntry: { id: val, title: val, type: 'user' },
            };
          }

          return normalizeSharingEntry(val, this.props.intl);
        })
        .filter(Boolean) || [];

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
            ...(this.state.entriesCache?.length > 25 && { MenuList }),
            MultiValue: CustomMultiValue,
            ClearIndicator,
            DropdownIndicator,
            Option: CustomSharingOption,
          }}
          value={selectedOption}
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

export default compose(
  injectIntl,
  injectLazyLibs(['reactSelectAsync']),
  connect(
    (state, props) => ({
      pathname: props.pathname || state.router?.location?.pathname || '/',
      entries: state.sharing?.data?.entries || [],
    }),
    { getSharing },
  ),
)(ADUserGroupSelectWidget);
