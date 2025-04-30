import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import WebReport from './WebReport';

// Mock Portal since we are not in real DOM
jest.mock('react-portal', () => ({
  Portal: ({ children }) => <div data-testid="portal">{children}</div>,
}));

jest.mock('@plone/volto/helpers', () => ({
  BodyClass: ({ className }) => (
    <div data-testid="body-class" className={className} />
  ),
}));

jest.mock('@plone/volto/components', () => ({
  MaybeWrap: ({ condition, as: As, children }) =>
    condition ? <As>{children}</As> : children,
}));

jest.mock(
  '@eeacms/volto-eea-website-theme/components/theme/Banner/View',
  () => (props) => (
    <div data-testid="banner-view">
      {props.data.aboveTitle}
      {props.data.belowTitle}
    </div>
  ),
);

jest.mock('@eeacms/volto-eea-design-system/ui/Banner/Banner', () => {
  const Subtitle = ({ children }) => (
    <div data-testid="banner-subtitle">{children}</div>
  );
  return {
    Subtitle,
  };
});

describe('WebReport', () => {
  it('renders with content type and subtitle', () => {
    const props = {
      isEditMode: false,
      data: {
        hero_header: true,
        content_type: 'Report',
        subtitle: 'This is a subtitle',
      },
      properties: {
        type_title: 'Fallback Title',
      },
    };

    render(<WebReport {...props} />);

    // Check portal wrapping
    expect(screen.getByTestId('portal')).toBeInTheDocument();

    // Check BodyClass applied
    expect(screen.getByTestId('body-class')).toHaveClass(
      'homepage-inverse',
      'homepage-header',
      'light-header',
      'hero-header',
    );

    // Check BannerView rendered
    expect(screen.getByTestId('banner-view')).toBeInTheDocument();

    // Content Type shown
    expect(screen.getByText('Report')).toBeInTheDocument();

    // Subtitle shown
    expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
  });

  it('renders fallback type_title when content_type missing', () => {
    const props = {
      isEditMode: false,
      data: {
        hero_header: true,
        subtitle: 'Another subtitle',
      },
      properties: {
        type_title: 'Fallback Title',
      },
    };

    render(<WebReport {...props} />);

    // Fallback title used
    expect(screen.getByText('Fallback Title')).toBeInTheDocument();
  });

  it('hides content type if hideContentType is true', () => {
    const props = {
      isEditMode: false,
      data: {
        hero_header: false,
        hideContentType: true,
        subtitle: 'Hidden subtitle',
      },
      properties: {
        type_title: 'Hidden Title',
      },
    };

    render(<WebReport {...props} />);

    // Should NOT find content type div
    expect(screen.queryByText('Hidden Title')).not.toBeInTheDocument();
  });

  it('renders directly without portal in edit mode', () => {
    const props = {
      isEditMode: true,
      data: {
        subtitle: 'Edit mode subtitle',
      },
      properties: {
        type_title: 'Edit Title',
      },
    };

    render(<WebReport {...props} />);

    // Should not wrap with Portal when in edit mode
    expect(screen.queryByTestId('portal')).not.toBeInTheDocument();

    // Banner still rendered
    expect(screen.getByTestId('banner-view')).toBeInTheDocument();
  });
});
