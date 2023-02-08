import React from 'react';
import { connect } from 'react-redux';
import './draft.css';
import { BodyClass } from '@plone/volto/helpers';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

/**
 * The review_state and id don't change everytime the page is changed and because of that the draft background
 * will apear on pages that shouldn't have it.
 * For example, if the current page is /datatable (that has the draft background) and then we go to Content Types page,
 * the review_state and id will be the same as the ones from /datatable, so the draft background will still be present. By checking
 * if the pathname from (from withRouter) is different than 'login' or 'controlpanel', we decide if the draft backgound is present or not.
 * @param {Object} props
 * @returns
 */
const DraftBackground = (props) => {
  const draftClass = `wf-state-${props.review_state}`;

  return props.review_state &&
    !props.pathname.match('login') &&
    !props.pathname.match('controlpanel') ? (
    <BodyClass className={draftClass} />
  ) : (
    <BodyClass className="wf-state-published" />
  );
};

export default compose(
  withRouter,
  connect((state, props) => ({
    review_state: state.content.data?.review_state,
    content: state.content,
  })),
)(DraftBackground);
