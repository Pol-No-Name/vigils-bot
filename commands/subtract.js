const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const points = require('../hnManager');
const { updateLeaderboard } = require('../leaderboardManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove honour from a user (admin only)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to remove honour from')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('The amount of honour to remove')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    
    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        if (amount <= 0) {
            return interaction.editReply('Amount must be greater than 0.');
        }

        points.subtractPoints(user.id, amount);

        updateLeaderboard(interaction.client).catch(console.error);

        const embed = new EmbedBuilder()
            .setTitle('Honour Removed')
            .setDescription(`Removed **${amount}** honour from <@${user.id}>`)
            .setColor(0x89b9e0)
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
