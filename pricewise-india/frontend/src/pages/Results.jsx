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
      fetchApi(`/prices/compare?item=${encodeURIComponent(item)}&city=${encodeURIComponent(city)}`),
      fetchApi(`/prices/history?item=${encodeURIComponent(item)}&days=30`)
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
