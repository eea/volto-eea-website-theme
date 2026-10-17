import { checkIfPublished } from './DraftBackground';
describe('checkIfPublished', () => {
  it('should return true if contentId does not match pathname', () => {
    const props = {
      contentId: '/page1',
      pathname: '/page2',
    };

    expect(checkIfPublished(props)).toBe(true);
  });

  it('should return false if effective date is in the future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const props = {
      contentId: '/page1',
      pathname: '/page1',
      content: {
        effective: futureDate.toISOString(),
      },
    };
    expect(checkIfPublished(props)).toBe(false);
  });

  it('should return true if review_state is published', () => {
    const props = {
      contentId: '/page1',
      pathname: '/page1',
      review_state: 'published',
    };
    expect(checkIfPublished(props)).toBe(true);
  });

  it('should return true if review_state is null and parent is published', () => {
    const props = {
      contentId: '/page1',
      pathname: '/page1',
      review_state: null,
      content: {
        parent: {
          review_state: 'published',
        },
      },
    };
    expect(checkIfPublished(props)).toBe(true);
  });

  it('should return true if review_state is null and parent is empty', () => {
    const props = {
      contentId: '/page1',
      pathname: '/page1',
      review_state: null,
      content: {
        parent: {},
      },
    };
    expect(checkIfPublished(props)).toBe(true);
  });

  it('should return true if review_state is null and parent review_state is null', () => {
    const props = {
      contentId: '/page1',
      pathname: '/page1',
      review_state: null,
      content: {
        parent: {
          review_state: null,
        },
      },
    };
    expect(checkIfPublished(props)).toBe(true);
  });

  it('should return false if review_state is not published and effective date is not in the future', () => {
    const props = {
      contentId: '/page1',
      pathname: '/page1',
      review_state: 'private',
      content: {
        effective: '2023-01-01T00:00:00Z',
      },
    };
    expect(checkIfPublished(props)).toBe(false);
  });
});
