import React from 'react';
import config from '@plone/volto/registry';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      //pass error to error-reporting service
      config.settings.errorHandlers.forEach((handler) => handler(error));
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
      if (ErrorPage) {
        // You can render any custom fallback UI
        return <ErrorPage name={this.props.name} error={this.state.error} />;
      } else {
        return <pre className="error">{`<error: ${this.props.name}>`}</pre>;
      }
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
