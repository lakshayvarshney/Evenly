// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-indigo-700 text-white px-6 py-4 shadow-lg">
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">Evenly</Link>
      <div className="space-x-4">
        <Link to="/login" className="hover:underline">Login</Link>
        <Link to="/signup" className="bg-white text-indigo-700 px-4 py-2 rounded hover:bg-gray-200 font-medium">Sign Up</Link>
      </div>
    </div>
  </nav>
);

export default Navbar;
