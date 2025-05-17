import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-gray-800 fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-white text-xl font-bold">Expense Tracker</h1>
      </div>
      <nav className="mt-8">
        <Link
          to="/income"
          className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 ${
            location.pathname === '/income' ? 'bg-gray-700' : ''
          }`}
        >
          <span className="mx-3">Income</span>
        </Link>
        <Link
          to="/expenses"
          className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 ${
            location.pathname === '/expenses' ? 'bg-gray-700' : ''
          }`}
        >
          <span className="mx-3">Expenses</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;