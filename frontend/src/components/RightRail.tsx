import React from "react";
import { BarChart3, Clock3, Pencil, SlidersHorizontal } from "lucide-react";

export const RightRail = () => {
  const items = [
    { key: "insights", icon: BarChart3, label: "Insights" },
    { key: "edit", icon: Pencil, label: "Creative tools" },
    { key: "history", icon: Clock3, label: "History" },
  ];

  return (
    <aside className="right-rail" data-testid="right-rail" aria-label="Meta right rail">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.key} className="right-rail-button" data-testid={`right-rail-${item.key}`} aria-label={item.label}>
            <Icon size={18} strokeWidth={2} />
          </button>
        );
      })}
      <div className="right-rail-spacer" />
      <button className="right-rail-button" data-testid="right-rail-settings" aria-label="Right rail settings">
        <SlidersHorizontal size={18} strokeWidth={2} />
      </button>
    </aside>
  );
};
