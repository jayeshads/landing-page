import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  MoreVertical,
  Sparkles,
  Play,
  Pause,
  Eye,
  Edit,
  TrendingUp,
  Copy,
  Trash2,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';

export const Campaigns: React.FC = () => {
  const [tab, setTab] = useState<'all' | 'active' | 'in_review' | 'draft' | 'paused'>('all');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, [tab]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const query = tab !== 'all' ? `?status=${tab}` : '';
      const data: any = await apiRequest(`/campaigns${query}`);
      setCampaigns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updated: any = await apiRequest(`/campaigns/${id}/toggle`, { method: 'PATCH' });
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Campaigns</h1>
          <p className="text-sm text-slate-400">Manage, edit, and track performance of your Meta campaigns</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6 overflow-x-auto">
        {[
          { id: 'all', label: 'All Campaigns' },
          { id: 'active', label: 'Active' },
          { id: 'in_review', label: 'In Review' },
          { id: 'draft', label: 'Drafts' },
          { id: 'paused', label: 'Paused' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              tab === t.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      {loading ? (
        <div className="flex justify-center py-12 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-4 rounded-2xl bg-[#12121A] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{camp.name}</h3>
                    {camp.has_recommendation && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                        <Sparkles className="w-3 h-3 text-amber-400" /> AI Rec
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Status: <span className="capitalize text-slate-200">{camp.status.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4 text-center border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Spend</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(camp.metrics_cache?.spend || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Leads</p>
                  <p className="text-sm font-bold text-white">{formatNumber(camp.metrics_cache?.leads || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">CPL</p>
                  <p className="text-sm font-bold text-white">{camp.metrics_cache?.cpl > 0 ? formatCurrency(camp.metrics_cache.cpl) : '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">CPC</p>
                  <p className="text-sm font-bold text-white">{camp.metrics_cache?.cpc > 0 ? formatCurrency(camp.metrics_cache.cpc) : '-'}</p>
                </div>
              </div>

              {/* Toggle & Action */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={camp.status === 'active'}
                    onChange={() => handleToggleStatus(camp.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>

                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
