import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus } from "lucide-react";

export default function Register() {
    const { register, user } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
        const res = await register(name, email, password);
        setSubmitting(false);
        if (res.ok) nav("/app");
        else setErr(res.error);
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
            <form onSubmit={submit} className="w-full max-w-md" data-testid="register-form">
                <Link to="/" className="flex items-center gap-2 mb-10" data-testid="register-logo">
                    <div className="h-8 w-8 grid place-items-center bg-[#00ff66] text-black font-black font-display">C</div>
                    <span className="font-display text-sm font-black tracking-tight">CLOAKFORGE</span>
                </Link>
                <div className="data-label">// auth.register</div>
                <h1 className="font-display text-3xl font-black tracking-tighter mt-2">Create account</h1>
                <p className="text-sm text-gray-500 mt-2 font-mono">
                    Provision a workspace and start cloaking in under 60 seconds.
                </p>
                <div className="mt-8 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="data-label">Display name</Label>
                        <Input
                            id="name"
                            data-testid="register-name-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-transparent border-white/20 rounded-none h-11 font-mono focus-visible:ring-1 focus-visible:ring-[#00ff66] focus-visible:border-[#00ff66]"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="data-label">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            data-testid="register-email-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent border-white/20 rounded-none h-11 font-mono focus-visible:ring-1 focus-visible:ring-[#00ff66] focus-visible:border-[#00ff66]"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="data-label">Password (min 6)</Label>
                        <Input
                            id="password"
                            type="password"
                            data-testid="register-password-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-white/20 rounded-none h-11 font-mono focus-visible:ring-1 focus-visible:ring-[#00ff66] focus-visible:border-[#00ff66]"
                            required
                            minLength={6}
                        />
                    </div>
                    {err && (
                        <div data-testid="register-error" className="border border-red-500/30 bg-red-500/5 text-red-400 text-xs font-mono p-3">
                            {err}
                        </div>
                    )}
                    <Button
                        type="submit"
                        data-testid="register-submit-btn"
                        disabled={submitting}
                        className="w-full bg-[#00ff66] text-black hover:bg-[#1aff7a] font-display font-bold rounded-none h-11"
                    >
                        {submitting ? "Provisioning…" : "Create account"}
                        <UserPlus className="h-4 w-4 ml-2" />
                    </Button>
                </div>
                <p className="text-xs text-gray-500 font-mono mt-6">
                    Already registered?{" "}
                    <Link to="/login" className="text-[#00ff66] hover:underline" data-testid="register-to-login">sign in</Link>
                </p>
            </form>
        </div>
    );
}
