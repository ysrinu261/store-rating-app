import React, { useEffect, useState, useCallback } from 'react';
import { Users, Store as StoreIcon, Star, Search, Plus, X } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import SortableHeader from '../components/SortableHeader.jsx';

const TABS = [
  { key: 'users', label: 'Users' },
  { key: 'stores', label: 'Stores' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('users');
  const [modal, setModal] = useState(null); // 'user' | 'store' | null

  const fetchStats = useCallback(async () => {
    const { data } = await axiosInstance.get('/admin/dashboard-stats');
    setStats(data);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} />
        <StatCard icon={StoreIcon} label="Total Stores" value={stats?.totalStores} />
        <StatCard icon={Star} label="Total Ratings" value={stats?.totalRatings} />
      </div>

      {/* Tabs + actions */}
      <div className="flex items-center justify-between border-b border-gray-200 mb-4">
        <div className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 -mb-px ${
                tab === t.key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModal(tab === 'users' ? 'user' : 'store')}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-2 rounded-md mb-2"
        >
          <Plus className="w-4 h-4" /> {tab === 'users' ? 'Add User' : 'Add Store'}
        </button>
      </div>

      {tab === 'users' ? <UsersTable refreshStats={fetchStats} /> : <StoresTable />}

      {modal === 'user' && (
        <AddUserModal
          onClose={() => setModal(null)}
          onCreated={() => {
            setModal(null);
            fetchStats();
          }}
        />
      )}
      {modal === 'store' && (
        <AddStoreModal
          onClose={() => setModal(null)}
          onCreated={() => {
            setModal(null);
            fetchStats();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
      <div className="bg-brand-50 text-brand-600 p-3 rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-semibold">{value ?? '—'}</p>
      </div>
    </div>
  );
}

function UsersTable({ refreshStats }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/users', { params: { search, role, sortBy, order } });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [search, role, sortBy, order]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or address"
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm w-72 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-gray-300 rounded-md text-sm px-2 py-2 outline-none"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="NORMAL_USER">Normal User</option>
          <option value="STORE_OWNER">Store Owner</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <SortableHeader label="Name" field="name" sortBy={sortBy} order={order} onSort={handleSort} />
              <SortableHeader label="Email" field="email" sortBy={sortBy} order={order} onSort={handleSort} />
              <SortableHeader label="Address" field="address" sortBy={sortBy} order={order} onSort={handleSort} />
              <SortableHeader label="Role" field="role" sortBy={sortBy} order={order} onSort={handleSort} />
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading…</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{u.email}</td>
                  <td className="px-4 py-2.5 text-gray-600 max-w-xs truncate">{u.address}</td>
                  <td className="px-4 py-2.5">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{u.rating ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StoresTable() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/stores', { params: { search, sortBy, order } });
      setStores(data);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, order]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 300);
    return () => clearTimeout(t);
  }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  return (
    <div>
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or address"
          className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm w-72 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <SortableHeader label="Name" field="name" sortBy={sortBy} order={order} onSort={handleSort} />
              <SortableHeader label="Email" field="email" sortBy={sortBy} order={order} onSort={handleSort} />
              <SortableHeader label="Address" field="address" sortBy={sortBy} order={order} onSort={handleSort} />
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Owner</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading…</td>
              </tr>
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No stores found.</td>
              </tr>
            ) : (
              stores.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{s.email}</td>
                  <td className="px-4 py-2.5 text-gray-600 max-w-xs truncate">{s.address}</td>
                  <td className="px-4 py-2.5 text-gray-600">{s.ownerName}</td>
                  <td className="px-4 py-2.5 text-gray-600">{s.rating}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    ADMIN: 'bg-purple-100 text-purple-700',
    NORMAL_USER: 'bg-blue-100 text-blue-700',
    STORE_OWNER: 'bg-emerald-100 text-emerald-700',
  };
  const labels = { ADMIN: 'Admin', NORMAL_USER: 'Normal User', STORE_OWNER: 'Store Owner' };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[role]}`}>{labels[role]}</span>;
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-20">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'NORMAL_USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/admin/users', form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Add User" onClose={onClose}>
      {error && <div className="mb-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Name (20–60 chars)" name="name" value={form.name} onChange={handleChange} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <Field label="Address (max 400 chars)" name="address" value={form.address} onChange={handleChange} textarea />
        <Field
          label="Password (8-16 chars, 1 uppercase, 1 special)"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none"
          >
            <option value="NORMAL_USER">Normal User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-md"
        >
          {loading ? 'Creating…' : 'Create User'}
        </button>
      </form>
    </ModalShell>
  );
}

function AddStoreModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    storeName: '',
    storeEmail: '',
    storeAddress: '',
    ownerName: '',
    ownerEmail: '',
    ownerAddress: '',
    ownerPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/admin/stores', form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Add Store" onClose={onClose}>
      {error && <div className="mb-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase pt-1">Store Details</p>
        <Field label="Store Name" name="storeName" value={form.storeName} onChange={handleChange} />
        <Field label="Store Email" name="storeEmail" type="email" value={form.storeEmail} onChange={handleChange} />
        <Field label="Store Address (max 400 chars)" name="storeAddress" value={form.storeAddress} onChange={handleChange} textarea />

        <p className="text-xs font-semibold text-gray-500 uppercase pt-3">Store Owner Account</p>
        <Field label="Owner Name (20–60 chars)" name="ownerName" value={form.ownerName} onChange={handleChange} />
        <Field label="Owner Email" name="ownerEmail" type="email" value={form.ownerEmail} onChange={handleChange} />
        <Field label="Owner Address" name="ownerAddress" value={form.ownerAddress} onChange={handleChange} textarea />
        <Field
          label="Owner Password (8-16 chars, 1 uppercase, 1 special)"
          name="ownerPassword"
          type="password"
          value={form.ownerPassword}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-md"
        >
          {loading ? 'Creating…' : 'Create Store'}
        </button>
      </form>
    </ModalShell>
  );
}

function Field({ label, name, value, onChange, type = 'text', textarea = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={2}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      )}
    </div>
  );
}
