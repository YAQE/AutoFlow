import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAutomation } from "../api/client";
import type { Automation } from "../types/automation";

function valueList(configuration: Record<string, unknown>) {
    const entries = Object.entries(configuration);
    return entries.length ? entries.map(([key, value]) => `${key}: ${String(value)}`).join(" · ") : "No additional configuration";
}

function AutomationDetailPage() {
    const { automationId } = useParams();
    const [automation, setAutomation] = useState<Automation | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!automationId) return;
        getAutomation(Number(automationId)).then(setAutomation).catch((reason) => setError(reason instanceof Error ? reason.message : "Failed to load automation"));
    }, [automationId]);

    if (error) return <main className="dashboard-page"><div className="dashboard-container"><div className="error-message">{error}</div><Link to="/automations" className="secondary-button">Back to automations</Link></div></main>;
    if (!automation) return <main className="dashboard-page"><div className="dashboard-container"><div className="loading-state">Loading automation...</div></div></main>;

    return <main className="dashboard-page"><div className="dashboard-container">
        <nav className="app-nav"><div className="app-brand"><div className="brand-mark">A</div><span>AutoFlow</span></div><div className="app-nav-links"><Link to="/assistant" className="nav-link">AI Assistant</Link><Link to="/automations" className="nav-link active">Automations</Link><Link to="/dashboard" className="nav-link">Dashboard</Link></div></nav>
        <Link to="/automations" className="back-link">← All automations</Link>
        <header className="dashboard-header"><div><p className="eyebrow">AUTOMATION</p><h1>{automation.name}</h1><p>{automation.goal}</p></div><div className="detail-actions"><span className={automation.is_active ? "status-badge active" : "status-badge inactive"}>{automation.is_active ? "Active" : "Inactive"}</span><button className="secondary-button" type="button" disabled title="Execution is not part of the MVP yet">Run now</button><button className="secondary-button" type="button" disabled title="Editing is coming after the MVP">Edit</button><button className="secondary-button" type="button" disabled title="Disabling is coming after the MVP">Disable</button></div></header>
        <section className="detail-grid"><article className="detail-card"><p className="eyebrow">TRIGGER</p><h2>{automation.trigger.type.replaceAll("_", " ")}</h2><p>{valueList(automation.trigger.configuration)}</p></article><article className="detail-card"><p className="eyebrow">STATUS</p><h2>{automation.is_active ? "Ready" : "Disabled"}</h2><p>Execution will be connected in the next product phase.</p></article></section>
        <section><div className="section-heading"><div><h2>Workflow</h2><p>Technical steps generated from your automation plan.</p></div></div><div className="workflow-steps">{automation.actions.map((action, index) => <div className="workflow-step" key={`${action.type}-${index}`}><span>{index + 1}</span><div><strong>{action.type.replaceAll("_", " ")}</strong><p>{valueList(action.configuration)}</p></div></div>)}</div></section>
        <section className="runs-placeholder"><div className="section-heading"><div><h2>Recent runs</h2><p>No executions yet. Run history will appear here when execution is enabled.</p></div></div></section>
    </div></main>;
}

export default AutomationDetailPage;
