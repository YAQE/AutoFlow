import { useEffect, useState } from "react";

import { getAutomations } from "../api/client";
import type { Automation } from "../types/automation";

type AutomationsPageProps = {
    onOpenAutomation: (automationId: number) => void;
};

function AutomationsPage({
    onOpenAutomation,
}: AutomationsPageProps) {
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
                <header className="dashboard-header">
                    <div>
                        <h1>Automations</h1>

                        <p>
                            Let AutoFlow handle repetitive work for you.
                        </p>
                    </div>
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
                                onClick={() =>
                                    onOpenAutomation(automation.id)
                                }
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