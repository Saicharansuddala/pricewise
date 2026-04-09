const fs = require('fs');
const path = require('path');

const write = (p, content) => {
  const fullPath = path.join(__dirname, p);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
}

write('src/components/SearchBar.jsx', `
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppAuthContext } from '../context/AuthContext';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { city } = useAppAuthContext();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      navigate(\`/results?item=\${encodeURIComponent(query)}&city=\${city}\`);
    }, 300);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for groceries..."
        className="w-full px-5 py-4 rounded-full border-2 border-green-500 shadow-md focus:outline-none focus:ring-2 dark:bg-gray-800 dark:border-green-600 text-lg"
      />
      {query && (
        <button type="button" onClick={() => setQuery('')} className="absolute right-24 text-gray-400 text-2xl hover:text-gray-600">
          &times;
        </button>
      )}
      <button type="submit" disabled={isSearching} className="absolute right-2 bg-green-600 text-white px-6 py-2.5 rounded-full font-bold">
        {isSearching ? '...' : 'Search'}
      </button>
    </form>
  );
}
`);

write('src/pages/Home.jsx', `
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import { useAppAuthContext } from '../context/AuthContext';

const PLATFORMS = ['Zomato', 'Swiggy', 'Blinkit', 'Zepto', 'BigBasket', 'DMart', 'JioMart'];
const SUGGESTIONS = ["Paneer Butter Masala", "Amul Milk 1L", "Bread", "Eggs", "Onion 1kg", "Maggi"];

export default function Home() {
  const navigate = useNavigate();
  const { city } = useAppAuthContext();

  const handleSuggestion = (item) => {
    navigate(\`/results?item=\${encodeURIComponent(item)}&city=\${city}\`);
  };

  return (
    <div className="flex flex-col items-center justify-center pt-20 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">
        Compare prices across 7 platforms instantly
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">Stop overpaying for groceries. Get the smartest basket in {city}.</p>
      
      <div className="w-full mb-8"><SearchBar /></div>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => handleSuggestion(s)} className="bg-gray-100 hover:bg-green-100 dark:bg-gray-800 px-4 py-2 rounded-full text-sm">
            {s}
          </button>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-gray-500 font-medium uppercase tracking-widest mb-6">Supported Platforms</p>
        <div className="flex flex-wrap justify-center gap-4">
          {PLATFORMS.map(p => (
            <span key={p} className="px-4 py-2 bg-white dark:bg-gray-800 shadow-sm border rounded-lg font-semibold dark:border-gray-700">
               {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
`);

write('src/components/PriceTable.jsx', `
import { useAuth } from '@clerk/clerk-react';

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
             <tr key={p.platform} className={\`border-b dark:border-gray-700 \${!p.inStock ? 'opacity-50' : idx === 0 ? 'bg-green-50 dark:bg-green-900/20' : ''}\`}>
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
`);

write('src/components/PriceChart.jsx', `
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#FF0000', '#F57C00', '#FBC02D', '#388E3C', '#1976D2', '#7B1FA2', '#C2185B'];
const MOCK_PLATFORMS = ['zomato', 'swiggy', 'blinkit', 'zepto', 'bigbasket', 'dmart', 'jiomart'];

export default function PriceChart({ history }) {
  const data = [];
  if (history) {
    const datesMap = {};
    Object.keys(history).forEach(platform => {
      history[platform].forEach(point => {
        const d = new Date(point.scrapedAt).toLocaleDateString();
        if (!datesMap[d]) datesMap[d] = { name: d };
        datesMap[d][platform] = point.totalPrice;
      });
    });
    data.push(...Object.values(datesMap));
  }

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4">30-Day Price History</h3>
      {data.length === 0 ? <p className="text-gray-500">Not enough data to plot.</p> :
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {MOCK_PLATFORMS.map((plat, i) => <Line key={plat} type="monotone" dataKey={plat} stroke={COLORS[i % COLORS.length]} />)}
        </LineChart>
      </ResponsiveContainer>
      }
    </div>
  );
}
`);

write('src/pages/Results.jsx', `
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchApi } from '../services/api';
import PriceTable from '../components/PriceTable';
import PriceChart from '../components/PriceChart';

export default function Results() {
  const [params] = useSearchParams();
  const item = params.get('item');
  const city = params.get('city');

  const [prices, setPrices] = useState([]);
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item) return;
    setLoading(true);
    
    Promise.all([
      fetchApi(\`/prices/compare?item=\${encodeURIComponent(item)}&city=\${encodeURIComponent(city)}\`),
      fetchApi(\`/prices/history?item=\${encodeURIComponent(item)}&days=30\`)
    ]).then(([priceData, historyData]) => {
      setPrices(priceData);
      setHistory(historyData);
    }).catch(console.error).finally(() => setLoading(false));

  }, [item, city]);

  if (loading) return <div className="p-10 text-center text-xl animate-pulse">Loading prices...</div>;

  const cheapest = prices.length > 0 ? prices[0] : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-md text-sm">
        Showing prices for <span className="font-bold">"{item}"</span> in {city}
      </div>

      {cheapest && (
        <div className="bg-green-100 border-l-4 border-green-600 p-6 rounded-md shadow-sm dark:bg-green-900/30 flex flex-wrap justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-green-800 dark:text-green-400">Lowest Price: ₹{cheapest.totalPrice}</h2>
            <p className="text-green-700 dark:text-green-300 capitalize text-sm">On {cheapest.platform}</p>
          </div>
          <a href={cheapest.directUrl} target="_blank" rel="noreferrer" className="bg-green-600 text-white px-5 py-2.5 rounded shadow font-bold hover:bg-green-700 mt-2 sm:mt-0">
            Buy on {cheapest.platform}
          </a>
        </div>
      )}

      {prices.length > 0 ? (
        <>
          <PriceTable prices={prices} />
          <PriceChart history={history} />
        </>
      ) : (
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow">No results found spanning platforms.</div>
      )}
    </div>
  );
}
`);

