import React from 'react';
import config from '@plone/volto/registry';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      // eslint-disable-next-line
      console.error(error, errorInfo);
    }
  }

  render() {
    const ErrorPage =
      this.props.fallback || config.getComponent('ErrorBoundary').component;
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorPage name={this.props.name} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
