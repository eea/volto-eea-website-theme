import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import BodyClass from './BodyClass';

describe('BodyClass', () => {
  afterEach(() => {
    document.body.className = '';
  });

  it('adds the classes of mounted instances and removes them on unmount', () => {
    const { rerender, unmount } = render(
      <>
        <BodyClass className="homepage homepage-inverse" />
        <BodyClass className="with-hero-block" />
      </>,
    );
    expect(document.body.classList.contains('homepage')).toBe(true);
    expect(document.body.classList.contains('homepage-inverse')).toBe(true);
    expect(document.body.classList.contains('with-hero-block')).toBe(true);

    rerender(<BodyClass className="with-title-block" />);
    expect(document.body.classList.contains('homepage-inverse')).toBe(false);
    expect(document.body.classList.contains('with-title-block')).toBe(true);

    unmount();
    expect(document.body.className).toBe('');
  });

  it('updates the body classes when className changes', () => {
    const { rerender } = render(<BodyClass className="contenttype-lrf" />);
    rerender(<BodyClass className="contenttype-landing_page" />);
    expect(document.body.className).toBe('contenttype-landing_page');
  });

  it('ignores instances from renders that React throws away', async () => {
    // With a concurrent root, a sibling that suspends makes React throw away
    // the whole render attempt: BodyClass is rendered, but never mounted or
    // unmounted. Its classes must not end up on <body>.
    global.IS_REACT_ACT_ENVIRONMENT = true;
    const never = new Promise(() => {});
    const Suspends = () => {
      throw never;
    };
    const root = createRoot(document.createElement('div'));
    try {
      await act(async () => {
        root.render(
          <Suspense fallback={null}>
            <BodyClass className="homepage-inverse" />
            <Suspends />
          </Suspense>,
        );
      });
      expect(document.body.classList.contains('homepage-inverse')).toBe(false);

      await act(async () => {
        root.render(<BodyClass className="section-montenegro" />);
      });
      expect(document.body.className).toBe('section-montenegro');
      expect(BodyClass.peek()).toEqual(['section-montenegro']);
    } finally {
      await act(async () => root.unmount());
      global.IS_REACT_ACT_ENVIRONMENT = false;
    }
    expect(document.body.className).toBe('');
  });

  it('ignores extra spaces in className', () => {
    const { unmount } = render(<BodyClass className="  a   b " />);
    expect(document.body.className).toBe('a b');
    unmount();
  });

  it('collects classes during server rendering and resets on rewind', () => {
    BodyClass.canUseDOM = false;
    try {
      renderToString(
        <div>
          <BodyClass className="view-viewview" />
          <BodyClass className="homepage homepage-inverse" />
        </div>,
      );
      expect(BodyClass.rewind()).toEqual([
        'view-viewview',
        'homepage homepage-inverse',
      ]);
      expect(BodyClass.rewind()).toBeUndefined();
    } finally {
      BodyClass.canUseDOM = true;
    }
  });

  it('only allows rewind on the server', () => {
    expect(() => BodyClass.rewind()).toThrow();
  });
});
