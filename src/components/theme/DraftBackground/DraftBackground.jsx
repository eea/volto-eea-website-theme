import React from 'react';
import { connect } from 'react-redux';
import './draft.css';
import { BodyClass } from '@plone/volto/helpers';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { flattenToAppURL } from '@plone/volto/helpers';

/**
 * @param {Object} props
 * @returns
 */

const checkIfNullOrUndefined = (value) => {
  return value === undefined || value === null;
};

const DraftBackground = (props) => {
  let draftClass = 'wf-state-is-draft';

  if (
    (checkIfNullOrUndefined(props?.review_state) &&
      props?.content?.parent?.review_state === 'published') ||
    props?.review_state === 'published' ||
    (checkIfNullOrUndefined(props?.review_state) &&
      Object.keys(props?.content?.parent || {}).length === 0)
  ) {
    draftClass = '';
  }
  return draftClass ? <BodyClass className={draftClass} /> : '';
};

export default compose(
  withRouter,
  connect((state, props) => ({
    review_state: state.content.data?.review_state,
    contentId: flattenToAppURL(state.content.data?.['@id']),
  })),
)(DraftBackground);
