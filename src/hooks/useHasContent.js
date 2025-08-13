import { useEffect, useRef, useState } from 'react';

/**
 * Generic hook to detect whether the `#page-document` element contains at
 * least one descendant with a given `size` variant of the Volto “has--size”
 * utility class (e.g. `has--size--wide_width`).
 *
 * Usage:
 *   const hasWide = useHasContent();
 *   const hasNarrow = useHasContent('#view', 'narrow');
 *
 * Internally the hook throttles DOM-mutation handling with
 * `requestAnimationFrame`, so React state updates occur at most once per
 * frame, no matter how many mutations are fired synchronously.
 *
 * @param {string} selector CSS selector for the container (defaults to '#page-document').
 * @param {string} size     Variant to look for: 'wide', 'narrow', 'content', … (defaults to 'wide').
 * @returns {boolean} `true` if an element with the size class exists.
 */
function useHasContent(selector = '#page-document', size = 'wide') {
  const [hasContent, setHasContent] = useState(false);
  const frameRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!__CLIENT__) return;

    const classSelector = `.has--size--${size}_width`;

    const checkForContent = () => {
      const container = document.querySelector(selector);
      if (!container) {
        setHasContent(false);
        return;
      }
      setHasContent(container.querySelector(classSelector) !== null);
    };

    // Perform initial check immediately.
    checkForContent();

    const mutationCallback = () => {
      if (frameRef.current !== null) return; // already queued for this frame
      frameRef.current = requestAnimationFrame(() => {
        checkForContent();
        frameRef.current = null;
      });
    };

    const containerEl = document.querySelector(selector);
    if (containerEl) {
      observerRef.current = new MutationObserver(mutationCallback);
      observerRef.current.observe(containerEl, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      observerRef.current = null;
      frameRef.current = null;
    };
    // We include `size` because if it changes, we need a fresh observer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, size]);

  return hasContent;
}

export default useHasContent;
