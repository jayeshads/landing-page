import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignRow } from "@/types/campaign";

type CampaignFormDrawerProps = {
  row: CampaignRow | null;
  open: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSave: (row: CampaignRow) => void;
};

const fields: { key: keyof CampaignRow; label: string; type?: "checkbox" }[] = [
  { key: "selected", label: "Selected", type: "checkbox" },
  { key: "enabled", label: "On / Active", type: "checkbox" },
  { key: "campaign", label: "Campaign name" },
  { key: "delivery", label: "Delivery" },
  { key: "actions", label: "Actions" },
  { key: "results", label: "Results" },
  { key: "resultsSub", label: "Results sub text" },
  { key: "costPerResult", label: "Cost per result" },
  { key: "costPerResultSub", label: "Cost per result sub text" },
  { key: "budget", label: "Budget" },
  { key: "budgetSub", label: "Budget sub text" },
  { key: "amountSpent", label: "Amount spent" },
  { key: "impressions", label: "Impressions" },
  { key: "reach", label: "Reach" },
  { key: "bidStrategy", label: "Bid strategy" },
  { key: "attribution", label: "Attribution setting" },
  { key: "attributionSub", label: "Attribution sub text" },
  { key: "ends", label: "Ends" },
  { key: "schedule", label: "Schedule" },
];

export const CampaignFormDrawer = ({ row, open, mode, onClose, onSave }: CampaignFormDrawerProps) => {
  const [draft, setDraft] = useState<CampaignRow | null>(row);

  useEffect(() => {
    setDraft(row);
  }, [row]);

  if (!open || !draft) return null;

  const patch = (key: keyof CampaignRow, value: string | boolean) => {
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, [key]: value } as CampaignRow;
      if (key === "enabled") {
        next.delivery = value ? "Active" : "Off";
        next.deliveryTone = value ? "active" : "off";
      }
      if (key === "delivery") {
        next.deliveryTone = String(value).toLowerCase() === "active" ? "active" : String(value).toLowerCase() === "off" ? "off" : current.deliveryTone;
      }
      return next;
    });
  };

  return (
    <div className="editor-overlay" data-testid="campaign-form-overlay">
      <aside className="campaign-form-drawer" data-testid="campaign-form-drawer">
        <div className="editor-header">
          <div>
            <h2>{mode === "create" ? "Create campaign" : "Edit campaign"}</h2>
            <p>Har visible campaign detail yahan se edit ho sakti hai. Save karte hi table update hoga.</p>
          </div>
          <Button className="icon-action" variant="outline" size="icon" onClick={onClose} data-testid="close-campaign-form-button" aria-label="Close campaign editor">
            <X size={16} />
          </Button>
        </div>
        <div className="campaign-form-grid">
          {fields.map((field) => (
            <label className={`campaign-form-field ${field.type === "checkbox" ? "check-field" : ""}`} key={field.key}>
              <span>{field.label}</span>
              {field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={Boolean(draft[field.key])}
                  onChange={(event) => patch(field.key, event.target.checked)}
                  data-testid={`campaign-form-${String(field.key)}`}
                />
              ) : (
                <input
                  value={String(draft[field.key] ?? "")}
                  onChange={(event) => patch(field.key, event.target.value)}
                  data-testid={`campaign-form-${String(field.key)}`}
                />
              )}
            </label>
          ))}
        </div>
        <div className="editor-actions">
          <Button variant="outline" onClick={onClose} data-testid="cancel-campaign-form-button">Cancel</Button>
          <Button onClick={() => onSave(draft)} data-testid="save-campaign-form-button"><Check size={16} /> Save campaign</Button>
        </div>
      </aside>
    </div>
  );
};
