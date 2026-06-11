import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Campaigns from "@/pages/Campaigns";
import Logs from "@/pages/Logs";
import Rules from "@/pages/Rules";
import Integration from "@/pages/Integration";
import Settings from "@/pages/Settings";

const TOAST_OPTIONS = {
    style: {
        background: "#0a0a0c",
        color: "#f9fafb",
        border: "1px solid #27272a",
        borderRadius: 0,
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "12px",
    },
};

export default function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/app/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
                        <Route path="/app/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
                        <Route path="/app/rules" element={<ProtectedRoute><Rules /></ProtectedRoute>} />
                        <Route path="/app/integration" element={<ProtectedRoute><Integration /></ProtectedRoute>} />
                        <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    </Routes>
                    <Toaster theme="dark" position="bottom-right" toastOptions={TOAST_OPTIONS} />
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}
