import { useCallback, useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Globe2, Server, Eye } from "lucide-react";

function StatBox({ icon: Icon, label, count, color }) {
    return (
        <div className="border border-white/10 bg-[#0a0a0c] p-5">
            <div className="flex items-center justify-between">
                <Icon className="h-5 w-5" style={{ color }} />
                <div className="font-display text-3xl font-black" style={{ color }}>{count}</div>
            </div>
            <div className="data-label mt-3">{label}</div>
        </div>
    );
}

export default function Rules() {
    const [rules, setRules] = useState(null);
    const fetchRules = useCallback(async () => {
        try {
            const r = await api.get("/rules");
            setRules(r.data);
        } catch (e) {
            console.warn("rules fetch failed", e?.message);
        }
    }, []);
    useEffect(() => { fetchRules(); }, [fetchRules]);

    if (!rules) {
        return (
            <AppLayout title="Bot Rules">
                <div className="font-mono text-xs text-gray-500 blink">loading static intel...</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Bot Filter Rules">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatBox icon={Bot} label="Bot UA Patterns" count={rules.counts.ua_patterns} color="#00ff66" />
                <StatBox icon={Server} label="Datacenter CIDRs" count={rules.counts.datacenter_cidrs} color="#fbbf24" />
                <StatBox icon={Globe2} label="Headless Hints" count={rules.counts.headless_hints} color="#3b82f6" />
                <StatBox icon={Eye} label="Inspection Hosts" count={rules.counts.inspection_referrers} color="#ff3b30" />
            </div>

            <Tabs defaultValue="ua" className="w-full">
                <TabsList className="bg-[#0a0a0c] border border-white/10 rounded-none p-0 h-auto">
                    <TabsTrigger value="ua" data-testid="rules-tab-ua" className="rounded-none data-[state=active]:bg-white/5 data-[state=active]:text-[#00ff66] font-mono text-xs uppercase tracking-[0.2em] px-4 py-3">UA Patterns</TabsTrigger>
                    <TabsTrigger value="cidr" data-testid="rules-tab-cidr" className="rounded-none data-[state=active]:bg-white/5 data-[state=active]:text-[#00ff66] font-mono text-xs uppercase tracking-[0.2em] px-4 py-3">Datacenter CIDRs</TabsTrigger>
                    <TabsTrigger value="headless" data-testid="rules-tab-headless" className="rounded-none data-[state=active]:bg-white/5 data-[state=active]:text-[#00ff66] font-mono text-xs uppercase tracking-[0.2em] px-4 py-3">Headless Hints</TabsTrigger>
                    <TabsTrigger value="ref" data-testid="rules-tab-ref" className="rounded-none data-[state=active]:bg-white/5 data-[state=active]:text-[#00ff66] font-mono text-xs uppercase tracking-[0.2em] px-4 py-3">Inspection Referrers</TabsTrigger>
                </TabsList>
                <TabsContent value="ua" className="mt-4">
                    <CodeList items={rules.bot_ua_patterns} />
                </TabsContent>
                <TabsContent value="cidr" className="mt-4">
                    <CodeList items={rules.datacenter_cidrs} />
                </TabsContent>
                <TabsContent value="headless" className="mt-4">
                    <CodeList items={rules.headless_hints} />
                </TabsContent>
                <TabsContent value="ref" className="mt-4">
                    <CodeList items={rules.inspection_referrers} />
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}

function CodeList({ items }) {
    return (
        <div className="border border-white/10 bg-[#0a0a0c] p-4 font-mono text-xs">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                {items.map((p) => (
                    <div key={p} className="border border-white/5 px-2.5 py-1.5 text-gray-300 truncate" title={p}>
                        {p}
                    </div>
                ))}
            </div>
        </div>
    );
}
