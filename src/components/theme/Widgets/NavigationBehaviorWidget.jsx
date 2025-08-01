import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { Icon, FormFieldWrapper } from '@plone/volto/components';
import ObjectWidget from '@plone/volto/components/manage/Widgets/ObjectWidget';
import { Accordion, Button, Segment, Form, Dropdown } from 'semantic-ui-react';
import { getNavigation } from '@plone/volto/actions';
import { defineMessages, useIntl } from 'react-intl';
import config from '@plone/volto/registry';

import upSVG from '@plone/volto/icons/up-key.svg';
import downSVG from '@plone/volto/icons/down-key.svg';

const messages = defineMessages({
  loadNavigationRoutes: {
    id: 'Load Main Navigation Routes',
    defaultMessage: 'Load Main Navigation Routes',
  },
  hideChildrenFromNavigation: {
    id: 'Hide Children From Navigation',
    defaultMessage: 'Hide Children From Navigation',
  },

  menuItemChildrenListColumns: {
    id: 'Menu Item Children List Columns',
    defaultMessage: 'Menu Item Children List Columns',
  },
  menuItemColumns: {
    id: 'Menu Item Columns',
    defaultMessage: 'Menu Item Columns',
  },
});

const defaultRouteSettings = {
  hideChildrenFromNavigation: true,
  // Don't include empty arrays in default settings
};

// Helper functions for menuItemColumns conversion (numbers to semantic UI format)
const numberToColumnString = (num) => {
  const numbers = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
  ];
  return numbers[num] ? `${numbers[num]} wide column` : '';
};

const numbersToMenuItemColumns = (numbers) => {
  if (!Array.isArray(numbers)) return [];
  return numbers
    .map((num) => numberToColumnString(parseInt(num)))
    .filter((col) => col !== '');
};

const columnStringToNumber = (colString) => {
  const numbers = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
  };
  const match = colString.match(
    /^(one|two|three|four|five|six|seven|eight|nine) wide column$/,
  );
  return match ? numbers[match[1]] : null;
};

const menuItemColumnsToNumbers = (columns) => {
  if (!Array.isArray(columns)) return [];
  return columns
    .map((col) => columnStringToNumber(col))
    .filter((num) => num !== null);
};

// Custom component for integer array fields
// eslint-disable-next-line no-unused-vars
const IntegerArrayField = ({
  title,
  description,
  value = [],
  onChange,
  options = [],
  routePath,
}) => {
  const addValue = () => {
    const newArray = [...value, options[0] || 1];
    onChange(newArray);
  };

  const removeValue = (index) => {
    const newArray = value.filter((_, i) => i !== index);
    onChange(newArray);
  };

  const updateValue = (index, newValue) => {
    const newArray = [...value];
    newArray[index] = parseInt(newValue);
    onChange(newArray);
  };

  return (
    <Form.Field>
      <label>{title}</label>
      <div
        style={{
          marginBottom: '0.5em',
          fontSize: '0.9em',
          color: '#666',
          fontStyle: 'italic',
        }}
      >
        {description} • Route: <strong>{routePath}</strong>
      </div>

      {value.map((val, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5em',
          }}
        >
          <Dropdown
            selection
            value={val}
            options={options.map((opt) => ({
              key: opt,
              value: opt,
              text: opt,
            }))}
            onChange={(e, { value: newValue }) => updateValue(index, newValue)}
            style={{ marginRight: '0.5em', minWidth: '80px' }}
          />
          <Button
            icon="trash"
            size="small"
            color="red"
            type="button"
            onClick={() => removeValue(index)}
          />
        </div>
      ))}

      <Button
        icon="plus"
        content="Add"
        size="small"
        type="button"
        onClick={addValue}
      />
    </Form.Field>
  );
};

