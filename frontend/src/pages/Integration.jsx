import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import api, { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function Integration() {
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState("");

    useEffect(() => {
        api.get("/campaigns").then((r) => {
            setItems(r.data);
            if (r.data[0]) setSelected(r.data[0].id);
        });
    }, []);

    const cloakUrl = selected ? `${API_BASE}/cloak/${selected}` : `${API_BASE}/cloak/<CAMPAIGN_ID>`;
    const jsonUrl = `${cloakUrl}?mode=json`;
    const jsSnippet = `<!-- CloakForge embed -->
<script>
  (function(){
    var t = "${cloakUrl}";
    // server-side redirect — full document navigation
    window.location.replace(t);
  })();
</script>`;
    const curl = `curl -sSL '${jsonUrl}' \\
  -A 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)' \\
  -H 'Accept-Language: en-US,en;q=0.9' \\
  -H 'Referer: https://facebook.com/'`;

    const copy = (text, label) => { navigator.clipboard.writeText(text); toast.success(`${label} copied`); };

    return (
        <AppLayout title="Integration">
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="border border-white/10 bg-[#0a0a0c] p-5">
                        <div className="data-label">// select campaign</div>
                        <div className="mt-3 flex gap-3 items-center">
                            <Select value={selected} onValueChange={setSelected}>
                                <SelectTrigger className="w-64 bg-transparent border-white/20 rounded-none font-mono"
                                               data-testid="integration-campaign-select">
                                    <SelectValue placeholder="Select campaign" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0a0a0c] border-white/15 text-gray-100">
                                    {items.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!items.length && (
                                <span className="text-xs text-gray-500 font-mono">Create a campaign first.</span>
                            )}
                        </div>
                    </div>

                    <CodeCard title="Cloak link (302 redirect)"
                              subtitle="Drop this URL into your ad tracking template. Best one-hop option."
                              code={cloakUrl}
                              testid="integration-cloak-url"
                              onCopy={() => copy(cloakUrl, "Cloak URL")} />

                    <CodeCard title="JSON decision endpoint"
                              subtitle="Use server-side to fetch the decision and render conditionally."
                              code={jsonUrl}
                              testid="integration-json-url"
                              onCopy={() => copy(jsonUrl, "JSON endpoint")} />

                    <CodeCard title="JavaScript embed snippet"
                              subtitle="Paste in your prelander right before </body>."
                              code={jsSnippet}
                              testid="integration-js-snippet"
                              onCopy={() => copy(jsSnippet, "JS snippet")} />

                    <CodeCard title="cURL test command"
                              subtitle="Simulate a real-user request to verify your filter behavior."
                              code={curl}
                              testid="integration-curl"
                              onCopy={() => copy(curl, "cURL")} />
                </div>

                <div className="space-y-4">
                    <div className="border border-white/10 bg-[#0a0a0c] p-5 relative">
                        <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&q=80"
                             alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
                        <div className="relative">
                            <div className="data-label">// integration.notes</div>
                            <h3 className="font-display text-lg font-bold mt-2">Best practices</h3>
                            <ul className="mt-4 text-xs font-mono text-gray-400 space-y-2.5 leading-relaxed">
                                <li><span className="text-[#00ff66]">●</span> Use the 302 redirect URL as your ad destination. It triggers a real
                                navigation so referrer + UA are passed faithfully.</li>
                                <li><span className="text-[#00ff66]">●</span> Pair with a clean safe page that satisfies platform policies
                                (about-us, blog post, niche review).</li>
                                <li><span className="text-[#00ff66]">●</span> Pause campaigns during review windows if you want to ensure
                                100% safe page exposure.</li>
                                <li><span className="text-[#00ff66]">●</span> All decisions are logged — inspect the Click Logs to audit
                                false positives.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function CodeCard({ title, subtitle, code, testid, onCopy }) {
    return (
        <div className="border border-white/10 bg-[#0a0a0c]" data-testid={testid}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div>
                    <div className="font-display font-bold">{title}</div>
                    <div className="text-xs text-gray-500 font-mono">{subtitle}</div>
                </div>
                <Button onClick={onCopy} variant="outline" size="sm"
                        className="border-white/15 text-gray-300 hover:bg-white/5 rounded-none font-mono text-xs"
                        data-testid={`${testid}-copy-btn`}>
                    <Copy className="h-3 w-3 mr-1.5" /> Copy
                </Button>
            </div>
            <pre className="px-5 py-4 text-xs font-mono text-gray-300 whitespace-pre-wrap break-all leading-relaxed">
{code}
            </pre>
        </div>
    );
}
