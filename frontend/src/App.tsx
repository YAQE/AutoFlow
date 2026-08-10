import { useEffect, useState } from "react";

import LoginPage from "./pages/LoginPage";
import { getCurrentUser } from "./api/client";
import { getToken } from "./auth/token";

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
                localStorage.removeItem("autoflow_access_token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <LoginPage onLogin={setUser} />;
    }

    return (
        <div>
            <h1>Welcome to AutoFlow</h1>
    
            <p>Welcome, {user.full_name}</p>
    
            <p>Username: {user.username}</p>
    
            <p>Email: {user.email}</p>
    
            <button
                onClick={() => {
                    localStorage.removeItem("autoflow_access_token");
                    setUser(null);
                }}
            >
                Logout
            </button>
        </div>
    );
}

export default App;