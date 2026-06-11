import { useCallback, useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Copy } from "lucide-react";
import api, { API_BASE, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

const emptyForm = {
    name: "",
    money_url: "",
    safe_url: "",
    status: "active",
    notes: "",
    filters: {
        allowed_countries: [],
        blocked_countries: [],
        allowed_devices: [],
        allowed_os: [],
        blocked_referrers: [],
        block_datacenter: true,
        block_known_bots: true,
        block_headless: true,
        block_empty_ua: true,
        require_referrer: false,
    },
};

function listToCsv(v) { return Array.isArray(v) ? v.join(", ") : ""; }
function csvToList(s) { return (s || "").split(",").map((x) => x.trim()).filter(Boolean); }

export default function Campaigns() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const load = useCallback(async () => {
        try {
            const r = await api.get("/campaigns");
            setItems(r.data);
        } catch (e) {
            console.warn("campaigns list failed", e?.message);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const resetForm = () => { setForm(emptyForm); setEditingId(null); };

    const openCreate = () => { resetForm(); setOpen(true); };

    const openEdit = (c) => {
        setForm({
            name: c.name,
            money_url: c.money_url,
            safe_url: c.safe_url,
            status: c.status,
            notes: c.notes || "",
            filters: { ...emptyForm.filters, ...(c.filters || {}) },
        });
        setEditingId(c.id);
        setOpen(true);
    };

    const save = async () => {
        try {
            if (editingId) {
                await api.put(`/campaigns/${editingId}`, form);
                toast.success("Campaign updated");
            } else {
                await api.post("/campaigns", form);
                toast.success("Campaign created");
            }
            setOpen(false); resetForm(); load();
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        }
    };

    const remove = async (id) => {
        if (!confirm("Delete this campaign and all its logs?")) return;
        await api.delete(`/campaigns/${id}`);
        toast.success("Campaign deleted");
        load();
    };

    const copyLink = (id) => {
        const url = `${API_BASE}/cloak/${id}`;
        navigator.clipboard.writeText(url);
        toast.success("Cloak link copied");
    };

    return (
        <AppLayout
            title="Campaigns"
            actions={
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
                    <SheetTrigger asChild>
                        <Button onClick={openCreate} data-testid="campaigns-new-btn"
                                className="bg-[#00ff66] text-black hover:bg-[#1aff7a] font-display font-bold rounded-none">
                            <Plus className="h-4 w-4 mr-2" /> New campaign
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="bg-[#08080a] border-l border-white/10 text-gray-100 w-full sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle className="font-display text-2xl font-black tracking-tighter">
                                {editingId ? "Edit campaign" : "Create campaign"}
                            </SheetTitle>
                            <SheetDescription className="font-mono text-xs text-gray-500">
                                Configure money / safe URLs and the filter pipeline that decides which is served.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="data-label">Name</Label>
                                <Input data-testid="cmp-name-input" value={form.name}
                                       onChange={(e) => setForm({ ...form, name: e.target.value })}
                                       className="bg-transparent border-white/20 rounded-none font-mono" />
                            </div>
                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-2">
                                    <Label className="data-label">Money URL (real visitors)</Label>
                                    <Input data-testid="cmp-money-input" value={form.money_url}
                                           placeholder="https://offer.example/lp"
                                           onChange={(e) => setForm({ ...form, money_url: e.target.value })}
                                           className="bg-transparent border-white/20 rounded-none font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="data-label">Safe URL (bots / reviewers)</Label>
                                    <Input data-testid="cmp-safe-input" value={form.safe_url}
                                           placeholder="https://safe.example/about"
                                           onChange={(e) => setForm({ ...form, safe_url: e.target.value })}
                                           className="bg-transparent border-white/20 rounded-none font-mono" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="data-label">Status</Label>
                                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                        <SelectTrigger data-testid="cmp-status-select" className="bg-transparent border-white/20 rounded-none font-mono">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0a0a0c] border-white/15 text-gray-100">
                                            <SelectItem value="active">active</SelectItem>
                                            <SelectItem value="paused">paused</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="data-label mb-3">// filter rules</div>
                                <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                                    <ToggleRow label="Block known bots" v={form.filters.block_known_bots}
                                               on={(v) => setForm({ ...form, filters: { ...form.filters, block_known_bots: v } })} testid="cmp-toggle-bots" />
                                    <ToggleRow label="Block datacenter IPs" v={form.filters.block_datacenter}
                                               on={(v) => setForm({ ...form, filters: { ...form.filters, block_datacenter: v } })} testid="cmp-toggle-datacenter" />
                                    <ToggleRow label="Block headless browsers" v={form.filters.block_headless}
                                               on={(v) => setForm({ ...form, filters: { ...form.filters, block_headless: v } })} testid="cmp-toggle-headless" />
                                    <ToggleRow label="Block empty UA" v={form.filters.block_empty_ua}
                                               on={(v) => setForm({ ...form, filters: { ...form.filters, block_empty_ua: v } })} testid="cmp-toggle-empty-ua" />
                                    <ToggleRow label="Require referrer" v={form.filters.require_referrer}
                                               on={(v) => setForm({ ...form, filters: { ...form.filters, require_referrer: v } })} testid="cmp-toggle-referrer" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="data-label">Allowed countries (ISO2, comma)</Label>
                                    <Input value={listToCsv(form.filters.allowed_countries)}
                                           data-testid="cmp-allowed-countries-input"
                                           placeholder="US, GB, DE"
                                           onChange={(e) => setForm({ ...form, filters: { ...form.filters, allowed_countries: csvToList(e.target.value).map((s) => s.toUpperCase()) } })}
                                           className="bg-transparent border-white/20 rounded-none font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="data-label">Blocked countries</Label>
                                    <Input value={listToCsv(form.filters.blocked_countries)}
                                           data-testid="cmp-blocked-countries-input"
                                           placeholder="RU, CN"
                                           onChange={(e) => setForm({ ...form, filters: { ...form.filters, blocked_countries: csvToList(e.target.value).map((s) => s.toUpperCase()) } })}
                                           className="bg-transparent border-white/20 rounded-none font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="data-label">Allowed devices</Label>
                                    <Input value={listToCsv(form.filters.allowed_devices)}
                                           data-testid="cmp-devices-input"
                                           placeholder="mobile, desktop, tablet"
                                           onChange={(e) => setForm({ ...form, filters: { ...form.filters, allowed_devices: csvToList(e.target.value).map((s) => s.toLowerCase()) } })}
                                           className="bg-transparent border-white/20 rounded-none font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="data-label">Allowed OS</Label>
                                    <Input value={listToCsv(form.filters.allowed_os)}
                                           data-testid="cmp-os-input"
                                           placeholder="ios, android, windows"
                                           onChange={(e) => setForm({ ...form, filters: { ...form.filters, allowed_os: csvToList(e.target.value).map((s) => s.toLowerCase()) } })}
                                           className="bg-transparent border-white/20 rounded-none font-mono" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label className="data-label">Blocked referrers (substrings)</Label>
                                    <Input value={listToCsv(form.filters.blocked_referrers)}
                                           data-testid="cmp-blocked-referrers-input"
                                           placeholder="ahrefs, sucuri, virustotal"
                                           onChange={(e) => setForm({ ...form, filters: { ...form.filters, blocked_referrers: csvToList(e.target.value) } })}
                                           className="bg-transparent border-white/20 rounded-none font-mono" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="data-label">Notes</Label>
                                <Textarea value={form.notes}
                                          data-testid="cmp-notes-input"
                                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                          className="bg-transparent border-white/20 rounded-none font-mono" rows={2} />
                            </div>

                            <Button onClick={save} data-testid="cmp-save-btn"
                                    className="w-full bg-[#00ff66] text-black hover:bg-[#1aff7a] font-display font-bold rounded-none h-11">
                                {editingId ? "Save changes" : "Create campaign"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            }
        >
            <div className="border border-white/10 bg-[#0a0a0c]">
                <div className="grid grid-cols-12 gap-2 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-gray-500 border-b border-white/10">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-3">Money URL</div>
                    <div className="col-span-2">Safe URL</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Total</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>
                {items.length === 0 && (
                    <div className="px-5 py-12 text-center text-xs text-gray-500 font-mono" data-testid="campaigns-empty">
                        No campaigns yet. Click <span className="text-[#00ff66]">New campaign</span> to create your first.
                    </div>
                )}
                {items.map((c) => (
                    <div key={c.id} className="grid grid-cols-12 gap-2 px-5 py-3 items-center font-mono text-sm hover:bg-white/5 border-b border-white/5 last:border-0"
                         data-testid={`campaign-row-${c.id}`}>
                        <div className="col-span-3">
                            <div className="font-display font-bold truncate">{c.name}</div>
                            <div className="text-[10px] text-gray-500 truncate">{c.id}</div>
                        </div>
                        <div className="col-span-3 text-xs text-[#00ff66] truncate">{c.money_url}</div>
                        <div className="col-span-2 text-xs text-yellow-300 truncate">{c.safe_url}</div>
                        <div className="col-span-1">
                            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${c.status === "active" ? "badge-money" : "badge-safe"}`}>{c.status}</span>
                        </div>
                        <div className="col-span-1 text-xs">{c.stats?.total ?? 0}</div>
                        <div className="col-span-2 flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2 rounded-none text-gray-300 hover:bg-white/5"
                                    data-testid={`cmp-copy-${c.id}`} onClick={() => copyLink(c.id)}>
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 rounded-none text-gray-300 hover:bg-white/5"
                                    data-testid={`cmp-edit-${c.id}`} onClick={() => openEdit(c)}>
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 rounded-none text-red-400 hover:bg-red-500/10"
                                    data-testid={`cmp-delete-${c.id}`} onClick={() => remove(c.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}

function ToggleRow({ label, v, on, testid }) {
    return (
        <div className="flex items-center justify-between border border-white/10 px-3 py-2">
            <span className="text-gray-300">{label}</span>
            <Switch checked={v} onCheckedChange={on} data-testid={testid} />
        </div>
    );
}
