import React, { useState } from "react";
import { Check, Code2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignRow } from "@/types/campaign";

type DataEditorDrawerProps = {
  rows: CampaignRow[];
  onRowsChange: (rows: CampaignRow[]) => void;
};

export const DataEditorDrawer = ({ rows, onRowsChange }: DataEditorDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(JSON.stringify(rows, null, 2));
  const [error, setError] = useState("");

  const openEditor = () => {
    setDraft(JSON.stringify(rows, null, 2));
    setError("");
    setOpen(true);
  };

  const applyData = () => {
    try {
      const parsed = JSON.parse(draft);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of campaign rows");
      onRowsChange(parsed);
      setError("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  return (
    <>
      <Button className="data-editor-button" variant="outline" onClick={openEditor} data-testid="open-data-editor-button">
        <Code2 size={15} /> Edit table data
      </Button>
      {open && (
        <div className="editor-overlay" data-testid="data-editor-overlay">
          <aside className="editor-drawer" data-testid="data-editor-drawer">
            <div className="editor-header">
              <div>
                <h2>Edit table JSON</h2>
                <p>Change campaign rows here. Save to update the table instantly.</p>
              </div>
              <Button className="icon-action" variant="outline" size="icon" onClick={() => setOpen(false)} data-testid="close-data-editor-button" aria-label="Close editor">
                <X size={16} />
              </Button>
            </div>
            <textarea
              className="json-editor"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              spellCheck={false}
              data-testid="json-data-textarea"
              aria-label="Campaign table JSON data"
            />
            {error && <div className="editor-error" data-testid="data-editor-error">{error}</div>}
            <div className="editor-actions">
              <Button variant="outline" onClick={() => setDraft(JSON.stringify(rows, null, 2))} data-testid="reset-data-editor-button">
                Reset
              </Button>
              <Button onClick={applyData} data-testid="apply-data-editor-button">
                <Check size={16} /> Apply data
              </Button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
