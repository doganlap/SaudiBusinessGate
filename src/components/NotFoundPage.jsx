import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, AlertCircle } from 'lucide-react';

/**
 * ==========================================
 * 404 NOT FOUND PAGE
 * ==========================================
 * 
 * Professional 404 error page with:
 * - Clear error message
 * - Navigation suggestions
 * - Search functionality
 * - Modern design
 */

const NotFoundPage = () => {
  const quickLinks = [
    { to: "/", label: "Homepage", icon: <Home className="w-4 h-4" /> },
    { to: "/dashboard", label: "Dashboard", icon: <Search className="w-4 h-4" /> },
    { to: "/demo-showcase", label: "Demo Showcase", icon: <Search className="w-4 h-4" /> },
    { to: "/organizations", label: "Organizations", icon: <Search className="w-4 h-4" /> },
    { to: "/assessments", label: "Assessments", icon: <Search className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-red-100 rounded-full">
            <AlertCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 className="text-8xl md:text-9xl font-bold text-gray-300 mb-2">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Where would you like to go?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="flex items-center justify-center px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-300 font-medium"
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6 bg-blue-50 rounded-xl">
          <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
          <p className="text-blue-700">
            If you believe this is an error, please contact our support team or check the 
            <Link to="/dashboard" className="underline hover:no-underline mx-1">
              system dashboard
            </Link>
            for more information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;