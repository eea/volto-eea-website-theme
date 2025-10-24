import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@plone/volto/components';
import withErrorBoundary from './withErrorBoundary';

// Mock the ErrorBoundary component from Volto
jest.mock('@plone/volto/components', () => ({
  ErrorBoundary: jest.fn(({ children, fallback, onError }) => {
    try {
      return children;
    } catch (error) {
      if (onError) onError(error, { componentStack: 'test-stack' });
      return fallback || <div>Error occurred</div>;
    }
  }),
}));

// Test components
const TestComponent = ({ shouldThrow, message = 'Hello World' }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>{message}</div>;
};

const CustomFallback = () => <div>Custom error fallback</div>;

describe('withErrorBoundary HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should render the wrapped component normally', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);
      render(<WrappedComponent message="Test message" />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should pass through all props to the wrapped component', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);
      render(<WrappedComponent message="Test props" data-testid="test" />);

      expect(screen.getByText('Test props')).toBeInTheDocument();
    });
  });

  describe('Error boundary configuration', () => {
    it('should use default ErrorBoundary when no fallback is provided', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);
      render(<WrappedComponent />);

      expect(ErrorBoundary).toHaveBeenCalledWith(
        expect.objectContaining({
          fallback: null,
          onError: null,
        }),
        expect.any(Object),
      );
    });

    it('should accept a custom fallback component', () => {
      const WrappedComponent = withErrorBoundary(TestComponent, {
        fallback: CustomFallback,
      });
      render(<WrappedComponent />);

      expect(ErrorBoundary).toHaveBeenCalledWith(
        expect.objectContaining({
          fallback: CustomFallback,
        }),
        expect.any(Object),
      );
    });

    it('should handle backward compatibility with fallback as second parameter', () => {
      const WrappedComponent = withErrorBoundary(TestComponent, CustomFallback);
      render(<WrappedComponent />);

      expect(ErrorBoundary).toHaveBeenCalledWith(
        expect.objectContaining({
          fallback: CustomFallback,
        }),
        expect.any(Object),
      );
    });

    it('should call onError callback when provided', () => {
      const onErrorMock = jest.fn();
      const WrappedComponent = withErrorBoundary(TestComponent, {
        onError: onErrorMock,
      });
      render(<WrappedComponent />);

      expect(ErrorBoundary).toHaveBeenCalledWith(
        expect.objectContaining({
          onError: onErrorMock,
        }),
        expect.any(Object),
      );
    });
  });
});
