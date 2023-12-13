import { useEffect } from 'react';
import { connect } from 'react-redux';
import { removeSchema } from '@eeacms/volto-eea-website-theme/actions';

function RemoveSchema({ removeSchema, content, schema }) {
  useEffect(() => {
    if (
      schema.schema &&
      (!content || (content && schema.contentType !== content['@type']))
    ) {
      removeSchema();
    }
  }, [removeSchema, content, schema]);

  return null;
}

export default connect(
  (state) => ({
    content: state.content.data,
    schema: state.schema,
  }),
  { removeSchema },
)(RemoveSchema);
