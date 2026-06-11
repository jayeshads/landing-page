import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { RefreshCw } from "lucide-react";

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [campaignId, setCampaignId] = useState("all");
    const [decision, setDecision] = useState("all");
    const [country, setCountry] = useState("");
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            let data = [];
            if (campaignId === "all") {
                const r = await api.get("/logs/recent?limit=200");
                data = r.data;
            } else {
                const params = new URLSearchParams();
                params.set("limit", "200");
                if (decision !== "all") params.set("decision", decision);
                if (country) params.set("country", country);
                const r = await api.get(`/campaigns/${campaignId}/logs?${params.toString()}`);
                data = r.data;
            }
            if (campaignId === "all") {
                if (decision !== "all") data = data.filter((d) => d.decision === decision);
                if (country) data = data.filter((d) => (d.country || "").toUpperCase() === country.toUpperCase());
            }
            setLogs(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { api.get("/campaigns").then((r) => setCampaigns(r.data)); }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { load(); }, [campaignId, decision, country]);

    return (
        <AppLayout
            title="Click Logs"
            actions={
                <Button onClick={load} variant="outline" data-testid="logs-refresh-btn"
                        className="border-white/15 text-gray-300 hover:bg-white/5 rounded-none">
                    <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
                </Button>
            }
        >
            <div className="flex flex-wrap gap-3 mb-4">
                <Select value={campaignId} onValueChange={setCampaignId}>
                    <SelectTrigger className="w-56 bg-transparent border-white/20 rounded-none font-mono"
                                   data-testid="logs-campaign-select">
                        <SelectValue placeholder="Campaign" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0c] border-white/15 text-gray-100">
                        <SelectItem value="all">All campaigns</SelectItem>
                        {campaigns.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={decision} onValueChange={setDecision}>
                    <SelectTrigger className="w-44 bg-transparent border-white/20 rounded-none font-mono"
                                   data-testid="logs-decision-select">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0c] border-white/15 text-gray-100">
                        <SelectItem value="all">All decisions</SelectItem>
                        <SelectItem value="money">money</SelectItem>
                        <SelectItem value="safe">safe</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    placeholder="Country ISO (e.g. US)"
                    data-testid="logs-country-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-44 bg-transparent border-white/20 rounded-none font-mono uppercase"
                    maxLength={2}
                />
            </div>

            <div className="border border-white/10 bg-[#0a0a0c] overflow-x-auto">
                <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-white/10 min-w-[1000px]">
                    <div className="col-span-2">Timestamp</div>
                    <div className="col-span-2">IP</div>
                    <div className="col-span-1">Country</div>
                    <div className="col-span-1">Device</div>
                    <div className="col-span-1">OS</div>
                    <div className="col-span-3">User-Agent</div>
                    <div className="col-span-1">Decision</div>
                    <div className="col-span-1">Reason</div>
                </div>
                {logs.length === 0 && (
                    <div className="px-5 py-10 text-center text-xs text-gray-500 font-mono" data-testid="logs-empty">
                        No clicks logged yet. Use the cloak link from the Integration page to generate test traffic.
                    </div>
                )}
                {logs.map((l, i) => (
                    <div key={i} data-testid={`log-row-${i}`} className="grid grid-cols-12 gap-2 px-5 py-1.5 text-[11px] font-mono items-center min-w-[1000px] hover:bg-white/5 border-b border-white/5 last:border-0">
                        <div className="col-span-2 text-gray-400">{new Date(l.ts).toLocaleString()}</div>
                        <div className="col-span-2 text-gray-200">{l.ip}</div>
                        <div className="col-span-1 text-gray-200">{l.country || "XX"}</div>
                        <div className="col-span-1 text-gray-400">{l.device}</div>
                        <div className="col-span-1 text-gray-400">{l.os}</div>
                        <div className="col-span-3 text-gray-500 truncate" title={l.ua}>{l.ua}</div>
                        <div className="col-span-1">
                            <span className={`px-1.5 py-0.5 ${l.decision === "money" ? "badge-money" : "badge-bot"}`}>
                                {l.decision}
                            </span>
                        </div>
                        <div className="col-span-1 text-gray-400 truncate" title={l.reason}>{l.reason}</div>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
