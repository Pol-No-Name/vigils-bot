const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { allScores } = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('allscores')
        .setDescription('Get all scores from the database')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {

        const scores = await allScores();

        await interaction.reply(
            'All Scores:\n' +
            scores.map(s => `<@${s.id}>: ${s.points} points`).join('\n')
        );
    }
};