import React from "react";
import {
  Bell,
  BookOpen,
  CircleHelp,
  CreditCard,
  Gauge,
  Home,
  Menu,
  Search,
  Settings,
  Table2,
  Users,
  Activity,
} from "lucide-react";

const navGroups = [
  [
    { key: "home", icon: Home, label: "Home" },
    { key: "alerts", icon: Bell, label: "Notifications", badge: "9" },
    { key: "gauge", icon: Gauge, label: "Overview" },
    { key: "campaigns", icon: Table2, label: "Campaigns", active: true },
    { key: "docs", icon: BookOpen, label: "Docs" },
    { key: "audiences", icon: Users, label: "Audiences" },
    { key: "megaphone", icon: Activity, label: "Ads" },
    { key: "billing", icon: CreditCard, label: "Billing" },
    { key: "more", icon: Menu, label: "More" },
  ],
  [
    { key: "help", icon: CircleHelp, label: "Help" },
    { key: "settings", icon: Settings, label: "Settings" },
    { key: "search", icon: Search, label: "Search" },
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
              <Icon size={20} strokeWidth={1.9} />
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
              className="sidebar-item"
              title={item.label}
              data-testid={`sidebar-nav-item-${item.key}`}
              aria-label={item.label}
            >
              <Icon size={20} strokeWidth={1.9} />
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