// Get settings from config.settings.menuItemsLayouts
const getConfigSettingsForRoute = (routePath) => {
  const menuItemsLayouts = config.settings?.menuItemsLayouts || {};
  const routeConfig =
    menuItemsLayouts[routePath] || menuItemsLayouts['*'] || {};

  const settings = {
    hideChildrenFromNavigation:
      routeConfig.hideChildrenFromNavigation !== undefined
        ? routeConfig.hideChildrenFromNavigation
        : true,
    includeInNavigation: true,
    expandChildren: false,
    navigationDepth: 0,
    showIcons: true,
  };

  // Only add array properties if they have values
  if (
    routeConfig.menuItemChildrenListColumns &&
    routeConfig.menuItemChildrenListColumns.length > 0
  ) {
    settings.menuItemChildrenListColumns =
      routeConfig.menuItemChildrenListColumns;
  }

  if (routeConfig.menuItemColumns && routeConfig.menuItemColumns.length > 0) {
    // Convert from semantic UI format to numbers for widget display
    settings.menuItemColumns = menuItemColumnsToNumbers(
      routeConfig.menuItemColumns,
    );
  }

  return settings;
};

// Schema for individual route settings - simple version
const getRouteSettingsSchema = (intl) => ({
  title: 'Route Navigation Settings',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'hideChildrenFromNavigation',
        'menuItemChildrenListColumns',
        'menuItemColumns',
      ],
    },
  ],
  properties: {
    hideChildrenFromNavigation: {
      title: intl.formatMessage(messages.hideChildrenFromNavigation),
      type: 'boolean',
      default: true,
    },

    menuItemChildrenListColumns: {
      title: intl.formatMessage(messages.menuItemChildrenListColumns),
      description: 'Number of columns for each route',
      type: 'array',
      widget: 'simple_array',
      items: {
        minimum: 1,
        maximum: 10,
      },
      default: [],
    },
    menuItemColumns: {
      title: intl.formatMessage(messages.menuItemColumns),
      description: 'Size of the columns',
      type: 'array',
      widget: 'simple_array',
      items: {
        minimum: 1,
        maximum: 9,
      },
      default: [],
    },
  },
  required: [],
});

