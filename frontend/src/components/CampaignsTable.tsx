import React, { useMemo, useState } from "react";
import { ChevronDown, FileBarChart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { campaignColumns, initialCampaignRows } from "@/data/campaignsData";
import { CampaignColumn, CampaignRow } from "@/types/campaign";

type CampaignsTableProps = {
  rows: CampaignRow[];
  onRowsChange: (rows: CampaignRow[]) => void;
};

const leftOffsets: Record<string, number> = {
  select: 0,
  toggle: 36,
  campaign: 104,
};

const statusClass = (tone: CampaignRow["deliveryTone"]) => {
  if (tone === "draft") return "draft";
  if (tone === "active") return "active";
  if (tone === "off") return "off";
  return "error";
};

const CellContent = ({ row, column }: { row: CampaignRow; column: CampaignColumn }) => {
  if (column.key === "select") return null;
  if (column.key === "toggle") return null;

  if (column.key === "campaign") {
    return (
      <div className="campaign-name-cell">
        <a className="campaign-link" href="#" onClick={(event) => event.preventDefault()}>
          {row.campaign}
        </a>
        {row.campaignMeta && (
          <span className="campaign-inline-actions">
            <FileBarChart size={12} /> Edit <span>/</span> Duplicate
          </span>
        )}
      </div>
    );
  }

  if (column.key === "delivery") {
    return (
      <div className="delivery-cell">
        <span className={`delivery-dot ${statusClass(row.deliveryTone)}`} />
        <span>{row.delivery}</span>
      </div>
    );
  }

  const value = row[column.key as keyof CampaignRow] as string;
  const subValue = column.key === "budget" ? row.budgetSub : column.key === "attribution" ? row.attributionSub : column.key === "results" ? row.resultsSub : undefined;

  return (
    <div className={`cell-stack ${column.align === "right" ? "right" : ""}`}>
      <span className="primary-cell-text">{value}</span>
      {subValue && <span className="secondary-cell-text">{subValue}</span>}
    </div>
  );
};

export const CampaignsTable = ({ rows, onRowsChange }: CampaignsTableProps) => {
  const [allSelected, setAllSelected] = useState(true);

  const tableWidth = useMemo(() => campaignColumns.reduce((sum, col) => sum + col.width, 0), []);

  const toggleAll = (checked: boolean) => {
    setAllSelected(checked);
    onRowsChange(rows.map((row) => ({ ...row, selected: checked })));
  };

  const updateRow = (id: string, patch: Partial<CampaignRow>) => {
    const updated = rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
    onRowsChange(updated);
    setAllSelected(updated.every((row) => row.selected));
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
                        {column.sortable && <ChevronDown size={11} />}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
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
                    >
                      {column.key === "select" ? (
                        <Checkbox
                          checked={row.selected}
                          onCheckedChange={(checked) => updateRow(row.id, { selected: Boolean(checked) })}
                          className="meta-checkbox"
                          data-testid={`table-row-checkbox-${row.id}`}
                          aria-label={`Select ${row.campaign}`}
                        />
                      ) : column.key === "toggle" ? (
                        <Switch
                          checked={row.enabled}
                          onCheckedChange={(checked) => updateRow(row.id, { enabled: checked, delivery: checked ? "Active" : "Off", deliveryTone: checked ? "active" : "off" })}
                          className="meta-switch"
                          data-testid={`table-row-toggle-${row.id}`}
                          aria-label={`Toggle ${row.campaign}`}
                        />
                      ) : (
                        <CellContent row={row} column={column} />
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
        <span>Results from 11 campaigns</span>
        <span className="info-dot">i</span>
      </div>
    </div>
  );
};

export const useCampaignRows = () => {
  const [rows, setRows] = useState<CampaignRow[]>(initialCampaignRows);
  return { rows, setRows };
};
