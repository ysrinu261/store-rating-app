import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/;

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (form.newPassword.length < 8 || form.newPassword.length > 16 || !PASSWORD_RULE.test(form.newPassword)) {
      setMessage({ type: 'error', text: 'New password must be 8-16 characters with 1 uppercase letter and 1 special character.' });
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.patch('/auth/update-password', form);
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand-100 text-brand-600 p-3 rounded-full mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold">Change Password</h1>
        </div>

        {message && (
          <div
            className={`mb-4 text-sm rounded-md px-3 py-2 border ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              required
              value={form.currentPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-gray-400 font-normal">(8–16 chars, 1 uppercase, 1 special char)</span>
            </label>
            <input
              type="password"
              name="newPassword"
              required
              value={form.newPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-md transition"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