const NavigationBehaviorWidget = (props) => {
  const { value = '{}', id, onChange } = props;
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigation = useSelector((state) => state.navigation?.items || []);
  const navigationLoaded = useSelector((state) => state.navigation?.loaded);

  // Parse JSON string to object
  const parseValue = (val) => {
    try {
      return typeof val === 'string' ? JSON.parse(val) : val || {};
    } catch (e) {
      return {};
    }
  };

  const routeSettings = parseValue(value);

  const [localActiveObject, setLocalActiveObject] = React.useState(-1);
  let activeObject = localActiveObject;
  let setActiveObject = setLocalActiveObject;

  function handleChangeActiveObject(e, blockProps) {
    const { index } = blockProps;
    const newIndex = activeObject === index ? -1 : index;
    setActiveObject(newIndex);
  }

  const flattenNavigationToRoutes = useCallback((items, level = 0) => {
    let routes = [];

    items.forEach((item) => {
      const itemPath = item.url || item.id;
      const currentPath = itemPath;
      const routeId = item['@id'] || item.url || item.id || uuid();
      const configSettings =
        getConfigSettingsForRoute(currentPath) || defaultRouteSettings;
      const savedSettings = routeSettings[routeId] || {};

      // Merge settings intelligently - use config values for empty/missing fields
      let finalSettings = { ...defaultRouteSettings };

      // Add config settings first (as defaults)
      if (configSettings) {
        Object.keys(configSettings).forEach((key) => {
          if (
            configSettings[key] !== undefined &&
            configSettings[key] !== null
          ) {
            finalSettings[key] = configSettings[key];
          }
        });
      }

      // Override with saved settings, including null values (explicit deletion)
      if (savedSettings) {
        Object.keys(savedSettings).forEach((key) => {
          if (savedSettings[key] !== undefined) {
            // Handle null values as explicit deletion - don't override with config
            if (savedSettings[key] === null) {
              // Field was explicitly cleared - remove it from finalSettings
              delete finalSettings[key];
            } else if (Array.isArray(savedSettings[key])) {
              // For arrays, always override with saved value (including empty arrays)
              finalSettings[key] = savedSettings[key];
            } else {
              // For non-arrays, override with saved value
              finalSettings[key] = savedSettings[key];
            }
          }
        });
      }

      // Convert menuItemColumns from semantic UI format to numbers for widget display
      if (
        finalSettings.menuItemColumns &&
        Array.isArray(finalSettings.menuItemColumns)
      ) {
        // Check if values are in semantic UI format
        if (
          finalSettings.menuItemColumns.length > 0 &&
          typeof finalSettings.menuItemColumns[0] === 'string' &&
          finalSettings.menuItemColumns[0].includes('wide column')
        ) {
          finalSettings.menuItemColumns = menuItemColumnsToNumbers(
            finalSettings.menuItemColumns,
          );
        }
      }

      const route = {
        '@id': routeId,
        title: item.title || item.name,
        path: currentPath,
        url: item.url,
        level: level,
        hasChildren: item.items && item.items.length > 0,
        portal_type: item.portal_type || item['@type'],
        ...finalSettings,
      };

      routes.push(route);

      if (item.items && item.items.length > 0) {
        routes = routes.concat(
          flattenNavigationToRoutes(item.items, level + 1),
        );
      }
    });

    return routes;
  }, [routeSettings]);

  useEffect(() => {
    if (!navigationLoaded) {
      dispatch(getNavigation('', 1));
    }
  }, [dispatch, navigationLoaded]);

  // Auto-populate from config if no settings exist
  useEffect(() => {
    if (
      navigationLoaded &&
      navigation.length > 0 &&
      Object.keys(routeSettings).length === 0
    ) {
      const routes = flattenNavigationToRoutes(navigation);
      const level0Routes = routes.filter((route) => route.level === 0);

      if (level0Routes.length > 0) {
        const newSettings = {};
        level0Routes.forEach((route) => {
          // Save the current settings (which include config values) for each route
          const {
            '@id': routeId,
            title: _,
            url: ___,
            level: ____,
            hasChildren: _____,
            portal_type: ______,
            ...settings
          } = route;
          newSettings[routeId] = settings;
        });

        onChange(id, JSON.stringify(newSettings));
      }
    }
  }, [
    navigationLoaded,
    navigation,
    routeSettings,
    onChange,
    id,
    flattenNavigationToRoutes,
  ]);

  const allRoutes = React.useMemo(() => {
    const routes = flattenNavigationToRoutes(navigation);
    // Filter to show only level 0 routes (main routes that decide navigation behavior)
    return routes.filter((route) => route.level === 0); // level 0 = main routes
  }, [navigation, flattenNavigationToRoutes]);

  return (
    <div className="navigation-objectlist-widget">
      <FormFieldWrapper {...props} className="navigation-behavior-widget" />

      <div className="routes-area">
        {allRoutes.map((route, index) => (
          <Accordion key={route['@id']} fluid styled>
            <Accordion.Title
              active={activeObject === index}
              index={index}
              onClick={handleChangeActiveObject}
            >
              <div className="label">
                <strong style={{ marginLeft: '0.5rem' }}>{route.title}</strong>
                <span
                  style={{
                    color: '#666',
                    fontSize: '0.85em',
                    fontStyle: 'italic',
                    marginLeft: '0.5rem',
                  }}
                >
                  ({route.path})
                </span>
              </div>

              <div className="accordion-tools">
                {activeObject === index ? (
                  <Icon name={upSVG} size="20px" />
                ) : (
                  <Icon name={downSVG} size="20px" />
                )}
              </div>
            </Accordion.Title>
            <Accordion.Content active={activeObject === index}>
              <Segment>
                <ObjectWidget
                  id={`${id}-${index}`}
                  key={`ow-${id}-${index}`}
                  schema={getRouteSettingsSchema(intl)}
                  value={route}
                  onChange={(fieldId, fieldValue) => {
                    const routeId = route['@id'];
                    const {
                      '@id': _,
                      title: __,
                      path: ___,
                      url: ____,
                      level: _____,
                      hasChildren: ______,
                      portal_type: _______,
                      ...settings
                    } = fieldValue;

                    // Preserve existing settings and merge with new ones
                    const existingSettings = routeSettings[routeId] || {};

                    // Convert existing menuItemColumns from semantic UI back to numbers for merging
                    const cleanedExistingSettings = { ...existingSettings };
                    if (
                      cleanedExistingSettings.menuItemColumns &&
                      Array.isArray(cleanedExistingSettings.menuItemColumns)
                    ) {
                      // Check if existing values are in semantic UI format and convert to numbers
                      if (
                        cleanedExistingSettings.menuItemColumns.length > 0 &&
                        typeof cleanedExistingSettings.menuItemColumns[0] ===
                          'string' &&
                        cleanedExistingSettings.menuItemColumns[0].includes(
                          'wide column',
                        )
                      ) {
                        cleanedExistingSettings.menuItemColumns =
                          menuItemColumnsToNumbers(
                            cleanedExistingSettings.menuItemColumns,
                          );
                      }
                    }

                    // Check if the field was explicitly set in the widget's settings
                    const explicitlySetFields = Object.keys(settings);

                    let mergedSettings = {
                      ...cleanedExistingSettings,
                      ...settings,
                    };

                    // Handle null values for explicitly cleared fields
                    Object.keys(settings).forEach((key) => {
                      if (settings[key] === null) {
                        // Field was explicitly cleared - store as null to preserve intent
                        mergedSettings[key] = null;
                      }
                    });

                    // Convert menuItemColumns from numbers back to semantic UI format for backend storage
                    if (
                      mergedSettings.menuItemColumns !== null &&
                      mergedSettings.menuItemColumns
                    ) {
                      if (mergedSettings.menuItemColumns.length > 0) {
                        mergedSettings.menuItemColumns =
                          numbersToMenuItemColumns(
                            mergedSettings.menuItemColumns,
                          );
                      } else if (
                        !explicitlySetFields.includes('menuItemColumns')
                      ) {
                        // Only remove empty menuItemColumns if not explicitly set by user
                        delete mergedSettings.menuItemColumns;
                      } else {
                        // Keep empty array if explicitly set by user (cleared all elements)
                        mergedSettings.menuItemColumns = [];
                      }
                    }

                    // Handle menuItemChildrenListColumns similarly
                    if (mergedSettings.menuItemChildrenListColumns !== null) {
                      if (
                        !mergedSettings.menuItemChildrenListColumns ||
                        (mergedSettings.menuItemChildrenListColumns.length ===
                          0 &&
                          !explicitlySetFields.includes(
                            'menuItemChildrenListColumns',
                          ))
                      ) {
                        delete mergedSettings.menuItemChildrenListColumns;
                      }
                    }

                    // Clean up other empty arrays only if not explicitly set by user
                    Object.keys(mergedSettings).forEach((key) => {
                      if (
                        Array.isArray(mergedSettings[key]) &&
                        mergedSettings[key].length === 0 &&
                        !explicitlySetFields.includes(key)
                      ) {
                        delete mergedSettings[key];
                      }
                    });

                    const newSettings = {
                      ...routeSettings,
                      [routeId]: mergedSettings,
                    };
                    onChange(id, JSON.stringify(newSettings));
                  }}
                />
              </Segment>
            </Accordion.Content>
          </Accordion>
        ))}
      </div>
    </div>
  );
};

export default NavigationBehaviorWidget;
