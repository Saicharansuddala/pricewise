import { fetchApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AlertCard({ alert, onRefresh }) {
  const { getToken } = useAuth();
  const handleDelete = async () => {
    try {
      await fetchApi(`/alerts/${alert._id}`, { method: 'DELETE', token: await getToken() });
      onRefresh();
    } catch(e) { console.error(e); }
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center">
      <div>
        <h4 className="font-bold">{alert.itemName}</h4>
        <p className="text-sm">Target: ₹{alert.targetPrice} | City: {alert.city}</p>
      </div>
      <button onClick={handleDelete} className="text-red-500 font-bold">&times;</button>
    </div>
  );
}
