import { useEffect, useState } from "react";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AssistantPage from "./pages/AssistantPage";
import AutomationsPage from "./pages/AutomationsPage";
import AutomationDetailPage from "./pages/AutomationDetailPage";

import { getCurrentUser, logout } from "./api/client";
import { getToken, removeToken } from "./auth/token";

type User = {
    uuid: string;
    username: string;
    email: string;
    full_name: string;
    last_login: string | null;
};

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionNotice, setSessionNotice] = useState<string | null>(null);

    useEffect(() => {
        async function checkAuth() {
            const token = getToken();

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch {
                removeToken();
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    useEffect(() => {
        const handleSessionExpired = () => {
            removeToken();
            setUser(null);
            setSessionNotice("Oturumun sona erdi. Lütfen tekrar giriş yap.");
        };
        window.addEventListener("autoflow:session-expired", handleSessionExpired);
        return () => window.removeEventListener("autoflow:session-expired", handleSessionExpired);
    }, []);

    async function handleLogout() {
        await logout();
        setUser(null);
        setSessionNotice(null);
    }

    if (loading) {
        return (
            <main className="auth-page">
                <div className="loading-state">
                    Loading...
                </div>
            </main>
        );
    }

    return (
        <BrowserRouter>
            <Routes>

                {/* Public */}
                {!user ? (
                    <>
                        <Route
                            path="/login"
                            element={
                                <LoginPage
                                    onLogin={setUser}
                                    notice={sessionNotice}
                                />
                            }
                        />

                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to="/login"
                                    replace
                                />
                            }
                        />
                    </>
                ) : (
                    <>
                        {/* AI Assistant */}
                        <Route
                            path="/assistant"
                            element={
                                <AssistantPage />
                            }
                        />

                        {/* Automations */}
                        <Route
                            path="/automations"
                            element={<AutomationsPage />}
                        />

                        <Route
                            path="/automations/:automationId"
                            element={<AutomationDetailPage />}
                        />

                        {/* Temporary dashboard / overview */}
                        <Route
                            path="/dashboard"
                            element={
                                <Dashboard
                                    onLogout={
                                        handleLogout
                                    }
                                />
                            }
                        />

                        {/* Root */}
                        <Route
                            path="/"
                            element={
                                <Navigate
                                    to="/assistant"
                                    replace
                                />
                            }
                        />

                        {/* Unknown */}
                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to="/assistant"
                                    replace
                                />
                            }
                        />
                    </>
                )}

            </Routes>
        </BrowserRouter>
    );
}

export default App;
