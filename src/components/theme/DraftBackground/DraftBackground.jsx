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
const removeTrailingSlash = (str) => {
  return str.replace(/\/+$/, '');
};

const checkIfPublished = (props) => {
  console.log({ props }, removeTrailingSlash(props.pathname));
  //case 0: the state is not for the current content-type
  if (props.contentId !== removeTrailingSlash(props.pathname)) return true;

  //case 1 : review_state published
  if (props?.review_state === 'published') return true;
  //case 2: review_state null, but parent is published
  if (
    checkIfNullOrUndefined(props?.review_state) &&
    props?.content?.parent?.review_state === 'published'
  )
    return true;
  //case 3: review_state null, but there is no parent
  if (
    checkIfNullOrUndefined(props?.review_state) &&
    Object.keys(props?.content?.parent || {}).length === 0
  )
    return true;
  //case 4: review_state null, and review state of parent is null
  if (
    checkIfNullOrUndefined(props?.review_state) &&
    checkIfNullOrUndefined(props?.content?.parent?.review_state)
  )
    return true;
  return false;
};
const DraftBackground = (props) => {
  let draftClass = 'wf-state-is-draft';
  if (checkIfPublished(props)) {
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
