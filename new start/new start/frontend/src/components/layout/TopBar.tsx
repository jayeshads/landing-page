import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Search, Bell, Sun, Moon, LogOut, User, Sparkles } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();

  return (
    <header className="h-16 border-b border-white/10 bg-[#0E0E14]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search / Command palette trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-400 hover:text-slate-200 transition-colors w-64"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span>Search or command...</span>
          <kbd className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Meta connection badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Meta Ads Connected</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        {/* Profile / Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-white truncate max-w-[120px]">
              {user?.full_name || 'User'}
            </span>
            <span className="text-[10px] text-slate-400 capitalize">{user?.role || 'Client'}</span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
