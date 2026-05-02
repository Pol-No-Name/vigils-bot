const Database = require('better-sqlite3');
const db = new Database('points.db');

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        points INTEGER DEFAULT 0
    )
`).run();

module.exports = db;