import codeSVG from '@plone/volto/icons/code.svg';
import LayoutSettingsView from './LayoutSettingsView';
import LayoutSettingsEdit from './LayoutSettingsEdit';
import BlockSettingsSchema from '@plone/volto/components/manage/Blocks/Block/Schema';

export default (config) => {
  config.blocks.blocksConfig.layoutSettings = {
    id: 'layoutSettings',
    title: 'Layout settings',
    icon: codeSVG,
    group: 'common',
    view: LayoutSettingsView,
    edit: LayoutSettingsEdit,
    schema: BlockSettingsSchema,
    restricted: false,
    mostUsed: true,
    blockHasOwnFocusManagement: true,
    sidebarTab: 1,
  };

  return config;
};
