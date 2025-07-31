import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { Icon, FormFieldWrapper } from '@plone/volto/components';
import ObjectWidget from '@plone/volto/components/manage/Widgets/ObjectWidget';
import { Accordion, Button, Segment } from 'semantic-ui-react';
import { getNavigation } from '@plone/volto/actions';
import { defineMessages, useIntl } from 'react-intl';
import config from '@plone/volto/registry';

import plusSVG from '@plone/volto/icons/add.svg';
import upSVG from '@plone/volto/icons/up-key.svg';
import downSVG from '@plone/volto/icons/down-key.svg';

const messages = defineMessages({
  loadNavigationRoutes: {
    id: 'Load Level 2 Navigation Routes',
    defaultMessage: 'Load Level 2 Navigation Routes',
  },
  hideChildrenFromNavigation: {
    id: 'Hide Children From Navigation',
    defaultMessage: 'Hide Children From Navigation',
  },
  includeInNavigation: {
    id: 'Include in Navigation',
    defaultMessage: 'Include in Navigation',
  },
  expandChildren: {
    id: 'Expand Children by Default',
    defaultMessage: 'Expand Children by Default',
  },
  navigationDepth: {
    id: 'Navigation Depth',
    defaultMessage: 'Navigation Depth',
  },
  showIcons: {
    id: 'Show Icons',
    defaultMessage: 'Show Icons',
  },
  showThumbnails: {
    id: 'Show Thumbnails',
    defaultMessage: 'Show Thumbnails',
  },
});

const defaultRouteSettings = {
  hideChildrenFromNavigation: true,
  includeInNavigation: true,
  expandChildren: false,
  navigationDepth: 0,
  showIcons: true,
  showThumbnails: false,
};

// Get settings from config.settings.menuItemsLayouts
const getConfigSettingsForRoute = (routePath) => {
  const menuItemsLayouts = config.settings?.menuItemsLayouts || {};
  const routeConfig = menuItemsLayouts[routePath] || menuItemsLayouts['*'] || {};
  
  return {
    hideChildrenFromNavigation: routeConfig.hideChildrenFromNavigation !== undefined 
      ? routeConfig.hideChildrenFromNavigation 
      : true,
    includeInNavigation: true,
    expandChildren: false,
    navigationDepth: 0,
    showIcons: true,
    showThumbnails: false,
  };
};

// Schema for individual route settings
const getRouteSettingsSchema = (intl) => ({
  title: 'Route Navigation Settings',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'hideChildrenFromNavigation',
        'includeInNavigation',
        'expandChildren',
        'navigationDepth',
        'showIcons',
        'showThumbnails',
      ],
    },
  ],
  properties: {
    hideChildrenFromNavigation: {
      title: intl.formatMessage(messages.hideChildrenFromNavigation),
      type: 'boolean',
      default: true,
    },
    includeInNavigation: {
      title: intl.formatMessage(messages.includeInNavigation),
      type: 'boolean',
      default: true,
    },
    expandChildren: {
      title: intl.formatMessage(messages.expandChildren),
      type: 'boolean',
      default: false,
    },
    navigationDepth: {
      title: intl.formatMessage(messages.navigationDepth),
      type: 'integer',
      default: 0,
      choices: [
        [0, 'Unlimited'],
        [1, '1 level'],
        [2, '2 levels'],
        [3, '3 levels'],
        [4, '4 levels'],
        [5, '5 levels'],
      ],
    },
    showIcons: {
      title: intl.formatMessage(messages.showIcons),
      type: 'boolean',
      default: true,
    },
    showThumbnails: {
      title: intl.formatMessage(messages.showThumbnails),
      type: 'boolean',
      default: false,
    },
  },
  required: [],
});

const NavigationBehaviorWidget = (props) => {
  const { value = '{}', id, onChange, schema } = props;
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
  const objectSchema = getRouteSettingsSchema(intl);

  const [localActiveObject, setLocalActiveObject] = React.useState(-1);
  let activeObject = localActiveObject;
  let setActiveObject = setLocalActiveObject;

  function handleChangeActiveObject(e, blockProps) {
    const { index } = blockProps;
    const newIndex = activeObject === index ? -1 : index;
    setActiveObject(newIndex);
  }

  useEffect(() => {
    if (!navigationLoaded) {
      dispatch(getNavigation('', 1));
    }
  }, [dispatch, navigationLoaded]);

  // Auto-populate from config if no settings exist
  useEffect(() => {
    if (navigationLoaded && navigation.length > 0 && Object.keys(routeSettings).length === 0) {
      const routes = flattenNavigationToRoutes(navigation);
      const level2Routes = routes.filter((route) => route.level === 1);
      
      if (level2Routes.length > 0) {
        const newSettings = {};
        level2Routes.forEach((route) => {
          const configSettings = getConfigSettingsForRoute(route.path);
          newSettings[route['@id']] = configSettings;
        });
        
        onChange(id, JSON.stringify(newSettings));
      }
    }
  }, [navigationLoaded, navigation, routeSettings, onChange, id]);

  const flattenNavigationToRoutes = (items, path = '', level = 0) => {
    let routes = [];

    items.forEach((item) => {
      const itemPath = item.url || item.id;
      const currentPath = itemPath;
      const routeId = item['@id'] || item.url || item.id || uuid();
      const route = {
        '@id': routeId,
        title: item.title || item.name,
        path: currentPath,
        url: item.url,
        level: level,
        hasChildren: item.items && item.items.length > 0,
        portal_type: item.portal_type || item['@type'],
        // Include existing settings or defaults
        ...(routeSettings[routeId] || defaultRouteSettings),
      };

      routes.push(route);

      if (item.items && item.items.length > 0) {
        routes = routes.concat(
          flattenNavigationToRoutes(item.items, currentPath, level + 1),
        );
      }
    });

    return routes;
  };

  const allRoutes = React.useMemo(() => {
    const routes = flattenNavigationToRoutes(navigation);
    // Filter to show only level 2 routes (sub-pages that can be expanded/collapsed)
    return routes.filter((route) => route.level === 1); // level 1 = second level (0-indexed)
  }, [navigation, routeSettings]);

  return (
    <div className="objectlist-widget">
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
                <Icon
                  name={route.hasChildren ? 'folder' : 'file outline'}
                  color={route.hasChildren ? 'orange' : 'blue'}
                />
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
                  schema={objectSchema}
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
                    const newSettings = {
                      ...routeSettings,
                      [routeId]: settings,
                    };
                    onChange(id, JSON.stringify(newSettings));
                  }}
                />
              </Segment>
            </Accordion.Content>
          </Accordion>
        ))}
      </div>

      {allRoutes.length === 0 && navigationLoaded && (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#666',
            fontStyle: 'italic',
          }}
        >
          No level 2 navigation routes found. Click "Load Level 2 Navigation
          Routes" to populate with sub-pages that can be expanded/collapsed.
        </div>
      )}
    </div>
  );
};

export default NavigationBehaviorWidget;
