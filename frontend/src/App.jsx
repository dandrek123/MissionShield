import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5002";

const emptySystemForm = {
    name: "",
    category: "Mission System",
    readiness: "Ready",
    cyber_risk: "Low",
    assigned_team: "",
    last_checked: "",
    notes: "",
};

function App() {
    const [summary, setSummary] = useState({
        totalSystems: 0,
        readySystems: 0,
        openIncidents: 0,
        highRiskIncidents: 0,
    });

    const [systems, setSystems] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [systemForm, setSystemForm] = useState(emptySystemForm);
    const [systemMessage, setSystemMessage] = useState("");

    async function loadDashboardData() {
        try {
            const [summaryResponse, systemsResponse, incidentsResponse] = await Promise.all([
                fetch(`${API_URL}/api/summary`),
                fetch(`${API_URL}/api/systems`),
                fetch(`${API_URL}/api/incidents`),
            ]);

            const summaryData = await summaryResponse.json();
            const systemsData = await systemsResponse.json();
            const incidentsData = await incidentsResponse.json();

            setSummary(summaryData);
            setSystems(systemsData);
            setIncidents(incidentsData);
        } catch (error) {
            console.error("Dashboard data loading error:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboardData();
    }, []);

    function handleSystemChange(event) {
        const { name, value } = event.target;

        setSystemForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleSystemSubmit(event) {
        event.preventDefault();
        setSystemMessage("");

        if (!systemForm.name.trim()) {
            setSystemMessage("System name is required.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/systems`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(systemForm),
            });

            if (!response.ok) {
                throw new Error("Unable to add system.");
            }

            setSystemForm(emptySystemForm);
            setSystemMessage("Mission system added successfully.");
            await loadDashboardData();
        } catch (error) {
            console.error("System creation error:", error);
            setSystemMessage("Unable to add system. Check the backend server and try again.");
        }
    }

    return (
        <main className="app-shell">
            <section className="hero-section">
                <p className="eyebrow">Cyber Defense Readiness Dashboard</p>
                <h1>MissionShield</h1>
                <p className="hero-text">
                    Track mission systems, cyber incidents, readiness levels, and response actions from one defensive operations dashboard.
                </p>
            </section>

            <section className="summary-grid">
                <div className="summary-card">
                    <span>Total Systems</span>
                    <strong>{summary.totalSystems}</strong>
                </div>

                <div className="summary-card">
                    <span>Ready Systems</span>
                    <strong>{summary.readySystems}</strong>
                </div>

                <div className="summary-card">
                    <span>Open Incidents</span>
                    <strong>{summary.openIncidents}</strong>
                </div>

                <div className="summary-card alert-card">
                    <span>High/Critical Incidents</span>
                    <strong>{summary.highRiskIncidents}</strong>
                </div>
            </section>

            <section className="panel form-panel">
                <div className="panel-header">
                    <h2>Add Mission System</h2>
                    <span>Readiness tracking</span>
                </div>

                <form className="system-form" onSubmit={handleSystemSubmit}>
                    <div className="form-grid">
                        <label>
                            System Name
                            <input
                                type="text"
                                name="name"
                                placeholder="Field Network Gateway"
                                value={systemForm.name}
                                onChange={handleSystemChange}
                            />
                        </label>

                        <label>
                            Category
                            <input
                                type="text"
                                name="category"
                                placeholder="Mission System"
                                value={systemForm.category}
                                onChange={handleSystemChange}
                            />
                        </label>

                        <label>
                            Readiness
                            <select name="readiness" value={systemForm.readiness} onChange={handleSystemChange}>
                                <option>Ready</option>
                                <option>Limited</option>
                                <option>Down</option>
                            </select>
                        </label>

                        <label>
                            Cyber Risk
                            <select name="cyber_risk" value={systemForm.cyber_risk} onChange={handleSystemChange}>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </label>

                        <label>
                            Assigned Team
                            <input
                                type="text"
                                name="assigned_team"
                                placeholder="Cyber Defense Team"
                                value={systemForm.assigned_team}
                                onChange={handleSystemChange}
                            />
                        </label>

                        <label>
                            Last Checked
                            <input
                                type="date"
                                name="last_checked"
                                value={systemForm.last_checked}
                                onChange={handleSystemChange}
                            />
                        </label>
                    </div>

                    <label>
                        Notes
                        <textarea
                            name="notes"
                            placeholder="Add readiness notes, known issues, or operational context."
                            value={systemForm.notes}
                            onChange={handleSystemChange}
                        />
                    </label>

                    <div className="form-actions">
                        <button type="submit">Add System</button>
                        {systemMessage && <span>{systemMessage}</span>}
                    </div>
                </form>
            </section>

            {loading ? (
                <p className="loading">Loading MissionShield data...</p>
            ) : (
                <section className="dashboard-grid">
                    <div className="panel">
                        <div className="panel-header">
                            <h2>Mission Systems</h2>
                            <span>{systems.length} tracked</span>
                        </div>

                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Readiness</th>
                                        <th>Cyber Risk</th>
                                        <th>Team</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {systems.map((system) => (
                                        <tr key={system.id}>
                                            <td>
                                                <strong>{system.name}</strong>
                                                <small>{system.category}</small>
                                            </td>
                                            <td>
                                                <span className={`badge readiness-${system.readiness.toLowerCase()}`}>
                                                    {system.readiness}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge risk-${system.cyber_risk.toLowerCase()}`}>
                                                    {system.cyber_risk}
                                                </span>
                                            </td>
                                            <td>{system.assigned_team || "Unassigned"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header">
                            <h2>Cyber Incidents</h2>
                            <span>{incidents.length} logged</span>
                        </div>

                        <div className="incident-list">
                            {incidents.map((incident) => (
                                <article className="incident-card" key={incident.id}>
                                    <div>
                                        <h3>{incident.title}</h3>
                                        <p>{incident.description}</p>
                                    </div>

                                    <div className="incident-meta">
                                        <span className={`badge risk-${incident.severity.toLowerCase()}`}>
                                            {incident.severity}
                                        </span>
                                        <span className="badge status-badge">{incident.status}</span>
                                    </div>

                                    <small>Affected system: {incident.affected_system || "Unknown"}</small>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}

export default App;
