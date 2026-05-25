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

function allScores() {
    return db.prepare(`
        SELECT id, points
        FROM users
        ORDER BY points DESC, id ASC
    `).all();

}

console.log(allScores());

module.exports = db;