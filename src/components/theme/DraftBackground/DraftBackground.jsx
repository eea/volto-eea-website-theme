import { BodyClass, flattenToAppURL } from '@plone/volto/helpers';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import './draft.css';

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
 * Checks if a given date is in the future.
 *
 * @param {string} date - The date to check.
 * @returns {boolean} `true` if the date is in the future, `false` otherwise.
 */
const dateIsInFuture = (date) => {
  return (
    date && date !== 'None' && new Date(date).getTime() > new Date().getTime()
  );
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
  if (dateIsInFuture(effectiveDate)) {
    return false;
  }

  const reviewState = props?.review_state;

  //case 1 : review_state published
  if (reviewState === 'published') return true;

  //case 2: review_state null, but parent is published eg:Image in published folder
  // is marked as published, or not published if the effective date of parent
  // is in the future
  const parent = props?.content?.parent;
  const parentReviewState = parent?.review_state;
  if (!reviewState && parentReviewState === 'published') {
    if (dateIsInFuture(parent?.effective)) {
      return false;
    }
    return true;
  }

  //case 3: review_state null, but there is no parent eg: PloneSite
  if (!reviewState && Object.keys(parent || {}).length === 0) return true;

  //case 4: review_state null, and review state of parent is null, eg: Image in PloneSite
  if (!reviewState && !parentReviewState) return true;
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
