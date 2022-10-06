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
  const defaultView = eea.headerSearchBox.filter((v) => v.isDefault);
  const localView = eea.headerSearchBox.filter((v) =>
    location.pathname.includes(v.path),
  );
  const activeView = localView.length > 0 ? localView[0] : defaultView[0];

  const [text, setText] = React.useState('');

  useClickOutside({ targetRefs: [nodeRef, ...triggerRefs], callback: onClose });

  const onChangeText = (event, { value }) => {
    setText(value);
    event.preventDefault();
  };

  const onSubmit = (event) => {
    history.push(`${activeView.path}?q=${text}`);

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
              placeholder={activeView.placeholder}
              fluid
            />
          </div>
        </Container>
      </form>
      {(activeView.description || activeView.buttonTitle) && (
        <div className="advanced-search">
          <Container>
            <p>{activeView.description}</p>
            <a
              href={defaultView[0].path}
              className="ui button white inverted"
              title="Advanced search"
            >
              {activeView.buttonTitle}
            </a>
          </Container>
        </div>
      )}
    </div>
  );
}

export default withRouter(HeaderSearchPopUp);
