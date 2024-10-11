import Accordion from './Accordion';
import Default from './Default';

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
];

export default contextBlockVariations;
