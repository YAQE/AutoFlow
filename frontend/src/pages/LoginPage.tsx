import { useState } from "react";

import {
    getCurrentUser,
    login,
} from "../api/client";

import { setToken } from "../auth/token";

type User = {
    uuid: string;
    username: string;
    email: string;
    full_name: string;
    last_login: string | null;
};

type LoginPageProps = {
    onLogin: (user: User) => void;
};

function LoginPage({
    onLogin,
}: LoginPageProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] =
        useState<string | null>(null);

    const [loading, setLoading] =
        useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);
        setLoading(true);

        try {
            const data = await login(
                username,
                password,
            );

            setToken(data.access_token);

            const user =
                await getCurrentUser();

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
        <main className="auth-page">
            <div className="auth-card">

                <div className="brand">
                    <div className="brand-mark">
                        A
                    </div>

                    <div>
                        <h1>
                            AutoFlow
                        </h1>

                        <p>
                            AI-powered workflows
                        </p>
                    </div>
                </div>

                <div className="auth-heading">
                    <h2>
                        Welcome back
                    </h2>

                    <p>
                        Sign in to continue
                        to your workflows.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label
                            htmlFor="username"
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(
                                    event.target.value,
                                )
                            }
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label
                            htmlFor="password"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value,
                                )
                            }
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        className="primary-button full-width"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in"}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default LoginPage;