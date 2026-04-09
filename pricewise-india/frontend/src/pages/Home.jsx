import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import { useAppAuthContext } from '../context/AuthContext';

const PLATFORMS = ['Zomato', 'Swiggy', 'Blinkit', 'Zepto', 'BigBasket', 'DMart', 'JioMart'];
const SUGGESTIONS = ["Paneer Butter Masala", "Amul Milk 1L", "Bread", "Eggs", "Onion 1kg", "Maggi"];

export default function Home() {
  const navigate = useNavigate();
  const { city } = useAppAuthContext();

  const handleSuggestion = (item) => {
    navigate(`/results?item=${encodeURIComponent(item)}&city=${city}`);
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
