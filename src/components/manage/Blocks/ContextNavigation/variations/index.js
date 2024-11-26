import Accordion from './Accordion';
import Default from './Default';
import ReportNavigation from './ReportNavigation';

const contextBlockVariations = [
  {
    id: 'default',
    title: 'Listing (default)',
    view: Default,
    isDefault: true,
  },
  {
    id: 'accordion',
    title: 'Accordion',
    view: Accordion,
  },
  {
    id: 'report_navigation',
    title: 'Additional files',
    view: ReportNavigation,
  },
];

export default contextBlockVariations;
