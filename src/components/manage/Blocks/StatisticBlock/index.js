import worldSVG from '@plone/volto/icons/world.svg';
import StatisticBlockEdit from './Edit';
import StatisticBlockView from './View';

export default (config) => {
  config.blocks.blocksConfig.statistic_block = {
    id: 'statistic_block',
    title: 'Statistic block',
    icon: worldSVG,
    group: 'text',
    view: StatisticBlockView,
    edit: StatisticBlockEdit,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};
