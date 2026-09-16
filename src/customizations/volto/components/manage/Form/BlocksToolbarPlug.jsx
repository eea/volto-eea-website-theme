import React from 'react';
import { context } from '@plone/volto/components/manage/Pluggable';

// Page and nested block toolbars share action IDs. Keep the overridden action
// registered so leaving a column restores the page's toolbar.
const registrations = new WeakMap();

export default function BlocksToolbarPlug({ id, children, dependencies = [] }) {
  const { setPlug, removePlug } = React.useContext(context);

  React.useEffect(() => {
    let actions = registrations.get(setPlug);
    if (!actions) {
      actions = new Map();
      registrations.set(setPlug, actions);
    }
    const stack = actions.get(id) || [];
    const renderer = () => children;
    stack.push(renderer);
    actions.set(id, stack);
    setPlug('main.toolbar.bottom', id, renderer);

    return () => {
      const wasActive = stack[stack.length - 1] === renderer;
      stack.splice(stack.indexOf(renderer), 1);
      if (!stack.length) actions.delete(id);
      if (wasActive) {
        if (stack.length) {
          setPlug('main.toolbar.bottom', id, stack[stack.length - 1]);
        } else {
          removePlug('main.toolbar.bottom', id);
        }
      }
    };
    // Match Plug's explicit dependencies; children are recreated every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPlug, removePlug, id, ...dependencies]);

  return null;
}
