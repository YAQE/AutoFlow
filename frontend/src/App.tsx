import { useEffect, useState } from "react";

import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AutomationsPage from "./pages/AutomationsPage";
import AssistantPage from "./pages/AssistantPage";

import { getCurrentUser } from "./api/client";
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

    function handleLogout() {
        removeToken();
        setUser(null);
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

    if (!user) {
        return (
            <LoginPage
                onLogin={setUser}
            />
        );
    }

    return (
        <BrowserRouter>
            <Routes>

                {/* Ana sayfa */}
                <Route
                    path="/"
                    element={
                        <Dashboard
                            onLogout={handleLogout}
                        />
                    }
                />

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
                    element={
                        <AutomationsPage
                            onOpenAutomation={(automationId) => {
                                console.log(
                                    "Open automation:",
                                    automationId,
                                );
                            }}
                        />
                    }
                />

                {/* Bilinmeyen route */}
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/assistant"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;