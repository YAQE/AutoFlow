import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAutomations } from "../api/client";
import type { Automation } from "../types/automation";

type DashboardProps = { onLogout: () => void };

function Dashboard({ onLogout }: DashboardProps) {
    const [automations, setAutomations] = useState<Automation[]>([]);
    useEffect(() => { getAutomations().then(setAutomations).catch(() => setAutomations([])); }, []);
    const active = automations.filter((automation) => automation.is_active).length;
    return <main className="dashboard-page"><div className="dashboard-container">
        <nav className="app-nav"><div className="app-brand"><div className="brand-mark">A</div><span>AutoFlow</span></div><div className="app-nav-links"><Link to="/assistant" className="nav-link">AI Assistant</Link><Link to="/automations" className="nav-link">Automations</Link><Link to="/dashboard" className="nav-link active">Dashboard</Link></div><button className="secondary-button" onClick={onLogout}>Logout</button></nav>
        <header className="dashboard-header"><div><p className="eyebrow">OVERVIEW</p><h1>Welcome back</h1><p>Automation activity at a glance.</p></div><Link to="/assistant" className="primary-button">Create automation</Link></header>
        <section className="metrics-grid"><div className="metric-card"><span>Active automations</span><strong>{active}</strong></div><div className="metric-card"><span>Total automations</span><strong>{automations.length}</strong></div><div className="metric-card"><span>Runs today</span><strong>—</strong></div><div className="metric-card"><span>Failed runs</span><strong>—</strong></div></section>
        <section><div className="section-heading"><div><h2>Recent automations</h2><p>Your latest saved automation plans.</p></div><Link to="/automations" className="secondary-button">View all</Link></div>{automations.length ? <div className="workflow-grid">{automations.slice(0, 4).map((automation) => <Link to={`/automations/${automation.id}`} className="workflow-card" key={automation.id}><div className="workflow-card-header"><h3>{automation.name}</h3><span className={automation.is_active ? "status-badge active" : "status-badge inactive"}>{automation.is_active ? "Active" : "Inactive"}</span></div><p>{automation.goal}</p></Link>)}</div> : <div className="empty-state"><h3>No automations yet</h3><p>Describe a recurring task to the AI assistant to create your first one.</p></div>}</section>
    </div></main>;
}

export default Dashboard;
