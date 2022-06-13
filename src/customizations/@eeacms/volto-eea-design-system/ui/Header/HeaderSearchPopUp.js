import React from 'react';
import { Container, Input } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { useClickOutside } from '@eeacms/volto-eea-design-system/helpers';

function HeaderSearchPopUp({ history, onClose, triggerRefs = [] }) {
  const nodeRef = React.useRef();
  const [text, setText] = React.useState('');

  useClickOutside({ targetRefs: [nodeRef, ...triggerRefs], callback: onClose });

  const onChangeText = (event, { value }) => {
    setText(value);
    event.preventDefault();
  };

  const onSubmit = (event) => {
    history.push(`/en/advanced-search?q=${text}`);
    onClose();
    event.preventDefault();
  };

  return (
    <form id="search-box" ref={nodeRef} method="get" onSubmit={onSubmit}>
      <Container>
        <div className="wrapper">
          <Input
            className="search"
            onChange={onChangeText}
            icon={{
              className: 'ri-search-line',
              link: true,
              onClick: onSubmit,
            }}
            placeholder="Search..."
            fluid
          />
        </div>
      </Container>
    </form>
  );
}

export default withRouter(HeaderSearchPopUp);
