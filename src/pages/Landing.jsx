// src/pages/Landing.jsx
import React from 'react';

import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white">
      
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-indigo-700 mb-6">
          Simplify Shared Expenses
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Split bills, track debts, and settle up easily with Evenly
        </p>
        <Link
          to="/signup"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full text-lg font-medium shadow-md"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default Landing;
