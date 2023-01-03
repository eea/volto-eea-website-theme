import * as eea from './config';
import InpageNavigation from '@eeacms/volto-eea-design-system/ui/InpageNavigation/InpageNavigation';
import installCustomTitle from '@eeacms/volto-eea-website-theme/components/manage/Blocks/Title';
import CustomCSS from '@eeacms/volto-eea-website-theme/components/theme/CustomCSS/CustomCSS';
import DraftBackground from '@eeacms/volto-eea-website-theme/components/theme/DraftBackground/DraftBackground';
import { TokenWidget } from '@eeacms/volto-eea-website-theme/components/theme/Widgets/TokenWidget';
import SubsiteClass from './components/theme/SubsiteClass';
import HomePageView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageView';
import HomePageInverseView from '@eeacms/volto-eea-website-theme/components/theme/Homepage/HomePageInverseView';
import { Icon } from '@plone/volto/components';
import paintSVG from '@plone/volto/icons/paint.svg';
import contentBoxSVG from './icons/content-box.svg';
import voltoCustomMiddleware from './middleware/voltoCustom';
import { List } from 'semantic-ui-react';

const applyConfig = (config) => {
  // EEA specific settings

  // Custom blocks
  return [
    (config) => {
      return config;
    },
  ].reduce((acc, apply) => apply(acc), config);
};

export default applyConfig;
