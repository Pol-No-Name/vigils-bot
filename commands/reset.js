const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const points = require('../hnManager');
const { updateLeaderboard } = require('../leaderboardManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset the honour of all users to 0')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {
        await interaction.deferReply();

        if (!interaction.inGuild()) {
            return interaction.editReply('This command can only be used in a server.');
        }

        try {
            const member = await interaction.guild.members.fetch(interaction.user.id);

            if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.editReply('You do not have permission to use this command.');
            }

            points.resetAllPoints();

            await updateLeaderboard(interaction.client).catch(console.error);

            const embed = new EmbedBuilder()
                .setTitle('Honour Reset')
                .setDescription('All honour points have been reset to 0.')
                .setColor(0x89b9e0)
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error('Reset command error:', err);
            return interaction.editReply('Something went wrong while resetting honour.');
        }
    }
};