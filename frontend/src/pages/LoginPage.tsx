import { useState } from "react";

import { login, getCurrentUser } from "../api/client";
import { setToken } from "../auth/token";

type LoginPageProps = {
    onLogin: (user: User) => void;
};

type User = {
    uuid: string;
    username: string;
    email: string;
    full_name: string;
    last_login: string | null;
};

function LoginPage({ onLogin }: LoginPageProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);
        setLoading(true);

        try {
            const data = await login(username, password);

            setToken(data.access_token);

            const user = await getCurrentUser();

            onLogin(user);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Login failed");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>AutoFlow Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">
                        Username
                    </label>

                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                    />
                </div>

                <div>
                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {error && <p>{error}</p>}
        </div>
    );
}

export default LoginPage;