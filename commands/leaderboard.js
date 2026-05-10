const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows top users by honor points'),

    async execute(interaction) {
        await interaction.deferReply();

        const topUsers = db.prepare(`
            SELECT id, points
            FROM users
            ORDER BY points DESC, id ASC
            LIMIT 10
        `).all();

        if (topUsers.length === 0) {
            return interaction.editReply('No data yet.');
        }

        let description = '';
        const medals = ['🥇', '🥈', '🥉'];

        for (let i = 0; i < topUsers.length; i++) {
            const user = topUsers[i];
            const rankDisplay = medals[i] || `#${i + 1}`;

            description += `**${rankDisplay}** | <@${user.id}> — ( ${user.points} ) points\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle('Honor Leaderboard\n\n')
            .setColor(0xffd700)
            .setDescription(`${description}`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};