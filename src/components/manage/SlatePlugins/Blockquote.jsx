import React from 'react';

function Blockquote({ children, className, ...rest }) {
  return (
    <div className="eea slate blockquote" {...rest}>
      <blockquote className="quote">{children}</blockquote>
    </div>
  );
}

export default Blockquote;
