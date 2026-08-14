import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getAutomations } from "../api/client";
import type { Automation } from "../types/automation";

function AutomationsPage() {
    const navigate = useNavigate();
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAutomations() {
            try {
                const data = await getAutomations();

                setAutomations(data);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load automations");
                }
            } finally {
                setLoading(false);
            }
        }

        loadAutomations();
    }, []);

    if (loading) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-container">
                    <div className="loading-state">
                        Loading automations...
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard-page">
            <div className="dashboard-container">
                <nav className="app-nav"><div className="app-brand"><div className="brand-mark">A</div><span>AutoFlow</span></div><div className="app-nav-links"><Link to="/assistant" className="nav-link">AI Assistant</Link><Link to="/automations" className="nav-link active">Automations</Link><Link to="/dashboard" className="nav-link">Dashboard</Link></div></nav>
                <header className="dashboard-header">
                    <div>
                        <h1>Automations</h1>

                        <p>
                            Let AutoFlow handle repetitive work for you.
                        </p>
                    </div><Link to="/assistant" className="primary-button">+ Create automation</Link>
                </header>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {automations.length === 0 ? (
                    <div className="empty-state">
                        <h3>No automations yet</h3>

                        <p>
                            Create your first automation with natural
                            language.
                        </p>
                    </div>
                ) : (
                    <div className="workflow-grid">
                        {automations.map((automation) => (
                            <button
                                className="workflow-card"
                                key={automation.id}
                                onClick={() => navigate(`/automations/${automation.id}`)}
                            >
                                <div className="workflow-card-header">
                                    <h3>
                                        {automation.name}
                                    </h3>

                                    <span
                                        className={
                                            automation.is_active
                                                ? "status-badge active"
                                                : "status-badge inactive"
                                        }
                                    >
                                        {automation.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>

                                <p>
                                    {automation.goal}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default AutomationsPage;
