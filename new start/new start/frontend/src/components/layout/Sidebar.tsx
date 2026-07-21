import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bot,
  Megaphone,
  Image,
  Globe,
  Share2,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Chat', path: '/dashboard/chat', icon: Bot, badge: 'AI' },
    { label: 'Campaigns', path: '/dashboard/campaigns', icon: Megaphone },
    { label: 'Creative Library', path: '/dashboard/creatives', icon: Image },
    { label: 'Landing Pages', path: '/dashboard/landing-pages', icon: Globe },
    { label: 'Meta Connection', path: '/dashboard/meta', icon: Share2 },
    { label: 'Billing & Plans', path: '/dashboard/billing', icon: CreditCard },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const adminItems = user?.role === 'admin' || user?.role === 'super_admin' ? [
    { label: 'Admin Panel', path: '/admin', icon: ShieldCheck, badge: 'ADMIN' },
  ] : [];

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 76 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen bg-[#0E0E14] border-r border-white/10 z-30 select-none shrink-0"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 text-white font-bold text-lg shadow-lg shadow-blue-500/20 shrink-0">
            LP
          </div>
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
                  LeadPilot <span className="text-blue-500 text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">AI</span>
                </span>
                <span className="text-[11px] text-slate-400 truncate whitespace-nowrap">
                  {user?.workspace?.name || 'Workspace'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                )
              }
            >
              <Icon className={cn('w-5 h-5 shrink-0 transition-colors', isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200')} />
              {sidebarOpen && (
                <span className="truncate whitespace-nowrap flex-1">{item.label}</span>
              )}
              {item.badge && sidebarOpen && (
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {adminItems.length > 0 && (
          <div className="pt-4 mt-4 border-t border-white/10">
            {sidebarOpen && (
              <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Administration
              </p>
            )}
            {adminItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                      isActive
                        ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30'
                        : 'text-slate-400 hover:text-purple-300 hover:bg-purple-500/10'
                    )
                  }
                >
                  <Icon className="w-5 h-5 text-purple-400 shrink-0" />
                  {sidebarOpen && <span className="truncate flex-1">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer / Credits Box */}
      <div className="p-3 border-t border-white/10">
        {sidebarOpen ? (
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
                <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                AI Credits
              </div>
              <span className="text-xs font-bold text-white">{user?.credits_remaining ?? 100}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                style={{ width: `${Math.min(100, ((user?.credits_remaining ?? 100) / 100) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400">Free Trial Active</span>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="AI Credits">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
        )}
      </div>
    </motion.aside>
  );
};
