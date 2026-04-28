const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const points = require('../hnManager');
const { updateLeaderboard } = require('../leaderboardManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset the honour of all users (admin only)'),

    async execute(interaction) {
        await interaction.deferReply();

        // Ensure it's used in a server
        if (!interaction.inGuild()) {
            return interaction.editReply('This command can only be used in a server.');
        }

        try {
            // Force fetch full member object (prevents undefined/partial issues)
            const member = await interaction.guild.members.fetch(interaction.user.id);

            // Permission check
            if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.editReply('You do not have permission to use this command.');
            }

            // Reset points
            points.resetAllPoints();

            // Update leaderboard
            await updateLeaderboard(interaction.client).catch(console.error);

            const embed = new EmbedBuilder()
                .setTitle('Honour Reset')
                .setDescription('All honour points have been reset to 0.')
                .setColor(0xff0000)
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error('Reset command error:', err);
            return interaction.editReply('Something went wrong while resetting honour.');
        }
    }
};