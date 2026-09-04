import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ImageViewWidget from './ImageViewWidget';

describe('ImageViewWidget', () => {
  it('renders img with correct src and alt', () => {
    const mockValue = {
      download: 'https://example.com/image.jpg',
      filename: 'example.jpg',
    };

    render(<ImageViewWidget value={mockValue} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', mockValue.download);
    expect(img).toHaveAttribute('alt', mockValue.filename);
  });

  it('does not render src or alt when value is null', () => {
    render(<ImageViewWidget value={null} />);

    const img = screen.getByRole('img');
    expect(img).not.toHaveAttribute('src');
    expect(img).not.toHaveAttribute('alt');
  });
});
