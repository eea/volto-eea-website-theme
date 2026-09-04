import React from 'react';
import { render, act } from '@testing-library/react';
import withDeviceSize from './withDeviceSize.jsx';

describe('withDeviceSize HOC', () => {
  // Mock the WrappedComponent
  const WrappedComponent = ({ device }) => (
    <div data-testid="device">{device}</div>
  );

  const mockResize = (width) => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    window.dispatchEvent(new Event('resize'));
  };

  it('should return mobile for screen width less than 768px', () => {
    const ComponentWithDeviceSize = withDeviceSize(WrappedComponent);

    const { getByTestId } = render(<ComponentWithDeviceSize />);

    act(() => {
      mockResize(500); // Simulating a mobile screen
    });

    expect(getByTestId('device').textContent).toBe('mobile');
  });

  it('should return tablet for screen width between 768px and 992px', () => {
    const ComponentWithDeviceSize = withDeviceSize(WrappedComponent);

    const { getByTestId } = render(<ComponentWithDeviceSize />);

    act(() => {
      mockResize(800); // Simulating a tablet screen
    });

    expect(getByTestId('device').textContent).toBe('tablet');
  });

  it('should return computer for screen width between 992px and 1200px', () => {
    const ComponentWithDeviceSize = withDeviceSize(WrappedComponent);

    const { getByTestId } = render(<ComponentWithDeviceSize />);

    act(() => {
      mockResize(1000); // Simulating a computer screen
    });

    expect(getByTestId('device').textContent).toBe('computer');
  });

  it('should return large for screen width between 1200px and 1920px', () => {
    const ComponentWithDeviceSize = withDeviceSize(WrappedComponent);

    const { getByTestId } = render(<ComponentWithDeviceSize />);

    act(() => {
      mockResize(1500); // Simulating a large screen
    });

    expect(getByTestId('device').textContent).toBe('large');
  });

  it('should return widescreen for screen width above 1920px', () => {
    const ComponentWithDeviceSize = withDeviceSize(WrappedComponent);

    const { getByTestId } = render(<ComponentWithDeviceSize />);

    act(() => {
      mockResize(2000); // Simulating a widescreen display
    });

    expect(getByTestId('device').textContent).toBe('widescreen');
  });
});
