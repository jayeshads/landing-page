import React, { useMemo } from "react";
import { ChevronDown, FileBarChart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { campaignColumns } from "@/data/campaignsData";
import { CampaignColumn, CampaignRow } from "@/types/campaign";

type CampaignsTableProps = {
  rows: CampaignRow[];
  onRowsChange: (rows: CampaignRow[]) => void;
  onRowChange: (id: string, patch: Partial<CampaignRow>) => void;
  onEditRow: (row: CampaignRow) => void;
};

const leftOffsets: Record<string, number> = {
  select: 0,
  toggle: 54,
  campaign: 162,
};

const subFieldMap: Partial<Record<keyof CampaignRow, keyof CampaignRow>> = {
  budget: "budgetSub",
  attribution: "attributionSub",
  results: "resultsSub",
  costPerResult: "costPerResultSub",
};

const statusClass = (tone: CampaignRow["deliveryTone"]) => {
  if (tone === "draft") return "draft";
  if (tone === "active") return "active";
  if (tone === "off") return "off";
  return "error";
};

const EditableInput = ({
  value,
  onChange,
  className,
  testId,
  align,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  testId: string;
  align?: "left" | "right" | "center";
}) => (
  <input
    className={`inline-cell-input ${className || ""} ${align === "right" ? "right" : ""}`}
    value={value || ""}
    onChange={(event) => onChange(event.target.value)}
    data-testid={testId}
    aria-label={testId}
  />
);

const CellContent = ({
  row,
  column,
  onRowChange,
  onEditRow,
}: {
  row: CampaignRow;
  column: CampaignColumn;
  onRowChange: (id: string, patch: Partial<CampaignRow>) => void;
  onEditRow: (row: CampaignRow) => void;
}) => {
  if (column.key === "select" || column.key === "toggle") return null;

  if (column.key === "campaign") {
    return (
      <div className="campaign-name-cell">
        <EditableInput
          value={row.campaign}
          onChange={(value) => onRowChange(row.id, { campaign: value })}
          className="campaign-link-input"
          testId={`inline-edit-${row.id}-campaign`}
        />
        <button className="campaign-inline-actions" onClick={() => onEditRow(row)} data-testid={`open-row-editor-${row.id}`}>
          <FileBarChart size={12} /> Edit / Duplicate
        </button>
      </div>
    );
  }

  if (column.key === "delivery") {
    return (
      <button className="delivery-cell editable-delivery" onClick={() => onEditRow(row)} data-testid={`delivery-editor-${row.id}`}>
        <span className={`delivery-dot ${statusClass(row.deliveryTone)}`} />
        <span>{row.delivery}</span>
      </button>
    );
  }

  if (column.key === "actions" && row.actions) {
    return (
      <button className="recommendation-pill" onClick={() => onEditRow(row)} data-testid={`recommendation-${row.id}`}>
        ⓘ {row.actions}
      </button>
    );
  }

  const value = String(row[column.key as keyof CampaignRow] ?? "");
  const subField = subFieldMap[column.key as keyof CampaignRow];
  const subValue = subField ? String(row[subField] ?? "") : "";

  return (
    <div className={`cell-stack ${column.align === "right" ? "right" : ""}`}>
      <EditableInput
        value={value}
        onChange={(next) => onRowChange(row.id, { [column.key]: next } as Partial<CampaignRow>)}
        className="primary-cell-text"
        testId={`inline-edit-${row.id}-${String(column.key)}`}
        align={column.align}
      />
      {subField && (
        <EditableInput
          value={subValue}
          onChange={(next) => onRowChange(row.id, { [subField]: next } as Partial<CampaignRow>)}
          className="secondary-cell-text"
          testId={`inline-edit-${row.id}-${String(subField)}`}
          align={column.align}
        />
      )}
    </div>
  );
};

export const CampaignsTable = ({ rows, onRowsChange, onRowChange, onEditRow }: CampaignsTableProps) => {
  const tableWidth = useMemo(() => campaignColumns.reduce((sum, col) => sum + col.width, 0), []);
  const allSelected = rows.length > 0 && rows.every((row) => row.selected);

  const toggleAll = (checked: boolean) => {
    onRowsChange(rows.map((row) => ({ ...row, selected: checked })));
  };

  const toggleRow = (row: CampaignRow, checked: boolean) => {
    onRowChange(row.id, {
      enabled: checked,
      delivery: checked ? "Active" : "Off",
      deliveryTone: checked ? "active" : "off",
    });
  };

  return (
    <div className="table-shell" data-testid="campaigns-table-shell">
      <div className="table-scroll" data-testid="campaigns-table-scroll">
        <table className="campaigns-table" data-testid="campaigns-table" style={{ width: tableWidth }}>
          <thead data-testid="campaigns-table-header">
            <tr>
              {campaignColumns.map((column) => {
                const stickyStyle = column.sticky ? { left: leftOffsets[column.key as string] ?? 0 } : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={`${column.sticky ? "sticky-col" : ""} ${column.align === "right" ? "align-right" : ""}`}
                    style={{ width: column.width, minWidth: column.width, ...stickyStyle }}
                    data-testid={`campaigns-table-header-${String(column.key)}`}
                  >
                    {column.key === "select" ? (
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                        className="meta-checkbox"
                        data-testid="table-select-all-checkbox"
                        aria-label="Select all campaigns"
                      />
                    ) : (
                      <div className="header-label">
                        <span>{column.label}</span>
                        {column.sortable && <ChevronDown size={12} />}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={row.selected ? "selected-row" : ""}
                data-testid={`campaigns-table-row-${row.id}`}
              >
                {campaignColumns.map((column) => {
                  const stickyStyle = column.sticky ? { left: leftOffsets[column.key as string] ?? 0 } : undefined;
                  return (
                    <td
                      key={`${row.id}-${column.key}`}
                      className={`${column.sticky ? "sticky-col" : ""} ${column.align === "right" ? "align-right" : ""}`}
                      style={{ width: column.width, minWidth: column.width, ...stickyStyle }}
                      data-testid={`campaigns-table-cell-${row.id}-${String(column.key)}`}
                      onDoubleClick={() => onEditRow(row)}
                    >
                      {column.key === "select" ? (
                        <Checkbox
                          checked={row.selected}
                          onCheckedChange={(checked) => onRowChange(row.id, { selected: Boolean(checked) })}
                          className="meta-checkbox"
                          data-testid={`table-row-checkbox-${row.id}`}
                          aria-label={`Select ${row.campaign}`}
                        />
                      ) : column.key === "toggle" ? (
                        <Switch
                          checked={row.enabled}
                          onCheckedChange={(checked) => toggleRow(row, checked)}
                          className="meta-switch"
                          data-testid={`table-row-toggle-${row.id}`}
                          aria-label={`Toggle ${row.campaign}`}
                        />
                      ) : (
                        <CellContent row={row} column={column} onRowChange={onRowChange} onEditRow={onEditRow} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-summary" data-testid="campaigns-table-summary">
        <span>Results from {rows.length} campaigns</span>
        <span className="info-dot">i</span>
      </div>
    </div>
  );
};
