import React from 'react';
import { Container, Input } from 'semantic-ui-react';
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
  const {
    datahub,
    globalSearch,
    advancedSearchDescription,
    advancedSearchButtonTitle,
  } = eea.headerSearchBox;
  const [text, setText] = React.useState('');
  const isDatahub = location.pathname.includes(datahub.path);

  useClickOutside({ targetRefs: [nodeRef, ...triggerRefs], callback: onClose });

  const onChangeText = (event, { value }) => {
    setText(value);
    event.preventDefault();
  };

  const onSubmit = (event) => {
    history.push(`${isDatahub ? datahub.path : globalSearch.path}?q=${text}`);

    if (window?.searchContext?.resetSearch) {
      window.searchContext.resetSearch({ searchTerm: text });
    }

    onClose();
    event.preventDefault();
  };

  return (
    <div id="search-box" ref={nodeRef}>
      <form method="get" onSubmit={onSubmit}>
        <Container>
          <div className="wrapper">
            <Input
              ref={searchInputRef}
              className="search"
              onChange={onChangeText}
              icon={{
                className: 'ri-search-line',
                link: true,
                onClick: onSubmit,
              }}
              placeholder={
                isDatahub ? datahub.placeholder : globalSearch.placeholder
              }
              fluid
            />
          </div>
        </Container>
      </form>
      {isDatahub && (
        <div className="advanced-search">
          <Container>
            <p>{advancedSearchDescription}</p>
            <a
              href={globalSearch.path}
              className="ui button white inverted"
              title="Advanced search"
            >
              {advancedSearchButtonTitle}
            </a>
          </Container>
        </div>
      )}
    </div>
  );
}

export default withRouter(HeaderSearchPopUp);
