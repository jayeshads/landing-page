import { useEffect, useMemo, useState } from "react";
import { createDefaultCampaign, initialCampaignRows } from "@/data/campaignsData";
import { CampaignRow } from "@/types/campaign";

const ROWS_KEY = "meta_ads_rows_v3";
const DATE_KEY = "meta_ads_date_v1";

export const formatMetaDate = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Today: 19 Sep 2026";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `Today: ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const defaultIsoDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const readRows = () => {
  try {
    const stored = window.localStorage.getItem(ROWS_KEY);
    if (!stored) return initialCampaignRows;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : initialCampaignRows;
  } catch {
    return initialCampaignRows;
  }
};

export const useCampaignStore = () => {
  const [rows, setRows] = useState<CampaignRow[]>(readRows);
  const [dateValue, setDateValue] = useState(() => window.localStorage.getItem(DATE_KEY) || defaultIsoDate());

  useEffect(() => {
    window.localStorage.setItem(ROWS_KEY, JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    window.localStorage.setItem(DATE_KEY, dateValue);
  }, [dateValue]);

  const selectedCount = useMemo(() => rows.filter((row) => row.selected).length, [rows]);

  const updateRow = (id: string, patch: Partial<CampaignRow>) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const saveRow = (nextRow: CampaignRow) => {
    setRows((current) => current.map((row) => (row.id === nextRow.id ? nextRow : row)));
  };

  const createCampaign = () => {
    const next = createDefaultCampaign(rows.length + 1);
    setRows((current) => current.map((row) => ({ ...row, selected: false })).concat(next));
    return next;
  };

  const replaceRows = (nextRows: CampaignRow[]) => {
    setRows(nextRows);
  };

  const resetRows = () => {
    setRows(initialCampaignRows);
  };

  return {
    rows,
    setRows: replaceRows,
    updateRow,
    saveRow,
    createCampaign,
    resetRows,
    selectedCount,
    dateValue,
    setDateValue,
    dateLabel: formatMetaDate(dateValue),
  };
};
