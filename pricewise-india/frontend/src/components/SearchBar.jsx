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
      navigate(`/results?item=${encodeURIComponent(query)}&city=${city}`);
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
