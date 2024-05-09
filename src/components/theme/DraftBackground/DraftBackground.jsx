import React from 'react';
import { connect } from 'react-redux';
import './draft.css';
import { BodyClass } from '@plone/volto/helpers';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { flattenToAppURL } from '@plone/volto/helpers';

/**
 * Removes any trailing slashes from the given string.
 *
 * @param {string} str - The input string to remove trailing slashes from.
 * @returns {string} The input string with any trailing slashes removed.
 */
const removeTrailingSlash = (str) => {
  return str.replace(/\/+$/, '');
};

/**
 * Checks if the current content is published.
 *
 * This function checks the review state and effective date of the current content
 * to determine if it should be considered published. It handles various cases,
 * such as when the review state is null, when the content has a parent, and when
 * the effective date is in the future.
 *
 * @param {object} props - The props object containing information about the current content.
 * @param {string} props.contentId - The ID of the current content.
 * @param {string} props.pathname - The current URL pathname.
 * @param {object} props.content - The content object.
 * @param {string} props.review_state - The review state of the current content.
 * @returns {boolean} - True if the content is considered published, false otherwise.
 */
export const checkIfPublished = (props) => {
  //case 0: the state is not for the current content-type eg: Go to /contents from a page
  if (props.contentId !== removeTrailingSlash(props.pathname)) return true;

  // set draft image if effective date is set and is in the future
  // regardless of review_state
  const effectiveDate = props?.content?.effective;
  if (
    effectiveDate &&
    effectiveDate !== 'None' &&
    new Date(effectiveDate).getTime() > new Date().getTime()
  ) {
    return false;
  }

  //case 1 : review_state published
  if (props?.review_state === 'published') return true;

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
