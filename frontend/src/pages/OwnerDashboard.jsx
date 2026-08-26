import React, { useEffect, useState } from 'react';
import { Star, MapPin, Users } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('/owner/dashboard');
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="max-w-4xl mx-auto px-4 py-8 text-sm text-gray-500">Loading…</p>;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-md px-4 py-3 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-1">{data.store.name}</h1>
      <p className="text-sm text-gray-500 flex items-center gap-1 mb-6">
        <MapPin className="w-3.5 h-3.5" /> {data.store.address}
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="bg-amber-50 text-amber-500 p-3 rounded-lg">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Average Rating</p>
            <p className="text-2xl font-semibold">
              {data.averageRating === 'No ratings yet' ? '—' : `${data.averageRating} / 5`}
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="bg-brand-50 text-brand-600 p-3 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Ratings</p>
            <p className="text-2xl font-semibold">{data.totalRatings}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Customer Feedback</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.raters.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  No ratings submitted yet.
                </td>
              </tr>
            ) : (
              data.raters.map((r) => (
                <tr key={r.ratingId} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{r.user.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{r.user.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 text-gray-700">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {r.value}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
