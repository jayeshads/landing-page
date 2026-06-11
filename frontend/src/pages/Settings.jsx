import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Settings() {
    const { user, logout } = useAuth();
    const nav = useNavigate();

    return (
        <AppLayout title="Settings">
            <div className="grid gap-6 max-w-3xl">
                <div className="border border-white/10 bg-[#0a0a0c] p-6">
                    <div className="data-label">// account</div>
                    <h3 className="font-display text-xl font-bold mt-1">Account profile</h3>
                    <div className="mt-5 grid sm:grid-cols-2 gap-4 font-mono text-sm">
                        <Field label="Name" value={user?.name || "—"} />
                        <Field label="Email" value={user?.email || "—"} />
                        <Field label="Role" value={user?.role || "—"} />
                        <Field label="User ID" value={user?.id || "—"} />
                    </div>
                </div>

                <div className="border border-white/10 bg-[#0a0a0c] p-6">
                    <div className="data-label">// session</div>
                    <h3 className="font-display text-xl font-bold mt-1">Session</h3>
                    <p className="text-xs font-mono text-gray-400 mt-3 leading-relaxed">
                        Auth uses JWT access + refresh tokens stored as httpOnly cookies. Sign out to invalidate this device&apos;s cookies.
                    </p>
                    <Button onClick={async () => { await logout(); nav("/login"); }}
                            data-testid="settings-logout-btn"
                            className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-none font-display font-bold">
                        Sign out of this session
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}

function Field({ label, value }) {
    return (
        <div className="border border-white/5 p-3">
            <div className="data-label">{label}</div>
            <div className="mt-1 text-gray-200 break-all">{value}</div>
        </div>
    );
}
