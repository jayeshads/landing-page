import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, BarChart3, Code2, FileWarning, LayoutGrid, LogOut, Settings, Shield, Target } from "lucide-react";

const items = [
    { to: "/app", label: "Overview", icon: LayoutGrid, testid: "nav-overview" },
    { to: "/app/campaigns", label: "Campaigns", icon: Target, testid: "nav-campaigns" },
    { to: "/app/logs", label: "Click Logs", icon: Activity, testid: "nav-logs" },
    { to: "/app/rules", label: "Bot Rules", icon: Shield, testid: "nav-rules" },
    { to: "/app/integration", label: "Integration", icon: Code2, testid: "nav-integration" },
    { to: "/app/settings", label: "Settings", icon: Settings, testid: "nav-settings" },
];

export default function AppLayout({ children, title, actions }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#050505] text-gray-100 flex">
            <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-white/10 bg-[#08080a]">
                <div className="px-5 py-5 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2" data-testid="sidebar-logo">
                        <div className="h-7 w-7 grid place-items-center bg-[#00ff66] text-black font-black font-display">C</div>
                        <div>
                            <div className="font-display text-sm font-black tracking-tight">CLOAKFORGE</div>
                            <div className="data-label text-[10px]">cloak.engine v1</div>
                        </div>
                    </Link>
                </div>
                <nav className="flex-1 py-4 px-2 space-y-0.5">
                    {items.map(({ to, label, icon: Icon, testid }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/app"}
                            data-testid={testid}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 text-sm font-mono transition-colors ${
                                    isActive
                                        ? "bg-white/5 text-white border-l-2 border-[#00ff66]"
                                        : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                                }`
                            }
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-3 py-3 border-t border-white/10 text-xs space-y-2">
                    <div className="font-mono text-gray-500 truncate" data-testid="sidebar-user-email">{user?.email}</div>
                    <button
                        onClick={handleLogout}
                        data-testid="sidebar-logout-btn"
                        className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 py-2 text-xs uppercase tracking-[0.2em] text-gray-300 hover:text-white"
                    >
                        <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 min-w-0">
                <header className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div>
                        <div className="data-label text-[10px]">cloak.dashboard</div>
                        <h1 className="font-display text-xl font-bold tracking-tight" data-testid="page-title">{title}</h1>
                    </div>
                    <div className="flex items-center gap-3">{actions}</div>
                </header>
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
