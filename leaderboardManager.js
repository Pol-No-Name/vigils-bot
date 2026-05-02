const { EmbedBuilder } = require('discord.js');
const db = require('./db');

// ⚙️ CHANGE THIS
const CHANNEL_ID = '1497762062464581642';

// Create table for config if it doesn't exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
    )
`).run();

// 🔹 Build embed
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

// 🔹 Get stored message ID
function getMessageId() {
    const row = db.prepare(`SELECT value FROM config WHERE key = 'leaderboardMessageId'`).get();
    return row ? row.value : null;
}

// 🔹 Save message ID
function setMessageId(id) {
    db.prepare(`
        INSERT INTO config (key, value)
        VALUES ('leaderboardMessageId', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(id);
}

// 🔹 Main updater
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

    // If message doesn't exist, create a new one
    if (!message) {
        message = await channel.send({
            embeds: [getLeaderboardEmbed()]
        });

        setMessageId(message.id);
        return;
    }

    // Otherwise update existing message
    await message.edit({
        embeds: [getLeaderboardEmbed()]
    });
}

module.exports = {
    getLeaderboardEmbed,
    updateLeaderboard
};