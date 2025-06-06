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

/**
 * Calculate relevance score for search matching
 * @param {string} searchText - The search query
 * @param {string} title - The title to match against
 * @param {string} login - The login to match against
 * @param {string} email - The email to match against
 * @returns {number} - Higher score means better match
 */
const calculateRelevanceScore = (
  searchText,
  title = '',
  login = '',
  email = '',
) => {
  if (!searchText) return 0;

  const query = searchText.toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const loginLower = (login || '').toLowerCase();
  const emailLower = (email || '').toLowerCase();

  let score = 0;

  // Exact matches get highest score
  if (titleLower === query) score += 100;
  if (loginLower === query) score += 100;
  if (emailLower === query) score += 100;

  // Starts with matches get high score
  if (titleLower.startsWith(query)) score += 50;
  if (loginLower.startsWith(query)) score += 50;
  if (emailLower.startsWith(query)) score += 50;

  // Contains matches get medium score
  if (titleLower.includes(query)) score += 25;
  if (loginLower.includes(query)) score += 25;
  if (emailLower.includes(query)) score += 25;

  // Word boundary matches get bonus points
  const words = query.split(' ');
  words.forEach((word) => {
    if (word.length > 1) {
      const wordRegex = new RegExp(`\\b${word}`, 'i');
      if (wordRegex.test(title)) score += 15;
      if (wordRegex.test(login)) score += 15;
      if (wordRegex.test(email)) score += 15;
    }
  });

  return score;
};

/**
 * Sort entries by type (users first) and relevance
 * @param {Array} entries - Array of entries to sort
 * @param {string} searchText - Current search text
 * @returns {Array} - Sorted entries
 */
