import React from 'react';
import { render, screen } from '@testing-library/react';
import WebReportPage from './WebReportPage';

// Add jest-dom matchers
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('react-portal', () => ({
  Portal: ({ children, node }) => (
    <div data-testid="portal" data-node={node?.tagName}>
      {children}
    </div>
  ),
}));

jest.mock('@plone/volto/components', () => ({
  MaybeWrap: ({ children, condition, as: Component }) =>
    condition ? <Component>{children}</Component> : <div>{children}</div>,
}));

jest.mock(
  '@eeacms/volto-eea-website-theme/components/theme/Banner/View',
  () => {
    return function MockBannerView({ data, ...props }) {
      // Safe JSON stringify that handles circular references
      const safeStringify = (obj) => {
        try {
          return JSON.stringify(obj, (key, value) => {
            if (key === 'aboveTitle') return '[React Element]';
            if (typeof value === 'object' && value !== null && value.$$typeof)
              return '[React Element]';
            return value;
          });
        } catch (e) {
          return '[Circular Reference]';
        }
      };

      return (
        <div data-testid="banner-view" data-props={safeStringify(props)}>
          <div data-testid="banner-data">{safeStringify(data)}</div>
          {data.aboveTitle && (
            <div data-testid="above-title">{data.aboveTitle}</div>
          )}
        </div>
      );
    };
  },
);

jest.mock('clsx', () => jest.fn((classes) => classes));

jest.mock('@plone/volto/helpers', () => ({
  BodyClass: ({ className }) => (
    <div data-testid="body-class" data-classname={className} />
  ),
}));

describe('WebReportPage', () => {
  const defaultProps = {
    data: {
      title: 'Test Report Title',
      subtitle: 'Test Subtitle',
      content_type: 'Report',
      hideContentType: false,
    },
    properties: {
      type_title: 'Default Type Title',
    },
    isEditMode: false,
  };

  beforeEach(() => {
    // Mock document.querySelector for Portal
    document.querySelector = jest.fn().mockReturnValue({
      tagName: 'HEADER',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<WebReportPage {...defaultProps} />);
    expect(screen.getByTestId('banner-view')).toBeInTheDocument();
  });

  it('renders in Portal when not in edit mode', () => {
    render(<WebReportPage {...defaultProps} />);
    expect(screen.getByTestId('portal')).toBeInTheDocument();
  });

  it('does not render in Portal when in edit mode', () => {
    const props = { ...defaultProps, isEditMode: true };
    render(<WebReportPage {...props} />);
    expect(screen.queryByTestId('portal')).not.toBeInTheDocument();
  });

  it('renders BodyClass with correct className', () => {
    render(<WebReportPage {...defaultProps} />);
    expect(screen.getByTestId('body-class')).toHaveAttribute(
      'data-classname',
      'homepage-inverse light-header',
    );
  });

  it('renders content type when not hidden', () => {
    render(<WebReportPage {...defaultProps} />);
    const aboveTitle = screen.getByTestId('above-title');
    expect(aboveTitle).toHaveTextContent('Report');
  });

  it('does not render content type when hidden', () => {
    const props = {
      ...defaultProps,
      data: { ...defaultProps.data, hideContentType: true },
    };
    render(<WebReportPage {...props} />);
    const aboveTitle = screen.getByTestId('above-title');
    expect(aboveTitle).not.toHaveTextContent('Report');
  });

  it('uses properties.type_title when data.content_type is not provided', () => {
    const props = {
      ...defaultProps,
      data: { ...defaultProps.data, content_type: undefined },
    };
    render(<WebReportPage {...props} />);
    const aboveTitle = screen.getByTestId('above-title');
    expect(aboveTitle).toHaveTextContent('Default Type Title');
  });

  it('renders subtitle', () => {
    render(<WebReportPage {...defaultProps} />);
    const aboveTitle = screen.getByTestId('above-title');
    expect(aboveTitle).toHaveTextContent('Test Subtitle');
  });

  it('passes all props to BannerView', () => {
    const customProps = {
      ...defaultProps,
      customProp: 'custom-value',
      anotherProp: { nested: 'object' },
    };
    render(<WebReportPage {...customProps} />);

    const bannerPropsText = screen
      .getByTestId('banner-view')
      .getAttribute('data-props');
    expect(bannerPropsText).toContain('custom-value');
    expect(bannerPropsText).toContain('nested');
  });

  it('merges data with aboveTitle correctly', () => {
    render(<WebReportPage {...defaultProps} />);

    const bannerDataText = screen.getByTestId('banner-data').textContent;
    expect(bannerDataText).toContain('Test Report Title');
    expect(bannerDataText).toContain('Test Subtitle');
    expect(bannerDataText).toContain('[React Element]'); // aboveTitle is a React element
  });

  it('handles missing subtitle gracefully', () => {
    const props = {
      ...defaultProps,
      data: { ...defaultProps.data, subtitle: undefined },
    };
    render(<WebReportPage {...props} />);
    expect(screen.getByTestId('banner-view')).toBeInTheDocument();
  });

  it('handles missing content_type and type_title gracefully', () => {
    const props = {
      ...defaultProps,
      data: { ...defaultProps.data, content_type: undefined },
      properties: { ...defaultProps.properties, type_title: undefined },
    };
    render(<WebReportPage {...props} />);
    expect(screen.getByTestId('banner-view')).toBeInTheDocument();
  });

  describe('IsomorphicPortal', () => {
    it('renders children directly on server side', () => {
      // Mock useState to simulate server-side rendering
      const originalUseState = React.useState;
      React.useState = jest.fn().mockReturnValue([false, jest.fn()]);

      render(<WebReportPage {...defaultProps} />);
      expect(screen.getByTestId('banner-view')).toBeInTheDocument();

      React.useState = originalUseState;
    });

    it('renders in Portal on client side', () => {
      // Mock useState to simulate client-side rendering
      const originalUseState = React.useState;
      const mockSetIsClient = jest.fn();
      React.useState = jest.fn().mockReturnValue([true, mockSetIsClient]);

      render(<WebReportPage {...defaultProps} />);
      expect(screen.getByTestId('portal')).toBeInTheDocument();

      React.useState = originalUseState;
    });

    it('calls setIsClient in useEffect', () => {
      const originalUseState = React.useState;
      const originalUseEffect = React.useEffect;

      const mockSetIsClient = jest.fn();
      React.useState = jest.fn().mockReturnValue([false, mockSetIsClient]);
      React.useEffect = jest.fn().mockImplementation((fn) => fn());

      render(<WebReportPage {...defaultProps} />);

      expect(mockSetIsClient).toHaveBeenCalledWith(true);

      React.useState = originalUseState;
      React.useEffect = originalUseEffect;
    });
  });

  it('handles document.querySelector returning null', () => {
    document.querySelector = jest.fn().mockReturnValue(null);

    expect(() => {
      render(<WebReportPage {...defaultProps} />);
    }).not.toThrow();
  });
});
