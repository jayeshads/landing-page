import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, Eye, ShieldAlert, CheckCircle, XCircle, RefreshCw, X, FileText, Share2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deepProfile, setDeepProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const data: any = await apiRequest(`/admin/users${query}`);
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeepProfile = async (id: string) => {
    setSelectedUserId(id);
    setProfileLoading(true);
    try {
      const data: any = await apiRequest(`/admin/users/${id}/full-profile`);
      setDeepProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleToggleStatus = async (userObj: any) => {
    const nextStatus = userObj.status === 'active' ? 'blocked' : 'active';
    try {
      await apiRequest(`/admin/users/${userObj.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userObj.id ? { ...u, status: nextStatus } : u))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">User Management & Deep Inspection</h1>
            <p className="text-sm text-slate-400">Inspect full user profiles, ad accounts, campaigns, and access status</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name..."
            className="pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl bg-[#12121A] border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-white/10 uppercase font-semibold text-[10px] text-slate-400">
              <tr>
                <th className="p-4">User / Email</th>
                <th className="p-4">Workspace</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">AI Credits</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white text-sm">{u.full_name}</p>
                    <p className="text-slate-400 text-[11px]">{u.email}</p>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{u.workspace?.name || 'Default'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-semibold capitalize ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-semibold capitalize ${
                      u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">{u.credits_remaining}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenDeepProfile(u.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-1" />
                      Deep Inspection
                    </button>

                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold border ${
                        u.status === 'active'
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {u.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deep Profile Drawer Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-[#12121A] border-l border-white/10 h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" /> Deep Profile Inspection
              </h2>
              <button onClick={() => setSelectedUserId(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileLoading ? (
              <div className="flex justify-center py-12 text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : deepProfile ? (
              <div className="space-y-6 text-xs text-slate-300">
                {/* Profile Overview */}
                <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                  <h3 className="font-bold text-white text-sm">Account & Auth Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p>• Email: <span className="text-white font-semibold">{deepProfile.user_info?.email}</span></p>
                    <p>• Full Name: <span className="text-white font-semibold">{deepProfile.user_info?.full_name}</span></p>
                    <p>• Phone: <span className="text-white font-semibold">{deepProfile.user_info?.phone || 'N/A'}</span></p>
                    <p>• Password: <span className="text-amber-400 font-mono">{deepProfile.user_info?.password_view}</span></p>
                  </div>
                </div>

                {/* Meta Ad Account Details */}
                <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-blue-400" /> Meta Connection & Ad Account
                  </h3>
                  <div className="space-y-1">
                    <p>• Connection Status: <span className="text-emerald-400 font-bold uppercase">{deepProfile.meta_account_details?.status}</span></p>
                    <p>• Ad Account ID: <span className="text-white font-mono">{deepProfile.meta_account_details?.ad_account_id || 'act_40912401'}</span></p>
                    <p>• Business Manager ID: <span className="text-white font-mono">{deepProfile.meta_account_details?.bm_id || 'bm_981247129'}</span></p>
                    <p>• Facebook Page ID: <span className="text-white font-mono">{deepProfile.meta_account_details?.page_id || 'page_88124019'}</span></p>
                    <p>• Meta Monthly Spend Limit: <span className="text-blue-400 font-semibold">{deepProfile.meta_account_details?.funds_requested_from_meta}</span></p>
                  </div>
                </div>

                {/* Activity & Campaign Stats */}
                <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                  <h3 className="font-bold text-white text-sm">Platform Usage & Generated Assets</h3>
                  <div className="grid grid-cols-2 gap-3 text-center pt-1">
                    <div className="p-3 rounded-lg bg-slate-950 border border-white/5">
                      <p className="text-[10px] text-slate-400 uppercase">Total Campaigns</p>
                      <p className="text-lg font-bold text-white">{deepProfile.statistics?.total_campaigns}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-white/5">
                      <p className="text-[10px] text-slate-400 uppercase">Active Campaigns</p>
                      <p className="text-lg font-bold text-emerald-400">{deepProfile.statistics?.active_campaigns}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-white/5">
                      <p className="text-[10px] text-slate-400 uppercase">AI Images Generated</p>
                      <p className="text-lg font-bold text-purple-400">{deepProfile.statistics?.ai_images_generated}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-white/5">
                      <p className="text-[10px] text-slate-400 uppercase">Landing Pages Used</p>
                      <p className="text-lg font-bold text-blue-400">{deepProfile.statistics?.landing_pages_used}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
