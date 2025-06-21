import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');

    navigate('/login');
  };

  return (
    <div className="w-[calc(100%-16rem)] h-16 bg-blue-500 text-white flex items-center justify-between px-6 fixed top-0 left-64 shadow-md">

      <div className="flex items-center space-x-6">
        <a href="#" className="hover:text-blue-300">Home</a>
        <a href="#" className="hover:text-blue-300">About</a>
        <a href="#" className="hover:text-blue-300">Contact</a>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-lg font-semibold">{userName}</span>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="bg-blue-700 px-3 py-1 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
