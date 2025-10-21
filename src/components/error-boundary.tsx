import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, retry: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log error if needed
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;
    if (error) {
      if (fallback) return fallback(error, this.handleRetry);
      return (
        <div className="p-6 text-center">
          <div className="text-red-600 mb-2">Something went wrong.</div>
          <div className="mb-4">{error.message}</div>
          <button className="px-4 py-2 rounded bg-black text-white" onClick={this.handleRetry}>Retry</button>
        </div>
      );
    }
    return children;
  }
}

export default ErrorBoundary;
