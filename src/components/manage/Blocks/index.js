import installStatisticBlock from './StatisticBlock';

export default (config) => {
  return [installStatisticBlock].reduce((acc, apply) => apply(acc), config);
};
