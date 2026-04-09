import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../services/api';

export default function AdminPanel() {
  const { user, getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  const loadData = async () => {
    try {
      const token = await getToken();
      if (activeTab === 'users') {
        const data = await fetchApi('/admin/users', { token });
        setUsers(data.users || []);
      } else {
        const data = await fetchApi('/admin/logs', { token });
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  if (user?.role !== 'admin') {
    return <div className="text-center mt-20 text-red-600">Access Denied: Admins Only</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Control Panel</h1>
      
      <div className="flex gap-4 border-b mb-6 border-gray-200 dark:border-gray-700">
        <button 
          className={`py-2 px-4 font-semibold ${activeTab==='users'?'border-b-2 border-blue-600 text-blue-600':''}`} 
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
        <button 
          className={`py-2 px-4 font-semibold ${activeTab==='logs'?'border-b-2 border-blue-600 text-blue-600':''}`} 
          onClick={() => setActiveTab('logs')}
        >
          Security Logs
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <th className="p-4 font-semibold text-sm">Name</th>
                <th className="p-4 font-semibold text-sm">Email</th>
                <th className="p-4 font-semibold text-sm">Role</th>
                <th className="p-4 font-semibold text-sm">Status</th>
                <th className="p-4 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${u.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-sm text-red-600 hover:text-red-800">Ban</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="mb-2 border-b border-gray-800 pb-1">
              <span className="text-gray-500">[{new Date(log.timestamp).toLocaleString()}]</span>{' '}
              <span className={log.action.includes('fail') ? 'text-red-400' : 'text-blue-400'}>{log.action}</span>{' '}
              <span className="text-gray-300">- User: {log.userId} IP: {log.ipAddress}</span>
            </div>
          ))}
          {logs.length === 0 && <div className="text-gray-500">No logs available.</div>}
        </div>
      )}
    </div>
  );
}
