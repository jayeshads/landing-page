export type DeliveryTone = "draft" | "error" | "active" | "off";

export type CampaignRow = {
  id: string;
  selected: boolean;
  enabled: boolean;
  campaign: string;
  campaignMeta?: string;
  delivery: string;
  deliveryTone: DeliveryTone;
  actions: string;
  bidStrategy: string;
  budget: string;
  budgetSub?: string;
  attribution: string;
  attributionSub?: string;
  results: string;
  resultsSub?: string;
  reach: string;
  impressions: string;
  costPerResult: string;
  costPerResultSub?: string;
  amountSpent: string;
  ends: string;
  schedule: string;
};

export type CampaignColumn = {
  key: keyof CampaignRow | "select" | "toggle";
  label: string;
  width: number;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  sticky?: boolean;
};
