import React from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Columns3,
  Copy,
  Download,
  FlaskConical,
  Grid3X3,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Tag,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ToolButtonProps = {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  primary?: boolean;
  compact?: boolean;
  testId: string;
};

const ToolButton = ({ children, icon, primary, compact, testId }: ToolButtonProps) => (
  <Button
    className={`toolbar-button ${primary ? "primary" : ""} ${compact ? "compact" : ""}`}
    variant={primary ? "default" : "outline"}
    data-testid={testId}
  >
    {icon}
    {children}
  </Button>
);

export const FilterBar = () => {
  return (
    <section className="controls-panel" data-testid="campaign-controls">
      <div className="quick-filter-row">
        <Button className="search-square" variant="outline" size="icon" data-testid="quick-search-button" aria-label="Search filters">
          <Search size={18} />
        </Button>
        <button className="filter-chip active" data-testid="filter-chip-all-ads">
          <span className="chip-left-line" />
          All ads
        </button>
        <button className="filter-chip" data-testid="filter-chip-had-delivery">
          Had delivery
        </button>
        <button className="filter-chip" data-testid="filter-chip-active-ads">
          Active ads
        </button>
        <button className="see-more" data-testid="filter-see-more">
          <Plus size={16} /> See more
        </button>
        <Button className="create-view" variant="outline" data-testid="create-view-button">
          Create a view
        </Button>
        <Button className="icon-action" variant="outline" size="icon" data-testid="view-settings-button" aria-label="View settings">
          <Settings2 size={16} />
        </Button>
      </div>
      <div className="search-row">
        <input
          data-testid="campaigns-search-input"
          className="large-search"
          placeholder="Search to filter by name, ID or metrics"
          aria-label="Search to filter by name, ID or metrics"
        />
      </div>
    </section>
  );
};

export const CampaignTabs = () => {
  const tabs = [
    { key: "campaigns", label: "Campaigns", active: true, icon: Tag },
    { key: "adsets", label: "Ad Sets for 11 Campaigns", icon: Grid3X3 },
    { key: "ads", label: "Ads for 11 Campaigns", icon: Grid3X3 },
  ];

  return (
    <div className="tabs-row" data-testid="campaigns-level-tabs">
      <div className="tab-list">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`level-tab ${tab.active ? "active" : ""}`}
              data-testid={`campaigns-tab-${tab.key}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.active && <span className="selected-count">11 selected</span>}
            </button>
          );
        })}
      </div>
      <Button className="date-range" variant="outline" data-testid="date-range-trigger">
        <CalendarDays size={16} />
        Last 30 days: 29 Nov 2025 - 28 Dec 2025
        <ChevronDown size={14} />
      </Button>
    </div>
  );
};

export const ActionToolbar = () => {
  return (
    <div className="action-toolbar" data-testid="campaigns-action-toolbar">
      <div className="action-left">
        <ToolButton primary icon={<Plus size={16} />} testId="campaigns-create-button">Create</ToolButton>
        <ToolButton icon={<Copy size={15} />} testId="campaigns-duplicate-button">Duplicate <ChevronDown size={13} /></ToolButton>
        <ToolButton icon={<Pencil size={15} />} testId="campaigns-edit-button">Edit <ChevronDown size={13} /></ToolButton>
        <ToolButton compact icon={<Trash2 size={16} />} testId="campaigns-delete-button" />
        <ToolButton compact icon={<RotateCcw size={16} />} testId="campaigns-undo-button" />
        <ToolButton icon={<FlaskConical size={15} />} testId="campaigns-ab-test-button">A/B test</ToolButton>
        <ToolButton compact icon={<Tag size={15} />} testId="campaigns-tag-button" />
        <ToolButton testId="campaigns-more-button">More <ChevronDown size={13} /></ToolButton>
      </div>
      <div className="action-right">
        <ToolButton icon={<Columns3 size={16} />} testId="campaigns-columns-button">Columns: Performance <ChevronDown size={13} /></ToolButton>
        <ToolButton icon={<ListFilter size={16} />} testId="campaigns-breakdown-button">Breakdown <ChevronDown size={13} /></ToolButton>
        <ToolButton icon={<BarChart3 size={16} />} testId="campaigns-reports-button">Reports <ChevronDown size={13} /></ToolButton>
        <ToolButton icon={<Download size={16} />} testId="campaigns-export-button">Export <ChevronDown size={13} /></ToolButton>
        <ToolButton icon={<BarChart3 size={16} />} testId="campaigns-charts-button">Charts</ToolButton>
      </div>
    </div>
  );
};
