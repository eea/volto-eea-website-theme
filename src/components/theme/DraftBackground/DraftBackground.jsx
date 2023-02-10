import React from 'react';
import { connect } from 'react-redux';
import './draft.css';
import { BodyClass } from '@plone/volto/helpers';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

/**
 * The review_state and id don't change everytime the page is changed and because of that the draft background
 * will apear on pages that shouldn't have it. The RAZZLE_DISABLE_DRAFT_WATERMARK varible from ENV file should have two possible values:
 * "Hide-No-Workflow" and "Hide-All". If the variable is not present, it should follow the current logic(show the draft image everywhere),
 * if the value is "Hide-No-Workflow", then the draft image is not shown on the /login and /controlpanel and if the value is "Hide-All", then
 * the draft image is not visible at all.
 * For example, if the current page is /datatable (that has the draft background) and then we go to Content Types page,
 * the review_state and id will be the same as the ones from /datatable, so the draft background will still be present. By checking
 * if the pathname from (from withRouter) is different than 'login' or 'controlpanel' and based on the varible from ENV,
 * we decide if the draft backgound can be present or not.
 * @param {Object} props
 * @returns
 */
const DraftBackground = (props) => {
  const draftClass = `wf-state-${props.review_state}`;
  const razzleDraft = process.env.RAZZLE_DISABLE_DRAFT_WATERMARK || 'default';
  const isReviewableStateComponent =
    props.review_state &&
    !props.pathname.match('login') &&
    !props.pathname.match('controlpanel');

  const draftOptions = {
    'Hide-All': 'wf-state-published',
    'Hide-No-Workflow': isReviewableStateComponent
      ? draftClass
      : 'wf-state-published',
    default: draftClass,
  };

  return <BodyClass className={draftOptions[razzleDraft]} />;
};

export default compose(
  withRouter,
  connect((state, props) => ({
    review_state: state.content.data?.review_state,
    content: state.content,
  })),
)(DraftBackground);
