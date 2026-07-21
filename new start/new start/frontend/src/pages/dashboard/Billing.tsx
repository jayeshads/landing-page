import React, { useState } from 'react';
import { CreditCard, Check, Sparkles, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const Billing: React.FC = () => {
  const [promo, setPromo] = useState('');
  const [discountMsg, setDiscountMsg] = useState('');

  const plans = [
    { name: 'Free Trial', price: 0, credits: '100 AI Credits', features: ['1 Meta Connection', 'Basic AI Campaign Builder', 'Standard Support'], current: true },
    { name: 'Starter Pro', price: 2999, credits: '1,000 AI Credits / mo', features: ['All Free Features', 'Multi-agent AI (Sonnet 4.5)', 'AI Image Generation', 'Landing Page Auto-fill', '1-Click Recommendations'], current: false },
    { name: 'Agency Scale', price: 7999, credits: '5,000 AI Credits / mo', features: ['Unlimited Meta Accounts', 'Multi-tenant Team Workspace', 'Priority Custom Domain', 'Dedicated Account Manager'], current: false },
  ];

  const handleApplyPromo = () => {
    if (promo.toUpperCase() === 'LAUNCH50') {
      setDiscountMsg('50% OFF Applied successfully!');
    } else {
      setDiscountMsg('Invalid promo code');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Billing & Subscriptions</h1>
        <p className="text-sm text-slate-400">Manage your subscription plan, AI credit balance, and payments via Razorpay</p>
      </div>

      {/* Promo Code Box */}
      <div className="p-4 rounded-2xl bg-[#12121A] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Have a promo code?</h3>
            <p className="text-xs text-slate-400">Apply code for discounts or bonus AI credits</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="e.g. LAUNCH50"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white uppercase"
          />
          <button
            onClick={handleApplyPromo}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Apply
          </button>
        </div>
      </div>
      {discountMsg && <p className="text-xs text-emerald-400 font-semibold">{discountMsg}</p>}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl bg-[#12121A] border flex flex-col justify-between space-y-6 relative overflow-hidden ${
              p.current ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-white/10'
            }`}
          >
            {p.current && (
              <span className="absolute top-3 right-3 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Current Plan
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <p className="text-xs text-blue-400 font-semibold mt-1">{p.credits}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{formatCurrency(p.price)}</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled={p.current}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                p.current
                  ? 'bg-slate-800 text-slate-500 cursor-default'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500'
              }`}
            >
              {p.current ? 'Active Plan' : 'Upgrade via Razorpay'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
