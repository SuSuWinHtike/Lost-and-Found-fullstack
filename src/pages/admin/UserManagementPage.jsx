import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Badge from '../../components/common/Badge';
import {
  Users,
  Search,
  UserX,
  UserCheck,
  Edit,
  Eye,
  X,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ShieldAlert
} from 'lucide-react';

const UserManagementPage = () => {
  const { users, toggleUserStatus, updateUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const openEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditLocation(user.location || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser.id, {
      name: editName,
      phone: editPhone,
      location: editLocation
    });
    setEditingUser(null);
  };

  const filteredUsers = users.filter(u => {
    if (statusFilter !== 'all' && u.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
          Administration
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
          User Management ({users.length})
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Review registered accounts, update profiles, or suspend non-compliant users.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">All User Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">User Profile</th>
                <th className="py-3.5 px-6">Contact Phone</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-amber-50/30 transition">
                  {/* Profile */}
                  <td className="py-4 px-6 flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-amber-200"
                    />
                    <div>
                      <div className="font-bold text-stone-900">{user.name}</div>
                      <div className="text-[11px] text-stone-400">{user.email}</div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-6 text-stone-600">{user.phone}</td>

                  {/* Location */}
                  <td className="py-4 px-6 text-stone-600">{user.location}</td>

                  {/* Role */}
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-900' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <Badge type={user.status} text={user.status} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => setViewingUser(user)}
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEdit(user)}
                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-amber-50 text-amber-700"
                      title="Edit User"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          user.status === 'Active'
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={user.status === 'Active' ? 'Suspend User' : 'Reactivate User'}
                      >
                        {user.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-base text-stone-900">User Profile Details</h3>
              <button onClick={() => setViewingUser(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 py-2">
              <img src={viewingUser.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-amber-300" />
              <div>
                <h4 className="font-extrabold text-sm text-stone-900">{viewingUser.name}</h4>
                <p className="text-stone-500">{viewingUser.email}</p>
                <div className="mt-1"><Badge type={viewingUser.status} text={viewingUser.status} size="sm" /></div>
              </div>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Phone:</span>
                <span className="font-bold text-stone-800">{viewingUser.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Location:</span>
                <span className="font-bold text-stone-800">{viewingUser.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Member Since:</span>
                <span className="font-bold text-stone-800">{viewingUser.joinedDate}</span>
              </div>
              <div className="pt-2 border-t border-stone-200">
                <span className="text-stone-500 block mb-1">User Bio:</span>
                <p className="text-stone-700 italic">"{viewingUser.bio}"</p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setViewingUser(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-base text-stone-900">Edit User Information</h3>
              <button onClick={() => setEditingUser(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Township / City</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagementPage;
