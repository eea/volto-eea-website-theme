import React from 'react';
import { render } from '@testing-library/react';
import HomePageInverseView from './HomePageInverseView';
import '@testing-library/jest-dom';

describe('HomePageInverseView Component', () => {
  it('renders without crashing', () => {
    const mockContent = (
      <body>
        <div>Mock content</div>
      </body>
    );
    const { container } = render(<HomePageInverseView content={mockContent} />);
    expect(container).toBeTruthy();
  });
});
