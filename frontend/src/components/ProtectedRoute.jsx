import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (user === null) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500 font-mono text-xs uppercase tracking-[0.3em]">
                <span className="blink">// authenticating</span>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    return children;
}
