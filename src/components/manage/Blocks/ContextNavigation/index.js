import codeSVG from '@plone/volto/icons/code.svg';
import ContextNavigationEdit from './ContextNavigationEdit';
import ContextNavigationView from './ContextNavigationView';
import BlockSettingsSchema from '@plone/volto/components/manage/Blocks/Block/Schema';
import variations from './variations';

const applyConfig = (config) => {
  config.blocks.blocksConfig.contextNavigation = {
    id: 'contextNavigation',
    title: 'Navigation',
    icon: codeSVG,
    group: 'common',
    view: ContextNavigationView,
    edit: ContextNavigationEdit,
    schema: BlockSettingsSchema,
    restricted: false,
    variations,
    mostUsed: false,
    blockHasOwnFocusManagement: true,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };

  return config;
};

export default applyConfig;
