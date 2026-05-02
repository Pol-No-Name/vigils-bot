const db = require('./db');

function getUser(id) {
    let user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

    if (!user) {
        db.prepare('INSERT INTO users (id, points) VALUES (?, 0)').run(id);
        user = { id, points: 0 };
    }

    return user;
}

function addPoints(id, amount) {
    getUser(id);

    db.prepare(`
        UPDATE users
        SET points = points + ?
        WHERE id = ?
    `).run(amount, id);
}

function getPoints(id) {
    return getUser(id).points;
}

function resetAllPoints() {
    db.prepare('UPDATE users SET points = 0').run();
}

function subtractPoints(id, amount) {
    getUser(id);

    db.prepare(`
        UPDATE users
        SET points = MAX(points - ?, 0)
        WHERE id = ?
    `).run(amount, id);
}


module.exports = { getUser, addPoints, getPoints, resetAllPoints, subtractPoints };