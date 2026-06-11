import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Activity, Bot, Globe2, Shield, Target, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function Stat({ label, value, icon: Icon, accent }) {
    return (
        <div className="stat-card border border-white/10 bg-[#0a0a0c] p-5" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="data-label">{label}</div>
                    <div className="font-display text-4xl font-black mt-2 tracking-tighter" style={{ color: accent || "#fff" }}>{value}</div>
                </div>
                <Icon className="h-5 w-5 text-gray-500" />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [overview, setOverview] = useState(null);
    const [series, setSeries] = useState([]);
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        api.get("/analytics/overview").then((r) => setOverview(r.data)).catch(() => {});
        api.get("/analytics/timeseries").then((r) => setSeries(r.data)).catch(() => {});
        api.get("/campaigns").then((r) => setCampaigns(r.data)).catch(() => {});
    }, []);

    const o = overview || { total: 0, money: 0, safe: 0, block_rate: 0, campaigns: 0, active_campaigns: 0, top_countries: [], top_reasons: [] };

    return (
        <AppLayout
            title="Overview"
            actions={
                <Link to="/app/campaigns" data-testid="overview-go-campaigns-btn">
                    <Button className="bg-[#00ff66] text-black hover:bg-[#1aff7a] font-display font-bold rounded-none">
                        Manage Campaigns
                    </Button>
                </Link>
            }
        >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat label="Total Visits" value={o.total.toLocaleString()} icon={Activity} />
                <Stat label="Real Users" value={o.money.toLocaleString()} icon={TrendingUp} accent="#00ff66" />
                <Stat label="Bots Blocked" value={o.safe.toLocaleString()} icon={Bot} accent="#ff3b30" />
                <Stat label="Block Rate" value={`${o.block_rate}%`} icon={Shield} accent="#fbbf24" />
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mt-4">
                <div className="lg:col-span-2 border border-white/10 bg-[#0a0a0c] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="data-label">// traffic.last 24h</div>
                            <h3 className="font-display text-lg font-bold mt-1">Decisions Over Time</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono">
                            <span className="flex items-center gap-2"><span className="h-2 w-2 bg-[#00ff66]" /> money</span>
                            <span className="flex items-center gap-2"><span className="h-2 w-2 bg-[#ff3b30]" /> safe</span>
                        </div>
                    </div>
                    <div className="h-72" data-testid="overview-chart">
                        <ResponsiveContainer>
                            <AreaChart data={series}>
                                <defs>
                                    <linearGradient id="money-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00ff66" stopOpacity={0.45} />
                                        <stop offset="100%" stopColor="#00ff66" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="safe-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ff3b30" stopOpacity={0.45} />
                                        <stop offset="100%" stopColor="#ff3b30" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#1f1f22" vertical={false} />
                                <XAxis dataKey="hour" stroke="#52525b" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                                <YAxis stroke="#52525b" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                                <Tooltip
                                    contentStyle={{ background: "#0a0a0c", border: "1px solid #27272a", borderRadius: 0, fontFamily: "IBM Plex Mono" }}
                                    labelStyle={{ color: "#9ca3af" }}
                                />
                                <Area type="monotone" dataKey="money" stroke="#00ff66" strokeWidth={2} fill="url(#money-grad)" />
                                <Area type="monotone" dataKey="safe" stroke="#ff3b30" strokeWidth={2} fill="url(#safe-grad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="border border-white/10 bg-[#0a0a0c] p-5">
                        <div className="data-label flex items-center gap-2"><Globe2 className="h-3 w-3" /> top countries</div>
                        <div className="mt-3 space-y-2">
                            {o.top_countries.length === 0 && <div className="text-xs text-gray-500 font-mono">no data yet</div>}
                            {o.top_countries.map((c) => (
                                <div key={c.country} className="flex items-center justify-between font-mono text-sm">
                                    <span>{c.country}</span>
                                    <span className="text-[#00ff66]">{c.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border border-white/10 bg-[#0a0a0c] p-5">
                        <div className="data-label">// top block reasons</div>
                        <div className="mt-3 space-y-2">
                            {o.top_reasons.length === 0 && <div className="text-xs text-gray-500 font-mono">no data yet</div>}
                            {o.top_reasons.map((r) => (
                                <div key={r.reason} className="flex items-center justify-between font-mono text-xs">
                                    <span className="text-gray-300">{r.reason}</span>
                                    <span className="text-[#ff3b30]">{r.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 border border-white/10 bg-[#0a0a0c]">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <div className="data-label flex items-center gap-2"><Target className="h-3 w-3" /> recent campaigns</div>
                        <h3 className="font-display text-lg font-bold mt-1">Campaign Snapshot</h3>
                    </div>
                    <Link to="/app/campaigns" className="text-xs font-mono text-[#00ff66] hover:underline">
                        view all →
                    </Link>
                </div>
                <div className="font-mono text-sm">
                    <div className="grid grid-cols-6 gap-2 px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                        <div className="col-span-2">Name</div>
                        <div>Status</div>
                        <div>Total</div>
                        <div>Money</div>
                        <div>Safe</div>
                    </div>
                    {campaigns.length === 0 && (
                        <div className="px-5 py-6 text-xs text-gray-500" data-testid="overview-no-campaigns">
                            No campaigns yet. <Link to="/app/campaigns" className="text-[#00ff66] hover:underline">Create one →</Link>
                        </div>
                    )}
                    {campaigns.slice(0, 6).map((c) => (
                        <div key={c.id} className="grid grid-cols-6 gap-2 px-5 py-2.5 hover:bg-white/5 border-b border-white/5 last:border-0">
                            <div className="col-span-2 truncate">{c.name}</div>
                            <div>
                                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${c.status === "active" ? "badge-money" : "badge-safe"}`}>
                                    {c.status}
                                </span>
                            </div>
                            <div className="text-gray-300">{c.stats?.total ?? 0}</div>
                            <div className="text-[#00ff66]">{c.stats?.money ?? 0}</div>
                            <div className="text-[#ff3b30]">{c.stats?.safe ?? 0}</div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
