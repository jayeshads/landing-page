import React from 'react';
import { ShieldCheck, Users, Megaphone, Image, FileText, LifeBuoy, Plus } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export const AdminOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Portal</h1>
            <p className="text-sm text-slate-400">Platform-wide analytics, user control, AI knowledge, and subscriptions</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Registered Users', value: formatNumber(142), icon: Users, color: 'text-blue-400' },
          { title: 'Active Campaigns', value: formatNumber(89), icon: Megaphone, color: 'text-emerald-400' },
          { title: 'AI Images Generated', value: formatNumber(1240), icon: Image, color: 'text-purple-400' },
          { title: 'Support Tickets', value: '3 Pending', icon: LifeBuoy, color: 'text-amber-400' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="p-5 rounded-2xl bg-[#12121A] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold">{s.title}</span>
                <p className="text-2xl font-extrabold text-white mt-1">{s.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management Snapshot */}
        <div className="p-6 rounded-2xl bg-[#12121A] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Users</h2>
            <span className="text-xs text-blue-400 hover:underline cursor-pointer">View All Users</span>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Aarav Sharma', email: 'aarav@candlecraft.in', plan: 'Free Trial', status: 'Active' },
              { name: 'Priya Singh', email: 'priya@d2cbrand.com', plan: 'Starter Pro', status: 'Active' },
            ].map((u, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">{u.name}</p>
                  <p className="text-slate-400">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold">{u.plan}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Skill Manager (.md files) */}
        <div className="p-6 rounded-2xl bg-[#12121A] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">AI Knowledge Manager (.md skills)</h2>
            <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold">
              <Plus className="w-3.5 h-3.5" /> Upload .md Skill
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { file: 'meta_campaign_best_practices.md', agent: 'Campaign Creator', active: true },
              { file: 'copywriting_frameworks_in.md', agent: 'Creative Copywriter', active: true },
            ].map((sk, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="font-semibold text-white">{sk.file}</p>
                    <p className="text-[10px] text-slate-400">Assigned to: {sk.agent}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Used by AI ✅
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
