import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'];

export default function Navbar() {
  const { city, setCity, isSignedIn, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-700 hover:from-blue-600 hover:to-indigo-800 transition-all">
            PriceWise
          </Link>
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            className="border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm p-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <NotificationBell />
              
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-700 text-white font-bold shadow-md hover:ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900 transition-all"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 animate-fade-in-down">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    {user?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-600 transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link 
                      to="/dashboard" 
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-green-600 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => { setDropdownOpen(false); handleLogout(); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
