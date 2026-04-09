import { useEffect, useState } from 'react';
import { connectSocket, offEvent, onEvent } from '../services/socket';
import { useAuth } from '../context/AuthContext';

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
