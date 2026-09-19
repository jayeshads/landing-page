import React from "react";
import { ActionToolbar, CampaignTabs, FilterBar } from "@/components/CampaignControls";
import { CampaignsTable, useCampaignRows } from "@/components/CampaignsTable";
import { DataEditorDrawer } from "@/components/DataEditorDrawer";
import { SidebarRail } from "@/components/SidebarRail";
import { TopBar } from "@/components/TopBar";

export const MetaAdsLayout = () => {
  const { rows, setRows } = useCampaignRows();

  return (
    <div className="meta-app" data-testid="meta-ads-dashboard">
      <SidebarRail />
      <main className="meta-main">
        <TopBar />
        <FilterBar />
        <div className="tabs-toolbar-wrap">
          <CampaignTabs />
          <div className="toolbar-data-row">
            <ActionToolbar />
            <DataEditorDrawer rows={rows} onRowsChange={setRows} />
          </div>
        </div>
        <CampaignsTable rows={rows} onRowsChange={setRows} />
      </main>
    </div>
  );
};
