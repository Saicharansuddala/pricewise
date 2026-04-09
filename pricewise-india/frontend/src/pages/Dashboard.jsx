import { useEffect, useState } from 'react';
import { fetchApi } from '../services/api';
import AlertCard from '../components/AlertCard';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState([]);
  const { getToken, user, city, logout } = useAuth();

  const loadAlerts = async () => {
    try { 
      const token = await getToken();
      setAlerts(await fetchApi('/alerts', { token })); 
    } catch(e) { 
      console.error(e); 
    }
  };

  useEffect(() => { loadAlerts(); }, []);

  const handleAddMockAlert = async () => {
    try {
      const token = await getToken();
      await fetchApi('/alerts', { 
        method: 'POST', 
        token, 
        body: { itemName: "Sample Item", targetPrice: 50, city } 
      });
      loadAlerts();
    } catch(e) { 
      alert(e.message); 
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="flex gap-6 border-b mb-6 border-gray-200 dark:border-gray-700">
        <button 
          className={`py-3 px-2 font-semibold transition-colors relative ${activeTab==='alerts'?'text-blue-600':'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`} 
          onClick={() => setActiveTab('alerts')}
        >
          My Alerts
          {activeTab === 'alerts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-lg"></div>}
        </button>
        <button 
          className={`py-3 px-2 font-semibold transition-colors relative ${activeTab==='profile'?'text-blue-600':'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`} 
          onClick={() => setActiveTab('profile')}
        >
          Profile
          {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-lg"></div>}
        </button>
      </div>
      
      {activeTab === 'alerts' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Active Price Alerts</h2>
            <button 
              onClick={handleAddMockAlert} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
            >
              + Add Alert
            </button>
          </div>
          <div className="grid gap-4">
            {alerts.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center border border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No active alerts.</p>
                <p className="text-sm text-gray-500 mt-1">Create an alert to track price drops!</p>
              </div>
            ) : (
              alerts.map(a => <AlertCard key={a._id} alert={a} onRefresh={loadAlerts} />)
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="animate-fade-in max-w-2xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-700"></div>
            <div className="px-8 pb-8">
              <div className="relative flex justify-between items-end -mt-12 mb-6">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 flex items-center justify-center text-4xl text-white font-bold shadow-inner">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold dark:text-white">{user?.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Role</p>
                    <p className="font-medium capitalize">{user?.role || 'User'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">City</p>
                    <p className="font-medium capitalize">{user?.city || city || 'Unknown'}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
