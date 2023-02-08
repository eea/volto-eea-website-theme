import React from 'react';
import { Container, Input, List } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { useClickOutside } from '@eeacms/volto-eea-design-system/helpers';
import config from '@plone/volto/registry';

function HeaderSearchPopUp({
  history,
  location,
  onClose,
  searchInputRef,
  triggerRefs = [],
}) {
  const nodeRef = React.useRef();
  const { eea } = config.settings;
  const defaultView = eea.headerSearchBox.filter((v) => v.isDefault);
  const localView = eea.headerSearchBox.filter((v) =>
    location.pathname.includes(v.path),
  );
  const activeView = localView.length > 0 ? localView[0] : defaultView[0];
  const {
    path,
    placeholder,
    buttonTitle,
    description,
    searchSuggestions,
  } = activeView;
  const { suggestionsTitle, suggestions } = searchSuggestions || {};

  const [text, setText] = React.useState('');

  useClickOutside({ targetRefs: [nodeRef, ...triggerRefs], callback: onClose });

  const onChangeText = (event, { value }) => {
    setText(value);
    event.preventDefault();
  };

  const onSubmit = (event) => {
    history.push(`${path}?q=${text}`);

    if (window?.searchContext?.resetSearch) {
      window.searchContext.resetSearch({ searchTerm: text });
    }

    onClose();
    event.preventDefault();
  };

  const onClickHandler = (suggestion) => {
    history.push(`${path}?q=${suggestion}`);

    if (window?.searchContext?.resetSearch) {
      window.searchContext.resetSearch({ searchTerm: suggestion });
    }

    onClose();
  };

  return (
    <div id="search-box" ref={nodeRef}>
      <div className="wrapper">
        <Container>
          <form method="get" onSubmit={onSubmit}>
            <Input
              ref={searchInputRef}
              className="search"
              onChange={onChangeText}
              icon={{
                className: 'ri-search-line',
                link: true,
                onClick: onSubmit,
              }}
              placeholder={placeholder}
              fluid
            />
          </form>
          {searchSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestionsTitle && <h4>{suggestionsTitle}</h4>}

              <List>
                {suggestions.map((item, i) => {
                  return (
                    <List.Item key={i} onClick={() => onClickHandler(item)}>
                      {item}
                    </List.Item>
                  );
                })}
              </List>
            </div>
          )}
        </Container>
        {buttonTitle && (
          <div className="advanced-search">
            <Container>
              <div>{description}</div>
              <a
                href={defaultView[0].path}
                className="ui button white inverted"
                title="Advanced search"
              >
                {buttonTitle}
              </a>
            </Container>
          </div>
        )}
      </div>
    </div>
  );
}

export default withRouter(HeaderSearchPopUp);
