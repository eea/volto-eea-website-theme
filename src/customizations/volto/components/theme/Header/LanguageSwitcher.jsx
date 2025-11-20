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
  const currentLang = useSelector((state) => state.intl.locale);
  const translations = useSelector(
    (state) => state.content.data?.['@components']?.translations?.items,
  );
  const { eea } = config.settings;

  const [language, setLanguage] = React.useState(
    currentLang || eea.defaultLanguage,
  );

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
