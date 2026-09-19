import React, { useRef, useState } from "react";
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
  Pencil,
  Plus,
  RefreshCw,
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
  onClick?: () => void;
};

const ToolButton = ({ children, icon, primary, compact, testId, onClick }: ToolButtonProps) => (
  <Button
    className={`toolbar-button ${primary ? "primary" : ""} ${compact ? "compact" : ""}`}
    variant={primary ? "default" : "outline"}
    data-testid={testId}
    onClick={onClick}
  >
    {icon}
    {children}
  </Button>
);

export const FilterBar = () => {
  return (
    <section className="controls-panel" data-testid="campaign-controls">
      <div className="quick-filter-row">
        <button className="filter-chip active" data-testid="filter-chip-all-ads">
          <span className="folder-icon" />
          All ads
        </button>
        <button className="filter-chip" data-testid="filter-chip-had-delivery">
          Had delivery
        </button>
        <button className="filter-chip" data-testid="filter-chip-actions">
          Actions
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
          placeholder="Describe what you're looking for"
          aria-label="Describe what you're looking for"
        />
      </div>
    </section>
  );
};

type CampaignTabsProps = {
  selectedCount: number;
  dateLabel: string;
  dateValue: string;
  onDateChange: (value: string) => void;
  rowCount: number;
};

export const CampaignTabs = ({ selectedCount, dateLabel, dateValue, onDateChange, rowCount }: CampaignTabsProps) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const selectedLabel = selectedCount === 1 ? "1 selected" : `${selectedCount} selected`;
  const levelLabel = `${selectedCount || 1} Campaign`;
  const tabs = [
    { key: "campaigns", label: "Campaigns", active: true, icon: Tag },
    { key: "adsets", label: `Ad sets for ${levelLabel}`, icon: Grid3X3 },
    { key: "ads", label: `Ads for ${levelLabel}`, icon: Grid3X3 },
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
              {tab.active && selectedCount > 0 && <span className="selected-count">{selectedLabel}<span className="selected-close">×</span></span>}
            </button>
          );
        })}
      </div>
      <div className="date-picker-wrap">
        <Button className="date-range" variant="outline" data-testid="date-range-trigger" onClick={() => (dateInputRef.current as any)?.showPicker?.()}>
          <CalendarDays size={16} />
          {dateLabel}
          <ChevronDown size={14} />
        </Button>
        <input
          ref={dateInputRef}
          className="date-hidden-input"
          type="date"
          value={dateValue}
          onChange={(event) => onDateChange(event.target.value)}
          data-testid="editable-date-input"
          aria-label="Edit date"
        />
      </div>
    </div>
  );
};

type ActionToolbarProps = {
  onCreate: () => void;
  onEditSelected: () => void;
};

export const ActionToolbar = ({ onCreate, onEditSelected }: ActionToolbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="action-toolbar" data-testid="campaigns-action-toolbar">
      <div className="action-left">
        <ToolButton primary icon={<Plus size={16} />} testId="campaigns-create-button" onClick={onCreate}>Create</ToolButton>
        <ToolButton icon={<Copy size={15} />} testId="campaigns-duplicate-button">Duplicate <ChevronDown size={13} /></ToolButton>
        <ToolButton icon={<Pencil size={15} />} testId="campaigns-edit-button" onClick={onEditSelected}>Edit <ChevronDown size={13} /></ToolButton>
        <ToolButton compact icon={<Trash2 size={16} />} testId="campaigns-delete-button" />
        <ToolButton icon={<FlaskConical size={15} />} testId="campaigns-ab-test-button">A/B test</ToolButton>
        <ToolButton compact icon={<Tag size={15} />} testId="campaigns-tag-button" />
        <ToolButton testId="campaigns-more-button" onClick={() => setMenuOpen(!menuOpen)}>More <ChevronDown size={13} /></ToolButton>
        {menuOpen && <div className="mini-menu" data-testid="toolbar-more-menu">Rules<br />Export selected<br />Compare campaigns</div>}
      </div>
      <div className="action-right">
        <ToolButton icon={<Columns3 size={16} />} testId="campaigns-columns-button">Columns: Performance <ChevronDown size={13} /></ToolButton>
        <ToolButton icon={<ListFilter size={16} />} testId="campaigns-breakdown-button">Breakdown <ChevronDown size={13} /></ToolButton>
        <ToolButton icon={<BarChart3 size={16} />} testId="campaigns-reports-button"><ChevronDown size={13} /></ToolButton>
        <ToolButton compact icon={<Download size={16} />} testId="campaigns-export-button" />
        <ToolButton compact testId="campaigns-export-menu-button"><ChevronDown size={13} /></ToolButton>
        <ToolButton compact icon={<BarChart3 size={16} />} testId="campaigns-charts-button" />
      </div>
    </div>
  );
};
