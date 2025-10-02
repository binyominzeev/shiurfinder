import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-primary-600';
  };

  if (!user) {
    return null; // Don't show navbar on login/signup pages
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary-600">
              MyShiurim
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/" className={`px-3 py-2 transition-colors ${isActive('/')}`}> 
                Dashboard
              </Link>
              <Link to="/discovery" className={`px-3 py-2 transition-colors ${isActive('/discovery')}`}> 
                Discover
              </Link>
              <Link to="/favorites" className={`px-3 py-2 transition-colors ${isActive('/favorites')}`}> 
                Favorites
              </Link>
              {user.email === 'szvbinjomin@gmail.com' && (
                <Link to="/admin-upload" className={`px-3 py-2 transition-colors ${isActive('/admin-upload')}`}> 
                  Admin Upload
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Hello, {user.username}</span>
            <button 
              onClick={logout}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-4">
            <Link to="/" className={`px-3 py-2 text-sm transition-colors ${isActive('/')}`}> 
              Dashboard
            </Link>
            <Link to="/discovery" className={`px-3 py-2 text-sm transition-colors ${isActive('/discovery')}`}> 
              Discover
            </Link>
            <Link to="/favorites" className={`px-3 py-2 text-sm transition-colors ${isActive('/favorites')}`}> 
              Favorites
            </Link>
            {user.email === 'szvbinjomin@gmail.com' && (
              <Link to="/admin-upload" className={`px-3 py-2 text-sm transition-colors ${isActive('/admin-upload')}`}> 
                Admin Upload
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;