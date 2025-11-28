import React from 'react';
import { useSelector } from 'react-redux';
import { Dropdown, Image } from 'semantic-ui-react';
import { flattenToAppURL } from '@plone/volto/helpers';
import { find } from 'lodash';
import globeIcon from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Header/global-line.svg';
import config from '@plone/volto/registry';
import { Header } from '@eeacms/volto-eea-design-system/ui';

/**
 * LanguageSwitcher component.
 * Provides a dropdown menu for language selection, changing the application's
 * language and navigating to the corresponding translated URL.
 *
 * @param {Object} props - The component props.
 * @param {number} props.width - The viewport width to adjust the dropdown display.
 * @param {Object} props.history - The history object from React Router for navigation.
 */
const LanguageSwitcher = ({ width, history }) => {
  const pathname = useSelector((state) => state.router.location.pathname);
  const translations = useSelector(
    (state) => state.content.data?.['@components']?.translations?.items,
  );
  const { eea } = config.settings;

  // Extract language from pathname instead of state.intl.locale
  // This prevents re-renders when interface language changes
  const langFromPath = React.useMemo(() => {
    const pathParts = pathname.split('/').filter(Boolean);
    // First segment is language code in multilingual sites
    if (pathParts.length > 0 && pathParts[0].length === 2) {
      const langCode = pathParts[0];
      const isValidLang = eea.languages.some((lang) => lang.code === langCode);
      if (isValidLang) {
        return langCode;
      }
    }
    return config.settings.defaultLanguage || 'en';
  }, [pathname, eea.languages]);

  const [language, setLanguage] = React.useState(langFromPath);

  // Sync local state with pathname-based language
  React.useEffect(() => {
    setLanguage(langFromPath);
  }, [langFromPath]);

  return (
    <Header.TopDropdownMenu
      id="language-switcher"
      className="item"
      text={`${language.toUpperCase()}`}
      mobileText={`${language.toUpperCase()}`}
      icon={<Image src={globeIcon} alt="language dropdown globe icon"></Image>}
      viewportWidth={width}
    >
      <ul
        className="wrapper language-list"
        role="listbox"
        aria-label="language switcher"
      >
        {eea.languages.map((item, index) => (
          <Dropdown.Item
            as="li"
            key={index}
            text={
              <span>
                {item.name}
                <span className="country-code">{item.code.toUpperCase()}</span>
              </span>
            }
            onClick={() => {
              const translation = find(translations, {
                language: item.code,
              });
              const to = translation
                ? flattenToAppURL(translation['@id'])
                : `/${item.code}`;
              setLanguage(item.code);
              history.push(to);
            }}
          ></Dropdown.Item>
        ))}
      </ul>
    </Header.TopDropdownMenu>
  );
};

export default LanguageSwitcher;
