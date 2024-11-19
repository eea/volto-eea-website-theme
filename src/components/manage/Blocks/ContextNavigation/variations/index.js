import Accordion from './Accordion';
import Default from './Default';
import SmartTOC from './SmartTOC';

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
    id: 'smartToc',
    title: 'Smart TOC (Table of Contents)',
    view: SmartTOC,
  },
];

export default contextBlockVariations;
