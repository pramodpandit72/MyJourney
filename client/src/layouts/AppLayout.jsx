import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.jsx';
import { Footer } from '../components/common/Footer.jsx';

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF8] dark:bg-[#0B1712] text-[#172B24] dark:text-[#F0FDF4] transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
