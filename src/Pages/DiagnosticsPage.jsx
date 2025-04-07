import React from 'react';
import { Link } from 'react-router-dom';
import FixEnvironment from '../components/FixEnvironment';

/**
 * A standalone page for diagnosing and fixing environment issues
 */
const DiagnosticsPage = () => {
  return (
    <div className="bg-base min-h-screen">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-serif font-medium text-stone-800">
            Benchlot Diagnostics
          </h1>
          <Link 
            to="/"
            className="px-4 py-2 bg-forest-700 text-white rounded-md hover:bg-forest-800"
          >
            Return to Homepage
          </Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-medium text-stone-800 mb-4">
            Environment Diagnostics
          </h2>
          <p className="text-stone-600 mb-6">
            This tool helps diagnose and fix issues with the Benchlot application environment.
            If you're experiencing problems like images not loading or authentication errors,
            try running the diagnostic tool below.
          </p>
        </div>
        
        <FixEnvironment />
        
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-xl font-medium text-stone-800 mb-4">
            Common Issues
          </h2>
          <ul className="space-y-4 text-stone-600">
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span><strong>Profile images not displaying:</strong> This is often caused by environment configuration issues or CORS problems. The diagnostic tool above should fix this.</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span><strong>Authentication errors:</strong> If you can't log in or your session keeps expiring, try clearing your browser cache and cookies, then run the diagnostic tool.</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span><strong>Blank pages or content not loading:</strong> This could be due to JavaScript errors. Try pressing F12 to open your browser's developer tools and check the Console tab for errors.</span>
            </li>
          </ul>
        </div>
      </main>
      
      <footer className="bg-stone-800 text-white py-6 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-stone-300 text-sm">
            If you continue to experience issues, please contact support at support@benchlot.com
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DiagnosticsPage;