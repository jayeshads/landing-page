import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Users,
  MousePointer,
  Target,
  Bot,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30d');

  const kpis = [
    {
      title: 'Total Ad Spend',
      value: formatCurrency(24500),
      change: '+14.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    },
    {
      title: 'Leads Generated',
      value: formatNumber(142),
      change: '+22.5%',
      trend: 'up',
      icon: Users,
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Cost Per Lead (CPL)',
      value: formatCurrency(172.5),
      change: '-6.8%',
      trend: 'down',
      icon: Target,
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    },
    {
      title: 'Cost Per Click (CPC)',
      value: formatCurrency(14.2),
      change: '-3.1%',
      trend: 'down',
      icon: MousePointer,
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    },
    {
      title: 'ROAS',
      value: '3.4x',
      change: '+0.4x',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
    },
    {
      title: 'Active Campaigns',
      value: '4',
      change: '2 Pending Review',
      trend: 'neutral',
      icon: Bot,
      color: 'from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12121A] p-6 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Dashboard Overview
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              Live Meta Data
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your campaign metrics and AI-driven growth performance
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1 text-xs">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/dashboard/chat')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Campaign with AI</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-gradient-to-br ${kpi.color} bg-slate-900/60 border backdrop-blur-md flex flex-col justify-between transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{kpi.title}</span>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-white tracking-tight">{kpi.value}</span>
                <span
                  className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                    kpi.trend === 'up'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : kpi.trend === 'down'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : kpi.trend === 'down' ? (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  ) : null}
                  {kpi.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Recommendations Panel */}
      <div className="p-6 rounded-2xl bg-[#12121A] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Recommendations</h2>
              <p className="text-xs text-slate-400">Real-time suggestions to optimize CPL and increase conversion</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">Updated 5m ago</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Budget Shift</span>
              <h3 className="text-sm font-semibold text-white">Scale "Handmade Candles - Lookalike Audience"</h3>
              <p className="text-xs text-slate-400">
                This ad set has a CPL of ₹120 (30% lower than average). Increase daily budget from ₹500 to ₹800.
              </p>
            </div>
            <button className="self-start text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
              Apply Recommendation (1-Click)
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Ad Creative Refresh</span>
              <h3 className="text-sm font-semibold text-white">Fatigue detected on Creative #3</h3>
              <p className="text-xs text-slate-400">
                CTR dropped from 2.4% to 1.1% over 7 days. AI can generate 3 new image variations instantly.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/chat')}
              className="self-start text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
            >
              Generate New Creatives with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
