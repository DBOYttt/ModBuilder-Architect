import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Minimal React Error Boundary to surface runtime errors instead of white screen.
 * Wraps the entire app and displays error details on crash.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Log to console for debugging
    // eslint-disable-next-line no-console -- intentional: canonical componentDidCatch error log
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const isDev = import.meta.env.DEV;

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e293b',
            color: '#f1f5f9',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '2rem',
            boxSizing: 'border-box',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f87171' }}>
            Something went wrong
          </h1>
          <p style={{ marginBottom: '1.5rem', color: '#94a3b8', textAlign: 'center' }}>
            The application encountered an unexpected error.
          </p>

          {isDev && error && (
            <div
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '0.5rem',
                padding: '1rem',
                maxWidth: '600px',
                width: '100%',
                marginBottom: '1.5rem',
                overflow: 'auto',
              }}
            >
              <p style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {error.name}: {error.message}
              </p>
              {errorInfo?.componentStack && (
                <pre
                  style={{
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}
                >
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}

          <button
            onClick={this.handleReload}
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
