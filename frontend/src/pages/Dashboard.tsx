import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
                    Loading...
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard-page">
            <div className="dashboard-container">

                {/* NAVIGATION */}
                <nav className="app-nav">

                    <div className="app-brand">
                        <div className="brand-mark">
                            A
                        </div>

                        <span>
                            AutoFlow
                        </span>
                    </div>

                    <div className="app-nav-links">

                        <Link
                            to="/"
                            className="nav-link active"
                        >
                            AI Assistant
                        </Link>

                        <Link
                            to="/automations"
                            className="nav-link"
                        >
                            Automations
                        </Link>

                    </div>

                    <button
                        className="secondary-button"
                        onClick={onLogout}
                    >
                        Logout
                    </button>

                </nav>


                {/* PAGE HEADER */}
                <header className="dashboard-header">
                    <div>
                        <p className="eyebrow">
                            AI WORKSPACE
                        </p>

                        <h1>
                            Welcome back
                        </h1>

                        <p>
                            Build, explore and manage
                            your AI-powered workflows.
                        </p>
                    </div>
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
                                Your existing
                                automation workflows.
                            </p>
                        </div>

                        <span className="workflow-count">
                            {workflows.length}
                        </span>

                    </div>


                    {workflows.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-state-icon">
                                +
                            </div>

                            <h3>
                                No workflows yet
                            </h3>

                            <p>
                                Create your first
                                workflow to get started.
                            </p>

                        </div>

                    ) : (

                        <div className="workflow-grid">

                            {workflows.map(
                                (workflow) => (

                                    <div
                                        className="workflow-card"
                                        key={workflow.id}
                                    >

                                        <div className="workflow-card-header">

                                            <div>
                                                <h3>
                                                    {
                                                        workflow.title
                                                    }
                                                </h3>

                                                {workflow.description && (
                                                    <p>
                                                        {
                                                            workflow.description
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <span
                                                className={`status-badge ${workflow.status}`}
                                            >
                                                {
                                                    workflow.status
                                                }
                                            </span>

                                        </div>

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