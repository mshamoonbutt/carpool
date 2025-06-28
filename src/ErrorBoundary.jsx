import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ React Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 text-white flex items-center justify-center p-4">
          <div className="bg-red-800 p-6 rounded-lg max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">❌ React Application Error</h1>
            <p className="mb-4">Something went wrong in the React application:</p>
            
            {this.state.error && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Error:</h2>
                <pre className="bg-red-900 p-3 rounded text-sm overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            
            {this.state.errorInfo && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Component Stack:</h2>
                <pre className="bg-red-900 p-3 rounded text-sm overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            
            <div className="flex gap-4">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded"
              >
                Reload Application
              </button>
              <button 
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })} 
                className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 