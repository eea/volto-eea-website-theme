import biseLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/bise.svg';
import energyLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/energy.svg';
import insituLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/insitu.svg';
import ipchemLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/ipchem.svg';
import freshwaterLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/freshwater.svg';
import fiseLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/fise.svg';
import ccaLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/cca.svg';
import copernicusLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/copernicus.svg';
import industryLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/industry.svg';
import marineLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/marine.svg';

// TODO: to be consolidated with headerLinks
export const partnerWebsites = [
  {
    link: 'https://biodiversity.europa.eu/',
    src: biseLogo,
    alt: 'Biodiversity',
  },
  {
    link: 'https://climate-energy.eea.europa.eu/',
    src: energyLogo,
    alt: 'Climate and energy in the EU',
  },
  {
    link: 'https://insitu.copernicus.eu/',
    src: insituLogo,
    alt: 'Copernicus in situ',
  },
  {
    link: 'https://ipchem.jrc.ec.europa.eu/RDSIdiscovery/ipchem/index.html',
    src: ipchemLogo,
    alt: 'Information platform for chemical monitoring',
  },
  {
    link: 'https://water.europa.eu/freshwater',
    src: freshwaterLogo,
    alt: 'WISE freshwater',
  },
  {
    link: 'https://forest.eea.europa.eu/',
    src: fiseLogo,
    alt: 'Forest information system for europe',
  },
  {
    link: 'https://climate-adapt.eea.europa.eu/',
    src: ccaLogo,
    alt: 'Climate adapt',
  },
  {
    link: 'https://land.copernicus.eu/',
    src: copernicusLogo,
    alt: 'Copernicus land monitoring service',
  },
  {
    link: 'https://industry.eea.europa.eu/',
    src: industryLogo,
    alt: 'European industrial emissions portal',
  },
  {
    link: 'https://water.europa.eu/marine',
    src: marineLogo,
    alt: 'WISE marine',
  },
];

export const globalHeaderPartnerLinks = {
  title: 'Environmental information systems',
  links: [
    {
      title: 'Biodiversity Information System for Europe',
      href: 'https://biodiversity.europa.eu/',
    },
    {
      title: 'Climate Adaptation Platform',
      href: 'https://climate-adapt.eea.europa.eu/',
    },
    {
      title: 'Copernicus in situ component',
      href: 'https://insitu.copernicus.eu/',
    },
    {
      title: 'European Industrial Emissions Portal',
      href: 'https://industry.eea.europa.eu/',
    },
    {
      title: 'Forest Information System for Europe',
      href: 'https://forest.eea.europa.eu/',
    },
    {
      title: 'Information Platform for Chemical Monitoring',
      href: 'https://ipchem.jrc.ec.europa.eu/RDSIdiscovery/ipchem/index.html',
    },
    {
      title: 'Marine Water Information System for Europe',
      href: 'https://water.europa.eu/marine',
    },
    {
      title: 'Fresh Water Information System for Europe',
      href: 'https://water.europa.eu/freshwater',
    },
  ],
};

export const globalActions = [
  {
    link: '/login',
    title: 'CMS Login',
  },
  {
    link: '/sitemap',
    title: 'Sitemap',
  },
  {
    link: '/privacy',
    title: 'Privacy',
  },
  {
    link: '/copyright',
    title: 'Copyright',
    copy: true,
  },
];

export const socialActions = [
  {
    name: 'twitter',
    link: 'https://twitter.com/euenvironment',
  },
  {
    name: 'facebook',
    link: 'https://www.facebook.com/European.Environment.Agency',
  },
  {
    name: 'linkedin',
    link: 'https://www.linkedin.com/company/european-environment-agency',
  },
  {
    name: 'youtube',
    link: 'https://www.youtube.com/user/EEAvideos',
  },
  {
    name: 'rss',
    link: '/subscription/news-feeds',
  },
];

export const footerActions = [
  {
    icon: 'comment outline',
    text: 'Ask your question',
    link: '/contact-us',
  },
  {
    icon: 'envelope outline',
    text: 'Sign up to our newsletter',
    link: '/newsletter',
  },
];

export const address = 'Kongens Nytorv 6 1050 Copenhagen K (+45) 33 36 71 00';

export const languages = [
  { name: 'Български', code: 'bg' },
  { name: 'čeština', code: 'cs' },
  { name: 'Hrvatski', code: 'hr' },
  { name: 'dansk', code: 'da' },
  { name: 'Nederlands', code: 'nl' },
  { name: 'ελληνικά', code: 'el' },
  { name: 'English', code: 'en' },
  { name: 'eesti', code: 'et' },
  { name: 'Suomi', code: 'fi' },
  { name: 'Français', code: 'fr' },
  { name: 'Deutsch', code: 'de' },
  { name: 'magyar', code: 'hu' },
  { name: 'Íslenska', code: 'is' },
  { name: 'italiano', code: 'it' },
  { name: 'Latviešu', code: 'lv' },
  { name: 'lietuvių', code: 'lt' },
  { name: 'Malti', code: 'mt' },
  { name: 'Norsk', code: 'no' },
  { name: 'polski', code: 'pl' },
  { name: 'Português', code: 'pt' },
  { name: 'Română', code: 'ro' },
  { name: 'slovenčina', code: 'sk' },
  { name: 'Slovenščina', code: 'sl' },
  { name: 'Español', code: 'es' },
  { name: 'Svenska', code: 'sv' },
  { name: 'Türkçe', code: 'tr' },
];

export const defaultLanguage = 'en';

export const websiteTitle = 'Site';
export const organisationName = 'European Environment Agency';
export const logoTargetUrl = '/';
