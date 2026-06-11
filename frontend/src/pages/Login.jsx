import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";

export default function Login() {
    const { login, user } = useAuth();
    const [email, setEmail] = useState("admin@cloakforge.io");
    const [password, setPassword] = useState("Admin@12345");
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState("");
    const nav = useNavigate();

    useEffect(() => {
        if (user) nav("/app", { replace: true });
    }, [user, nav]);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErr("");
        const res = await login(email, password);
        setSubmitting(false);
        if (res.ok) nav("/app");
        else setErr(res.error);
    };

    return (
        <div className="min-h-screen bg-[#050505] grid lg:grid-cols-2">
            <div className="hidden lg:flex relative overflow-hidden border-r border-white/10">
                <img
                    src="https://images.pexels.com/photos/5380603/pexels-photo-5380603.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-transparent" />
                <div className="relative z-10 self-end p-12 text-gray-300">
                    <div className="data-label text-[#00ff66]">// authenticated.access</div>
                    <h2 className="font-display text-4xl font-black tracking-tighter mt-3 text-white">
                        Re-enter the cloak console.
                    </h2>
                    <p className="text-sm text-gray-400 mt-4 max-w-md font-mono leading-relaxed">
                        JWT session, httpOnly cookies, bcrypt password hashing.
                        Standard hardened authentication — nothing fancy, no shortcuts.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-center p-6 sm:p-12">
                <form onSubmit={submit} className="w-full max-w-sm" data-testid="login-form">
                    <Link to="/" className="flex items-center gap-2 mb-10" data-testid="login-logo">
                        <div className="h-8 w-8 grid place-items-center bg-[#00ff66] text-black font-black font-display">C</div>
                        <span className="font-display text-sm font-black tracking-tight">CLOAKFORGE</span>
                    </Link>

                    <div className="data-label">// auth.signin</div>
                    <h1 className="font-display text-3xl font-black tracking-tighter mt-2">Sign in</h1>
                    <p className="text-sm text-gray-500 mt-2 font-mono">
                        Use the seeded admin or any registered account.
                    </p>

                    <div className="mt-8 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="data-label">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                data-testid="login-email-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-transparent border-white/20 rounded-none h-11 font-mono focus-visible:ring-1 focus-visible:ring-[#00ff66] focus-visible:border-[#00ff66]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="data-label">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                data-testid="login-password-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-transparent border-white/20 rounded-none h-11 font-mono focus-visible:ring-1 focus-visible:ring-[#00ff66] focus-visible:border-[#00ff66]"
                                required
                            />
                        </div>
                        {err && (
                            <div data-testid="login-error" className="border border-red-500/30 bg-red-500/5 text-red-400 text-xs font-mono p-3">
                                {err}
                            </div>
                        )}
                        <Button
                            type="submit"
                            data-testid="login-submit-btn"
                            disabled={submitting}
                            className="w-full bg-[#00ff66] text-black hover:bg-[#1aff7a] font-display font-bold rounded-none h-11"
                        >
                            {submitting ? "Authenticating…" : "Sign in"}
                            <Shield className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-6">
                        No account?{" "}
                        <Link to="/register" className="text-[#00ff66] hover:underline" data-testid="login-to-register">
                            register here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
