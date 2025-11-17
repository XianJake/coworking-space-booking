import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut, Calendar, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary-navy">
              CoWork<span className="text-accent-orange">Space</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/spaces"
              className="text-gray-dark hover:text-accent-orange font-medium transition-colors"
            >
              Spaces
            </Link>
            <Link
              to="/membership"
              className="text-gray-dark hover:text-accent-orange font-medium transition-colors"
            >
              Membership
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/my-bookings"
                  className="text-gray-dark hover:text-accent-orange font-medium transition-colors flex items-center gap-2"
                >
                  <Calendar size={18} />
                  My Bookings
                </Link>
                
                {(user.role === 'admin' || user.role === 'staff') && (
                  <Link
                    to="/admin"
                    className="text-gray-dark hover:text-accent-orange font-medium transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard size={18} />
                    Admin
                  </Link>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-light rounded-lg">
                    <User size={18} className="text-primary-navy" />
                    <span className="text-sm font-medium text-gray-dark">
                      {user.name}
                      {user.isMember && (
                        <span className="ml-2 text-xs bg-accent-orange text-white px-2 py-0.5 rounded-full">
                          Member
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-dark hover:text-accent-orange transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-dark hover:text-accent-orange font-medium">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/spaces"
              className="block text-gray-dark hover:text-accent-orange font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Spaces
            </Link>
            <Link
              to="/membership"
              className="block text-gray-dark hover:text-accent-orange font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Membership
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/my-bookings"
                  className="block text-gray-dark hover:text-accent-orange font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
                
                {(user.role === 'admin' || user.role === 'staff') && (
                  <Link
                    to="/admin"
                    className="block text-gray-dark hover:text-accent-orange font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium text-gray-dark mb-2">
                    {user.name}
                    {user.isMember && (
                      <span className="ml-2 text-xs bg-accent-orange text-white px-2 py-0.5 rounded-full">
                        Member
                      </span>
                    )}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-3 border-t">
                <Link
                  to="/login"
                  className="block text-gray-dark hover:text-accent-orange font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block btn-primary text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
