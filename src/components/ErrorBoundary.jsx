import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * ==========================================
 * ERROR BOUNDARY COMPONENT
 * ==========================================
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the
 * component tree that crashed.
 * 
 * Features:
 * - Professional error display
 * - Error details for development
 * - Recovery options
 * - Navigation links
 */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertTriangle className="w-12 h-12 text-red-600" />
                </div>
              </div>

              {/* Error Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Oops! Something went wrong
                </h1>
                <p className="text-lg text-gray-600">
                  We encountered an unexpected error. Don't worry, our team has been notified 
                  and is working to fix this issue.
                </p>
              </div>

              {/* Error Actions */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </button>
                
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 font-medium"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </a>
              </div>

              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Bug className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">
                      Error Details (Development Mode)
                    </h3>
                  </div>
                  
                  {this.state.error && (
                    <div className="mb-4">
                      <h4 className="font-medium text-red-700 mb-2">Error:</h4>
                      <pre className="bg-red-50 p-3 rounded border text-sm text-red-800 overflow-x-auto">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                  )}

                  {this.state.errorInfo && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Component Stack:</h4>
                      <pre className="bg-red-50 p-3 rounded border text-sm text-red-800 overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Help Information */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700 text-center">
                  If this problem persists, please contact our support team with the error details above.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;