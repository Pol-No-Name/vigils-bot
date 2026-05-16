const Database = require('better-sqlite3');

const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? `${process.env.RAILWAY_VOLUME_MOUNT_PATH}/points.db`
    : './points.db';

const db = new Database(dbPath);

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        points INTEGER DEFAULT 0
    )
`).run();

module.exports = db;