const sortEntriesByRelevance = (entries, searchText = '') => {
  return entries.sort((a, b) => {
    // First sort by type: users before groups
    const typeA = (a.type || 'user').toLowerCase();
    const typeB = (b.type || 'user').toLowerCase();

    if (typeA === 'user' && typeB === 'group') return -1;
    if (typeA === 'group' && typeB === 'user') return 1;

    // Then sort by relevance score
    const scoreA = calculateRelevanceScore(
      searchText,
      a.title || a.login,
      a.login,
      a.email,
    );
    const scoreB = calculateRelevanceScore(
      searchText,
      b.title || b.login,
      b.login,
      b.email,
    );

    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }

    // Finally, sort alphabetically by title/login
    const nameA = (a.title || a.login || '').toLowerCase();
    const nameB = (b.title || b.login || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

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

export const normalizeSharingChoices = (entries, intl, searchText = '') => {
  // Sort entries before normalizing
  const sortedEntries = sortEntriesByRelevance(entries, searchText);
  return sortedEntries.map((entry) => normalizeSharingEntry(entry, intl));
};

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
                  color={type === 'user' ? '#007bc1' : '#666'}
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
        <Icon
          name={typeIcon}
          size="12px"
          color={data.type === 'user' ? '#007bc1' : '#666'}
        />
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
      PropTypes.oneOfType([
        PropTypes.object, // Complete objects with {id, title, login, email, type}
        PropTypes.string, // Simple string IDs (backward compatibility)
      ]),
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
      currentSearchText: '', // Track current search for sorting
    };
  }

  componentDidMount() {
    // If we have values, add them to cache immediately for display
    if (this.props.value && this.props.value.length > 0) {
      this.initializeFromSavedValues();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { value } = this.props;

    // If value changed, update cache with new complete objects
    if (value?.length > 0 && prevProps.value !== value) {
      this.initializeFromSavedValues();
    }
  }

  componentWillUnmount() {
    if (this.timeoutRef.current) {
      clearTimeout(this.timeoutRef.current);
    }
  }

  /**
   * Handle the field change, store complete objects instead of just tokens
   * @method handleChange
   * @param {array} selectedOption The selected options (already aggregated).
   * @returns {undefined}
   */
  handleChange(selectedOption) {
    // Save complete objects with all necessary information
    const completeValues = selectedOption
      ? selectedOption.map((item) => ({
          id: item.value,
          value: item.value, // Keep for backward compatibility
          title: item.originalEntry?.title || item.label.split(' (')[0], // Remove login part from label
          login: item.originalEntry?.login || item.value,
          email: item.originalEntry?.email || item.email,
          type: item.type || 'user',
          label: item.label, // Keep formatted label
        }))
      : null;

    this.props.onChange(this.props.id, completeValues);

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
                title: option.label.split(' (')[0],
                login: option.value,
                email: option.email,
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

  /**
   * Initialize cache from saved complete objects
   * @method initializeFromSavedValues
   * @returns {undefined}
   */
  initializeFromSavedValues = () => {
    if (!this.props.value || this.props.value.length === 0) return;

    const savedEntries = this.props.value.map((val) => {
      // If it's already a complete object, use it
      if (typeof val === 'object' && val !== null && (val.title || val.login)) {
        return {
          id: val.id || val.value || val.login,
          title: val.title || val.login || val.id,
          login: val.login || val.id || val.value,
          email: val.email || val.login || val.id,
          type: val.type || 'user',
        };
      }

      // If it's just a string/ID, create a minimal entry
      const stringVal = typeof val === 'string' ? val : val?.id || val?.value;
      return {
        id: stringVal,
        title: stringVal,
        login: stringVal,
        email: stringVal,
        type: 'user', // Default to user
      };
    });

    this.setState((state) => ({
      entriesCache: [
        ...state.entriesCache.filter(
          (cached) => !savedEntries.find((entry) => entry.id === cached.id),
        ),
        ...savedEntries,
      ],
    }));
  };

  /**
   * Fetch details for currently selected values (fallback method)
   * @method fetchSelectedValues
   * @returns {Promise}
   */
  fetchSelectedValues = async () => {
    if (!this.props.value || this.props.value.length === 0) return;

    const valuesToFetch = this.props.value.filter((val) => {
      const valId = typeof val === 'string' ? val : val?.id || val?.value;
      return !this.state.entriesCache.find(
        (cached) =>
          cached.id === valId ||
          cached.login === valId ||
          cached.title === valId,
      );
    });

    if (valuesToFetch.length === 0) return;

    try {
      const baseUrl = this.props.pathname
        ? getBaseUrl(this.props.pathname)
        : '/';

      // Try to fetch each selected value
      const fetchPromises = valuesToFetch.map(async (val) => {
        const searchTerm =
          typeof val === 'string' ? val : val?.id || val?.value || '';
        if (!searchTerm) return null;

        try {
          const response = await this.props.getSharing(baseUrl, searchTerm);
          const entries = response?.entries || [];

          // Find exact match or best match
          let matchedEntry = entries.find(
            (entry) =>
              entry.id === searchTerm ||
              entry.login === searchTerm ||
              entry.title === searchTerm,
          );

          // If no exact match, try partial match
          if (!matchedEntry && entries.length > 0) {
            matchedEntry = entries.find(
              (entry) =>
                (entry.login &&
                  entry.login
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())) ||
                (entry.title &&
                  entry.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())) ||
                (entry.email &&
                  entry.email.toLowerCase().includes(searchTerm.toLowerCase())),
            );
          }

          return matchedEntry || null;
        } catch (error) {
          console.warn(`Error fetching details for ${searchTerm}:`, error);
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);
      const validEntries = results.filter(Boolean);

      if (validEntries.length > 0) {
        this.setState((state) => ({
          entriesCache: [
            ...state.entriesCache.filter(
              (cached) => !validEntries.find((entry) => entry.id === cached.id),
            ),
            ...validEntries,
          ],
        }));
      }
    } catch (error) {
      console.error('Error fetching selected values:', error);
    }
  };

  loadOptions = (query) => {
    // Update current search text for sorting
    this.setState({ currentSearchText: query });

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

      // Pass the current search query for proper sorting
      return normalizeSharingChoices(entries, this.props.intl, query);
    } catch (error) {
      console.error('Error fetching users/groups:', error);
      return [];
    }
  };

  render() {
    // Normalize selected values using saved complete objects or cached entries
    const selectedOption =
      this.props.value
        ?.map((val) => {
          // If val is already a complete object with title/login, use it directly
          if (
            typeof val === 'object' &&
            val !== null &&
            (val.title || val.login)
          ) {
            return {
              value: val.id || val.value || val.login,
              label:
                val.label ||
                `${val.title || val.login}${
                  val.login && val.login !== (val.title || val.login)
                    ? ` (${val.login})`
                    : ''
                }`,
              type: val.type || 'user',
              email: val.email || val.login || val.title,
              originalEntry: val,
            };
          }

          // Try to find in cache
          const valId = typeof val === 'string' ? val : val?.id || val?.value;
          const cached = this.state.entriesCache.find(
            (entry) =>
              entry.id === valId ||
              entry.login === valId ||
              entry.title === valId,
          );

          if (cached) {
            return normalizeSharingEntry(cached, this.props.intl);
          }

          // Fallback for simple string values (should be rare now)
          if (typeof val === 'string') {
            return {
              value: val,
              label: val,
              type: 'user',
              email: val,
              originalEntry: { id: val, title: val, login: val, type: 'user' },
            };
          }

          return null;
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
            this.setState({
              searchLength: search.length,
              currentSearchText: search,
            })
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
