const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./missionshield.db", (error) => {
    if (error) {
        console.error("Database connection error:", error.message);
    } else {
        console.log("Connected to MissionShield SQLite database.");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS systems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            readiness TEXT NOT NULL,
            cyber_risk TEXT NOT NULL,
            assigned_team TEXT,
            last_checked TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            severity TEXT NOT NULL,
            status TEXT NOT NULL,
            affected_system TEXT,
            reported_by TEXT,
            response_notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;