const Database = require('better-sqlite3');
const db = new Database('points.db');

// Create table if it doesn't exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        points INTEGER DEFAULT 0
    )
`).run();

module.exports = db;