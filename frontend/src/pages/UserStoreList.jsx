import React, { useEffect, useState, useCallback } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import StarRating from '../components/StarRating.jsx';

export default function UserStoreList() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/stores', { params: { search, sortBy, order } });
      setStores(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores.');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, order]);

  useEffect(() => {
    const timeout = setTimeout(fetchStores, 300); // debounce search typing
    return () => clearTimeout(timeout);
  }, [fetchStores]);

  const handleRate = async (storeId, value) => {
    setSavingId(storeId);
    try {
      await axiosInstance.post(`/stores/${storeId}/rate`, { value });
      setStores((prev) =>
        prev.map((s) => (s.id === storeId ? { ...s, userSubmittedRating: value } : s))
      );
      // refresh to get the updated overall average from the server
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Browse Stores</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or address"
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm w-64 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <select
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split('-');
              setSortBy(f);
              setOrder(o);
            }}
            className="border border-gray-300 rounded-md text-sm px-2 py-2 outline-none"
          >
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="address-asc">Address (A–Z)</option>
            <option value="address-desc">Address (Z–A)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{error}</div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading stores…</p>
      ) : stores.length === 0 ? (
        <p className="text-gray-500 text-sm">No stores found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">{store.name}</h2>
                <p className="text-xs text-gray-500 flex items-start gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {store.address}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium">
                  {store.overallRating === 'No ratings yet' ? 'No ratings yet' : `${store.overallRating} / 5`}
                </span>
                <span className="text-gray-400">overall</span>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 mb-1.5">
                  {store.userSubmittedRating ? 'Your rating (tap to change)' : 'Tap to rate this store'}
                </p>
                <StarRating
                  currentRating={store.userSubmittedRating || 0}
                  onRatingSubmit={(value) => handleRate(store.id, value)}
                  disabled={savingId === store.id}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
