import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header';
import Footer from './Footer';

/**
 * Layout component that wraps all pages with consistent header and footer
 * Uses Outlet from react-router-dom to render nested route components
 */
const Layout = () => {
  return (
    <div className="bg-base min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;