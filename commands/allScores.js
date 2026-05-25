const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const db = require('../db');
const allScores = db.allScores;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('allscores')
        .setDescription('Get all scores from the database')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    
    async execute(interaction) {
        const scores = allScores();

        await interaction.reply('All Scores:\n' + scores.map(s => `<@${s.id}>: ${s.points} points`).join('\n'));
    }
}