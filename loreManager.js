const db = require('./loreDb');

// Get user
function getUser(id) {
    let user = db.prepare('SELECT * FROM lore_users WHERE id = ?').get(id);

    if (!user) {
        db.prepare('INSERT INTO lore_users (id, lore) VALUES (?, ?)').run(id, '');
        user = { id, lore: '' };
    }

    return user;
}

// Add lore
function addLore(id, loreText) {
    getUser(id);

    db.prepare('UPDATE lore_users SET lore = ? WHERE id = ?').run(loreText, id);

    return { id, lore: loreText };
}

// Get lore
function getLore(id) {
    const user = getUser(id);
    return user.lore || '';
}

module.exports = { getUser, addLore, getLore };