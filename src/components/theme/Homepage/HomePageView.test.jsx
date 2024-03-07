import React from 'react';
import { render } from '@testing-library/react';
import HomePageView from './HomePageView';
import '@testing-library/jest-dom/extend-expect';

describe('HomePageView Component', () => {
  it('renders without crashing', () => {
    const mockContent = (
      <body>
        <div>Mock content</div>
      </body>
    );
    const { container } = render(<HomePageView content={mockContent} />);
    expect(container).toBeTruthy();
  });
});
