/**
 * BodyClass helper.
 * @module helpers/BodyClass/BodyClass
 *
 * Customized from @plone/volto, which wraps BodyClass with
 * `react-side-effect`. That library registers each instance in
 * UNSAFE_componentWillMount, i.e. during the render phase. With React 18
 * concurrent hydration (`hydrateRoot`), React can throw away a render (for
 * example after a hydration mismatch or a suspension) without ever calling
 * componentWillUnmount on its instances, so their classes stay on <body> for
 * the rest of the session.
 *
 * In Safari this left `homepage homepage-inverse` on <body> after navigating
 * away from the homepage, so the header kept its white (inverted) theme on a
 * white page (refs #310410).
 *
 * Here instances register in componentDidMount on the client (commit phase,
 * only for renders React actually keeps). On the server renders are never
 * thrown away, so instances keep registering during render, which is what
 * `BodyClass.rewind()` in Html.jsx relies on for SSR.
 */
import { Children, PureComponent } from 'react';
import PropTypes from 'prop-types';

const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

let mountedInstances = [];
let state;

/**
 * reducePropsToState
 * @function reducePropsToState
 * @param {*} propsList propsList
 * @returns {List} classList
 */
function reducePropsToState(propsList) {
  let classList = [];
  propsList.forEach((props) => {
    if (props.className) {
      classList = classList.concat(props.className);
    }
  });
  return classList;
}

/**
 * handleStateChangeOnClient
 * @function handleStateChangeOnClient
 * @param {*} classList classList
 * @returns {null} null
 */
function handleStateChangeOnClient(classList) {
  document.body.className = '';
  classList.forEach((className) => {
    // This allows the component to accept more than one class at the same time
    className
      .split(' ')
      .filter(Boolean)
      .forEach((name) => {
        if (!document.body.classList.contains(name)) {
          document.body.classList.add(name);
        }
      });
  });
}

function emitChange() {
  state = reducePropsToState(
    mountedInstances.map((instance) => instance.props),
  );
  if (BodyClass.canUseDOM) {
    handleStateChangeOnClient(state);
  }
}

/**
 * @export
 * @class BodyClass
 * @extends {PureComponent}
 */
class BodyClass extends PureComponent {
  constructor(props) {
    super(props);
    if (!BodyClass.canUseDOM) {
      mountedInstances.push(this);
      emitChange();
    }
  }

  componentDidMount() {
    mountedInstances.push(this);
    emitChange();
  }

  componentDidUpdate() {
    emitChange();
  }

  componentWillUnmount() {
    const index = mountedInstances.indexOf(this);
    if (index !== -1) {
      mountedInstances.splice(index, 1);
    }
    emitChange();
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    if (this.props.children) {
      return Children.only(this.props.children);
    }
    return null;
  }
}

BodyClass.displayName = 'SideEffect(BodyClass)';

// Exposed so tests can monkeypatch it, same as react-side-effect.
BodyClass.canUseDOM = canUseDOM;

/**
 * Current list of class names, from all mounted instances.
 * @returns {List} classList
 */
BodyClass.peek = () => state;

/**
 * Server only: return the collected class names and reset for the next
 * request.
 * @returns {List} classList
 */
BodyClass.rewind = () => {
  if (BodyClass.canUseDOM) {
    throw new Error(
      'You may only call rewind() on the server. Call peek() to read the current state.',
    );
  }
  const recordedState = state;
  state = undefined;
  mountedInstances = [];
  return recordedState;
};

BodyClass.propTypes = {
  children: PropTypes.element,
  className: PropTypes.string,
};

BodyClass.defaultProps = {
  children: null,
  className: null,
};

export default BodyClass;
