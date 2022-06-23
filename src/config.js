import biseLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/bise.svg';
import energyLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/energy.svg';
import insituLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/insitu.svg';
import freshwaterLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/freshwater.svg';
import fiseLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/fise.svg';
import ccaLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/cca.svg';
import copernicusLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/copernicus.svg';
import industryLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/industry.svg';
import marineLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/marine.svg';
import eionetLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/eionet.svg';
import eeaLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/eea.svg';
import climateLogo from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/logo/climate-health.svg';

// TODO: to be consolidated with headerLinks
// Footer.jsx config options
export const footerOpts = {
  header: 'EEA information systems',
  logosHeader: 'Managed by',
  contactHeader: 'Contact Us',
  actions: [
    {
      title: 'Login',
      link: '/login',
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
  ],
  sites: [
    {
      link: 'https://water.europa.eu/marine',
      src: marineLogo,
      alt: 'WISE marine',
    },
    {
      link: 'https://biodiversity.europa.eu/',
      src: biseLogo,
      alt: 'Biodiversity',
    },
    {
      link: 'https://climate-adapt.eea.europa.eu/observatory',
      src: climateLogo,
      alt: 'European Climate and Health Observatory',
    },
    {
      link: 'https://industry.eea.europa.eu/',
      src: industryLogo,
      alt: 'European industrial emissions portal',
    },
    {
      link: 'https://insitu.copernicus.eu/',
      src: insituLogo,
      alt: 'Copernicus in situ',
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
      link: 'https://climate-energy.eea.europa.eu/',
      src: energyLogo,
      alt: 'Climate and energy in the EU',
    },
    {
      link: 'https://land.copernicus.eu/',
      src: copernicusLogo,
      alt: 'Copernicus land monitoring service',
    },
  ],
  managedBy: [
    {
      link: 'https://www.eea.europa.eu/',
      src: eeaLogo,
      alt: 'EEA Logo',
      className: 'site logo',
      columnSize: {
        mobile: 6,
        tablet: 12,
        computer: 5,
      },
    },
    {
      link: 'https://www.eionet.europa.eu/',
      src: eionetLogo,
      alt: 'EIONET Logo',
      className: 'eionet logo',
      columnSize: {
        mobile: 6,
        tablet: 12,
        computer: 7,
      },
    },
  ],
  social: [
    {
      name: 'twitter',
      icon: 'ri-twitter-fill',
      link: 'https://twitter.com/euenvironment',
    },
    {
      name: 'facebook',
      icon: 'ri-facebook-box-fill',
      link: 'https://www.facebook.com/European.Environment.Agency',
    },
    {
      name: 'linkedin',
      icon: 'ri-linkedin-fill',
      link: 'https://www.linkedin.com/company/european-environment-agency',
    },
    {
      name: 'youtube',
      icon: 'ri-youtube-fill',
      link: 'https://www.youtube.com/user/EEAvideos',
    },
    {
      name: 'rss',
      icon: 'ri-rss-fill',
      link: '/subscription/news-feeds',
    },
  ],
  contacts: [
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
  ],
  address: 'Kongens Nytorv 6 1050 Copenhagen K (+45) 33 36 71 00',
};

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
