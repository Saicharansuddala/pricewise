const fs = require('fs');
const path = require('path');

const write = (p, content) => {
  const fullPath = path.join(__dirname, p);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
}

write('src/index.css', `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100;
}
`);

write('src/main.jsx', `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
`);

write('src/App.jsx', `
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider } from './context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
`);

write('src/context/AuthContext.jsx', `
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [city, setCity] = useState(localStorage.getItem('pricewise_city') || 'Mumbai');

  useEffect(() => {
    localStorage.setItem('pricewise_city', city);
  }, [city]);

  return (
    <AuthContext.Provider value={{ city, setCity }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuthContext = () => useContext(AuthContext);
`);

write('src/components/Navbar.jsx', `
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { useAppAuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'];

export default function Navbar() {
  const { city, setCity } = useAppAuthContext();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-green-700 dark:text-green-500">
            PriceWise
          </Link>
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm p-1"
          >
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-gray-600 dark:text-gray-300 font-medium hover:text-green-600">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700">Sign Up</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <NotificationBell />
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
`);

write('src/components/NotificationBell.jsx', `
import { useEffect, useState } from 'react';
import { connectSocket, offEvent, onEvent } from '../services/socket';
import { useAuth } from '@clerk/clerk-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    const initSocket = async () => {
      await connectSocket(getToken);
      onEvent('price_alert', (data) => {
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    };
    initSocket();
    return () => offEvent('price_alert');
  }, [getToken]);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="text-2xl focus:outline-none">
        🔔 {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 shadow-xl rounded-lg border z-50">
          <div className="p-3 border-b flex justify-between">
            <span className="font-semibold">Alerts</span>
            <button className="text-xs text-green-600" onClick={() => setUnreadCount(0)}>Mark Read</button>
          </div>
          <div className="max-h-60 overflow-y-auto p-2 text-sm">
            {notifications.length === 0 ? <p className="text-gray-500 text-center py-2">No alerts</p> : 
              notifications.map((n, i) => (
                <div key={i} className="p-2 border-b last:border-0">
                  <strong>{n.itemName}</strong> dropped to ₹{n.totalPrice} on {n.platform}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
`);

write('src/services/api.js', `
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchApi = async (endpoint, options = {}) => {
  const url = \`\${API_URL}\${endpoint}\`;
  if (options.token) {
    options.headers = { ...options.headers, 'Authorization': \`Bearer \${options.token}\` };
  }
  if (options.body && typeof options.body !== 'string') {
    options.body = JSON.stringify(options.body);
    options.headers = { ...options.headers, 'Content-Type': 'application/json' };
  }
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text() || res.statusText);
  return res.json();
};
`);
console.log('Batch 1 generated');
