import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, LogOut, LayoutDashboard, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const roleLabel = {
  ADMIN: 'Administrator',
  NORMAL_USER: 'User',
  STORE_OWNER: 'Store Owner',
};

const roleHome = {
  ADMIN: '/admin/dashboard',
  NORMAL_USER: '/stores',
  STORE_OWNER: '/owner/dashboard',
};

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to={isAuthenticated ? roleHome[user.role] : '/login'}
          className="flex items-center gap-2 font-semibold text-brand-700"
        >
          <Store className="w-5 h-5" />
          Store Rating
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline text-gray-500">
              {user.name} · <span className="font-medium text-gray-700">{roleLabel[user.role]}</span>
            </span>
            <Link
              to={roleHome[user.role]}
              className="flex items-center gap-1 text-gray-600 hover:text-brand-600"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/change-password" className="flex items-center gap-1 text-gray-600 hover:text-brand-600">
              <KeyRound className="w-4 h-4" /> Password
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
