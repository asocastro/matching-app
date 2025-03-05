import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/dashboard" className="text-xl font-bold">
            Seeker-Provider Match
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="hover:text-indigo-200">
              Dashboard
            </Link>
            <Link to="/profile" className="hover:text-indigo-200">
              Profile
            </Link>
            <Link to="/matches" className="hover:text-indigo-200">
              Matches
            </Link>
            <div className="flex items-center">
              <span className="mr-4">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;