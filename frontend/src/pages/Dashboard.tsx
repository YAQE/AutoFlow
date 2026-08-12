import { useEffect, useState } from "react";

import { getWorkflows } from "../api/client";
import type { Workflow } from "../types/workflow";

import CreateWorkflow from "./CreateWorkflow";

type DashboardProps = {
    onLogout: () => void;
};

function Dashboard({
    onLogout,
}: DashboardProps) {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] =
        useState<string | null>(null);

    async function loadWorkflows() {
        try {
            setError(null);

            const data = await getWorkflows();

            setWorkflows(data);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to load workflows",
                );
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadWorkflows();
    }, []);

    if (loading) {
        return (
            <main className="dashboard-page">
                <div className="loading-state">
                    Loading workflows...
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard-page">
            <div className="dashboard-container">

                {/* HEADER */}
                <header className="dashboard-header">
                    <div>
                        <h1>AutoFlow</h1>

                        <p>
                            Build and run your
                            AI workflows.
                        </p>
                    </div>

                    <button
                        className="secondary-button"
                        onClick={onLogout}
                    >
                        Logout
                    </button>
                </header>


                {/* ERROR */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                {/* CREATE WORKFLOW */}
                <section className="create-section">
                    <CreateWorkflow
                        onCreated={loadWorkflows}
                    />
                </section>


                {/* WORKFLOWS */}
                <section>
                    <div className="section-heading">

                        <div>
                            <h2>
                                My Workflows
                            </h2>

                            <p>
                                Manage your
                                AI-powered workflows.
                            </p>
                        </div>

                        <span className="workflow-count">
                            {workflows.length}
                        </span>

                    </div>


                    {/* EMPTY STATE */}
                    {workflows.length === 0 ? (
                        <div className="empty-state">

                            <h3>
                                No workflows yet
                            </h3>

                            <p>
                                Create your first
                                workflow to get started.
                            </p>

                        </div>
                    ) : (

                        /* WORKFLOW CARDS */
                        <div className="workflow-grid">

                            {workflows.map(
                                (workflow) => (
                                    <div
                                        className="workflow-card"
                                        key={workflow.id}
                                    >

                                        <div className="workflow-card-header">

                                            <h3>
                                                {
                                                    workflow.title
                                                }
                                            </h3>

                                            <span
                                                className={`status-badge ${workflow.status}`}
                                            >
                                                {
                                                    workflow.status
                                                }
                                            </span>

                                        </div>


                                        {workflow.description && (
                                            <p>
                                                {
                                                    workflow.description
                                                }
                                            </p>
                                        )}

                                    </div>
                                ),
                            )}

                        </div>
                    )}

                </section>

            </div>
        </main>
    );
}

export default Dashboard;