write('src/components/AlertCard.jsx', `
import { fetchApi } from '../services/api';
import { useAuth } from '@clerk/clerk-react';

export default function AlertCard({ alert, onRefresh }) {
  const { getToken } = useAuth();
  const handleDelete = async () => {
    try {
      await fetchApi(\`/alerts/\${alert._id}\`, { method: 'DELETE', token: await getToken() });
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
`);

write('src/pages/Dashboard.jsx', `
import { useEffect, useState } from 'react';
import { UserProfile, useAuth } from '@clerk/clerk-react';
import { fetchApi } from '../services/api';
import AlertCard from '../components/AlertCard';
import { useAppAuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState([]);
  const { getToken } = useAuth();
  const { city } = useAppAuthContext();

  const loadAlerts = async () => {
    try { setAlerts(await fetchApi('/alerts', { token: await getToken() })); } 
    catch(e) { console.error(e); }
  };

  useEffect(() => { loadAlerts(); }, []);

  const handleAddMockAlert = async () => {
    try {
      await fetchApi('/alerts', { method: 'POST', token: await getToken(), body: { itemName: "Sample Item", targetPrice: 50, city } });
      loadAlerts();
    } catch(e) { alert(e.message); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="flex gap-4 border-b mb-6 border-gray-200 dark:border-gray-700">
        <button className={\`py-2 font-semibold \${activeTab==='alerts'?'border-b-2 border-green-600 text-green-600':''}\`} onClick={() => setActiveTab('alerts')}>My Alerts</button>
        <button className={\`py-2 font-semibold \${activeTab==='profile'?'border-b-2 border-green-600 text-green-600':''}\`} onClick={() => setActiveTab('profile')}>Profile</button>
      </div>
      {activeTab === 'alerts' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Active Price Alerts</h2>
            <button onClick={handleAddMockAlert} className="bg-green-600 text-white px-4 py-2 rounded">+ Add Alert</button>
          </div>
          <div className="grid gap-4">
            {alerts.length === 0 ? <p className="text-gray-500">No active alerts.</p> : alerts.map(a => <AlertCard key={a._id} alert={a} onRefresh={loadAlerts} />)}
          </div>
        </div>
      )}
      {activeTab === 'profile' && <div className="flex justify-center"><UserProfile routing="hash" /></div>}
    </div>
  );
}
`);

write('src/pages/AdminPanel.jsx', `
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchApi } from '../services/api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('users');
  const { getToken } = useAuth();
  
  const [scrapeItem, setScrapeItem] = useState('');
  const [scrapeCity, setScrapeCity] = useState('Mumbai');

  useEffect(() => {
    const load = async () => {
      try {
        if (tab === 'users') {
          const u = await fetchApi('/admin/users?limit=20&offset=0', { token: await getToken() });
          setUsers(u.data || []);
        }
      } catch (e) {
        console.error("Admin error", e);
      }
    };
    load();
  }, [tab, getToken]);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-red-600">Admin Control Panel</h1>
      <div className="flex gap-4 border-b mb-6 dark:border-gray-700">
        <button onClick={() => setTab('users')} className={\`py-2 font-semibold \${tab==='users'?'border-b-2 border-red-600 text-red-600':''}\`}>Users</button>
        <button onClick={() => setTab('scrape')} className={\`py-2 font-semibold \${tab==='scrape'?'border-b-2 border-red-600 text-red-600':''}\`}>Manual Scrape</button>
      </div>

      {tab === 'users' && (
         <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
           <table className="w-full text-left">
             <thead><tr className="border-b"><th className="pb-2">ID</th><th className="pb-2">Email</th></tr></thead>
             <tbody>{users.map(u => (<tr key={u.id} className="border-b"><td className="py-2 text-xs">{u.id}</td><td>{u.emailAddresses?.[0]?.emailAddress}</td></tr>))}</tbody>
           </table>
         </div>
      )}
      {tab === 'scrape' && (
        <form onSubmit={e => e.preventDefault()} className="bg-white dark:bg-gray-800 p-6 rounded max-w-md shadow">
          <input className="w-full mb-3 p-2 border rounded" placeholder="Item" value={scrapeItem} onChange={e=>setScrapeItem(e.target.value)} />
          <input className="w-full mb-4 p-2 border rounded" placeholder="City" value={scrapeCity} onChange={e=>setScrapeCity(e.target.value)} />
          <button className="bg-red-600 text-white px-4 py-2 w-full rounded font-bold" type="button">Trigger Core Pipeline</button>
        </form>
      )}
    </div>
  );
}
`);
console.log('Batch 2 generated');
