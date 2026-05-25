const { EmbedBuilder } = require('discord.js');
const db = require('./db');

const CHANNEL_ID = '1503105802972696616';

db.prepare(`
    CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
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

function getLeaderboardEmbed() {
    const topUsers = db.prepare(`
        SELECT id, points
        FROM users
        ORDER BY points DESC, id ASC
        LIMIT 10
    `).all();

    let description = '';
    const medals = ['🥇', '🥈', '🥉'];

    for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        const rank = medals[i] || `#${i + 1}`;
        description += `**${rank}** <@${user.id}> — **${user.points}** points\n`;
    }

    return new EmbedBuilder()
        .setTitle('Top Vigils Honor')
        .setColor(0x89b9e0)
        .setDescription(`*"Honor, Unity, Strength"* \n To serve the vigils means to uphold the highest standards of dedication.\n\n${description || 'No data yet.'}`)
        .setTimestamp();
}

function getMessageId() {
    const row = db.prepare(`SELECT value FROM config WHERE key = 'leaderboardMessageId'`).get();
    return row ? row.value : null;
}

function setMessageId(id) {
    db.prepare(`
        INSERT INTO config (key, value)
        VALUES ('leaderboardMessageId', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(id);
}

async function updateLeaderboard(client) {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    let messageId = getMessageId();
    let message;

    try {
        if (messageId) {
            message = await channel.messages.fetch(messageId);
        }
    } catch {
        message = null;
    }

    if (!message) {
        message = await channel.send({
            embeds: [getLeaderboardEmbed()]
        });

        setMessageId(message.id);
        return;
    }

    await message.edit({
        embeds: [getLeaderboardEmbed()]
    });
}

module.exports = {
    getLeaderboardEmbed,
    updateLeaderboard
};