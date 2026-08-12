import { useEffect, useState } from "react";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

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
        <Dashboard
            onLogout={() => {
                removeToken();
                setUser(null);
            }}
        />
    );
}

export default App;