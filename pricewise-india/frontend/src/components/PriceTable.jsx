import { useAuth } from '../context/AuthContext';

export default function PriceTable({ prices }) {
  const { isSignedIn } = useAuth();
  const handleAlert = () => {
    if (!isSignedIn) return alert("Please sign in to set alerts.");
    alert("Alert modal opened.");
  };

  return (
    <div className="overflow-x-auto w-full bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
      <table className="w-full text-left border-collapse min-w-max">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="p-4">Platform</th><th className="p-4">Base</th><th className="p-4">Delivery</th><th className="p-4">Fee</th><th className="p-4 font-bold">Total</th><th className="p-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((p, idx) => (
             <tr key={p.platform} className={`border-b dark:border-gray-700 ${!p.inStock ? 'opacity-50' : idx === 0 ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
               <td className="p-4 font-semibold capitalize">{p.platform}</td>
               <td className="p-4">₹{p.price}</td><td className="p-4">₹{p.deliveryFee}</td><td className="p-4">₹{p.platformFee}</td>
               <td className="p-4 font-bold text-green-700">₹{p.totalPrice}</td>
               <td className="p-4 flex gap-2">
                 {!p.inStock ? <span className="px-3 py-1 bg-gray-200 text-xs rounded">Out of Stock</span> :
                   <a href={p.directUrl} target="_blank" className="px-3 py-1 bg-green-600 text-white rounded text-sm">Buy Now</a>}
                 <button onClick={handleAlert} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">Alert</button>
               </td>
             </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
