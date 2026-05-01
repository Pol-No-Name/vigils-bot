const Database = require('better-sqlite3');

const loreDb = new Database('./lore.sqlite');

// Create lore table (only what you need)
loreDb.prepare(`
    CREATE TABLE IF NOT EXISTS lore_users (
        id TEXT PRIMARY KEY,
        lore TEXT DEFAULT ''
    )
`).run();

module.exports = loreDb;