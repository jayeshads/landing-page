import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { formatApiErrorDetail } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // null = checking, false = logged out, object = user
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
        } catch {
            setUser(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = async (email, password) => {
        setError("");
        try {
            const { data } = await api.post("/auth/login", { email, password });
            setUser(data);
            return { ok: true };
        } catch (e) {
            const msg = formatApiErrorDetail(e.response?.data?.detail) || e.message;
            setError(msg);
            return { ok: false, error: msg };
        }
    };

    const register = async (name, email, password) => {
        setError("");
        try {
            const { data } = await api.post("/auth/register", { name, email, password });
            setUser(data);
            return { ok: true };
        } catch (e) {
            const msg = formatApiErrorDetail(e.response?.data?.detail) || e.message;
            setError(msg);
            return { ok: false, error: msg };
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            console.warn("logout request failed; clearing client state anyway", e?.message);
        }
        setUser(false);
    };

    const value = useMemo(
        () => ({ user, error, login, register, logout, refresh }),
        [user, error, refresh],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
