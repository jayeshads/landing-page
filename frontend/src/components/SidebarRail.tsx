import React from "react";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  CircleHelp,
  CreditCard,
  Database,
  FileText,
  Gauge,
  Grid3X3,
  Home,
  Menu,
  MessageCircle,
  Search,
  Settings,
  Table2,
  Users,
} from "lucide-react";

const navGroups = [
  [
    { key: "home", icon: Home, label: "Home" },
    { key: "alerts", icon: Bell, label: "Notifications", badge: "11" },
    { key: "gauge", icon: Gauge, label: "Overview" },
    { key: "campaigns", icon: Table2, label: "Campaigns", active: true },
    { key: "docs", icon: FileText, label: "Docs" },
    { key: "audiences", icon: Users, label: "Audiences" },
    { key: "billing", icon: CreditCard, label: "Billing" },
    { key: "automation", icon: Activity, label: "Automations" },
    { key: "more", icon: Menu, label: "More" },
  ],
  [
    { key: "help", icon: CircleHelp, label: "Help", soft: true },
    { key: "resources", icon: BookOpen, label: "Resources" },
    { key: "settings", icon: Settings, label: "Settings" },
    { key: "search", icon: Search, label: "Search" },
    { key: "report", icon: BarChart3, label: "Reports" },
  ],
];

export const SidebarRail = () => {
  return (
    <aside className="meta-sidebar" data-testid="sidebar-rail" aria-label="Meta navigation rail">
      <div className="meta-logo" data-testid="meta-logo" aria-label="Meta logo">
        <span className="meta-loop">∞</span>
      </div>
      <nav className="sidebar-nav">
        {navGroups[0].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={`sidebar-item ${item.active ? "active" : ""}`}
              title={item.label}
              data-testid={`sidebar-nav-item-${item.key}`}
              aria-label={item.label}
            >
              <Icon size={18} strokeWidth={1.7} />
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-spacer" />
      <nav className="sidebar-nav sidebar-bottom">
        {navGroups[1].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={`sidebar-item ${item.soft ? "soft" : ""}`}
              title={item.label}
              data-testid={`sidebar-nav-item-${item.key}`}
              aria-label={item.label}
            >
              <Icon size={18} strokeWidth={1.7} />
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
