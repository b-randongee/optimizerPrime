import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Error Boundary to catch React component errors and show user-friendly fallback
 * Prevents white screen crashes when components throw errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    // Reset error state and trigger re-render
    this.setState({ hasError: false, error: null, errorInfo: null });

    // Call optional onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="rounded-3xl border-2 border-red-200 bg-red-50 p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">
                Something went wrong
              </h3>
              <p className="mt-2 text-sm text-red-700">
                {this.props.fallbackMessage ||
                  "An error occurred while displaying this content. This might be due to corrupted data or an unexpected issue."}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs font-semibold text-red-800 hover:text-red-900">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 overflow-auto rounded-lg bg-red-100 p-3 text-xs text-red-900">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50"
                >
                  Try Again
                </button>
                {this.props.showReloadButton && (
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                  >
                    Reload Page
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
