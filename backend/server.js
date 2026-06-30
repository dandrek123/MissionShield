const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "MissionShield API is running",
        project: "Cyber Defense Readiness Dashboard"
    });
});

app.get("/api/systems", (req, res) => {
    db.all("SELECT * FROM systems ORDER BY created_at DESC", [], (error, rows) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(rows);
    });
});

app.post("/api/systems", (req, res) => {
    const {
        name,
        category,
        readiness,
        cyber_risk,
        assigned_team,
        last_checked,
        notes
    } = req.body;

    const query = `
        INSERT INTO systems (
            name,
            category,
            readiness,
            cyber_risk,
            assigned_team,
            last_checked,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        query,
        [name, category, readiness, cyber_risk, assigned_team, last_checked, notes],
        function (error) {
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            res.status(201).json({
                id: this.lastID,
                message: "System added successfully"
            });
        }
    );
});

app.get("/api/incidents", (req, res) => {
    db.all("SELECT * FROM incidents ORDER BY created_at DESC", [], (error, rows) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(rows);
    });
});

app.post("/api/incidents", (req, res) => {
    const {
        title,
        description,
        severity,
        status,
        affected_system,
        reported_by,
        response_notes
    } = req.body;

    const query = `
        INSERT INTO incidents (
            title,
            description,
            severity,
            status,
            affected_system,
            reported_by,
            response_notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        query,
        [title, description, severity, status, affected_system, reported_by, response_notes],
        function (error) {
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            res.status(201).json({
                id: this.lastID,
                message: "Incident added successfully"
            });
        }
    );
});


app.get("/api/summary", (req, res) => {
    const summary = {};

    db.get("SELECT COUNT(*) AS totalSystems FROM systems", [], (systemError, systemRow) => {
        if (systemError) {
            return res.status(500).json({ error: systemError.message });
        }

        summary.totalSystems = systemRow.totalSystems;

        db.get("SELECT COUNT(*) AS readySystems FROM systems WHERE readiness = 'Ready'", [], (readyError, readyRow) => {
            if (readyError) {
                return res.status(500).json({ error: readyError.message });
            }

            summary.readySystems = readyRow.readySystems;

            db.get("SELECT COUNT(*) AS openIncidents FROM incidents WHERE status != 'Resolved'", [], (incidentError, incidentRow) => {
                if (incidentError) {
                    return res.status(500).json({ error: incidentError.message });
                }

                summary.openIncidents = incidentRow.openIncidents;

                db.get("SELECT COUNT(*) AS highRiskIncidents FROM incidents WHERE severity IN ('High', 'Critical')", [], (riskError, riskRow) => {
                    if (riskError) {
                        return res.status(500).json({ error: riskError.message });
                    }

                    summary.highRiskIncidents = riskRow.highRiskIncidents;

                    res.json(summary);
                });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`MissionShield API running on http://localhost:${PORT}`);
});