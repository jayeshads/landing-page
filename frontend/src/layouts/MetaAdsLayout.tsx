import React, { useState } from "react";
import { ActionToolbar, CampaignTabs, FilterBar } from "@/components/CampaignControls";
import { CampaignFormDrawer } from "@/components/CampaignFormDrawer";
import { CampaignsTable } from "@/components/CampaignsTable";
import { DataEditorDrawer } from "@/components/DataEditorDrawer";
import { RightRail } from "@/components/RightRail";
import { SidebarRail } from "@/components/SidebarRail";
import { TopBar } from "@/components/TopBar";
import { useCampaignStore } from "@/hooks/useCampaignStore";
import { CampaignRow } from "@/types/campaign";

export const MetaAdsLayout = () => {
  const store = useCampaignStore();
  const [formRow, setFormRow] = useState<CampaignRow | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("edit");

  const openCreate = () => {
    const created = store.createCampaign();
    setFormMode("create");
    setFormRow(created);
  };

  const openSelected = () => {
    const selected = store.rows.find((row) => row.selected) || store.rows[0];
    if (selected) {
      setFormMode("edit");
      setFormRow(selected);
    }
  };

  const openEditRow = (row: CampaignRow) => {
    setFormMode("edit");
    setFormRow(row);
  };

  const saveForm = (row: CampaignRow) => {
    store.saveRow(row);
    setFormRow(null);
  };

  return (
    <div className="meta-app" data-testid="meta-ads-dashboard">
      <SidebarRail />
      <main className="meta-main">
        <TopBar />
        <FilterBar />
        <div className="tabs-toolbar-wrap">
          <CampaignTabs
            selectedCount={store.selectedCount}
            rowCount={store.rows.length}
            dateValue={store.dateValue}
            dateLabel={store.dateLabel}
            onDateChange={store.setDateValue}
          />
          <div className="toolbar-data-row">
            <ActionToolbar onCreate={openCreate} onEditSelected={openSelected} />
            <DataEditorDrawer rows={store.rows} onRowsChange={store.setRows} />
          </div>
        </div>
        <CampaignsTable rows={store.rows} onRowsChange={store.setRows} onRowChange={store.updateRow} onEditRow={openEditRow} />
      </main>
      <RightRail />
      <CampaignFormDrawer row={formRow} open={Boolean(formRow)} mode={formMode} onClose={() => setFormRow(null)} onSave={saveForm} />
    </div>
  );
};
