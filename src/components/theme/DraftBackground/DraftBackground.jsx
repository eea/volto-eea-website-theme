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

const removeTrailingSlash = (str) => {
  return str.replace(/\/+$/, '');
};

const checkIfPublished = (props) => {
  //case 0: the state is not for the current content-type eg: Go to /contents from a page
  if (props.contentId !== removeTrailingSlash(props.pathname)) return true;

  //case 1 : review_state published
  if (props?.review_state === 'published') return true;

  // remove draft image if effective date is set and is in the future
  const effectiveDate = props?.content?.effective;
  if (
    effectiveDate &&
    effectiveDate !== 'None' &&
    new Date(effectiveDate).getTime() > new Date().getTime()
  ) {
    return false;
  }

  //case 2: review_state null, but parent is published eg:Image in published folder
  if (
    !props?.review_state &&
    props?.content?.parent?.review_state === 'published'
  )
    return true;

  //case 3: review_state null, but there is no parent eg: PloneSite
  if (
    !props?.review_state &&
    Object.keys(props?.content?.parent || {}).length === 0
  )
    return true;

  //case 4: review_state null, and review state of parent is null, eg: Image in PloneSite
  if (!props?.review_state && !props?.content?.parent?.review_state)
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
