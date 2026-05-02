const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const points = require('../hnManager');
const { updateLeaderboard } = require('../leaderboardManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give honor to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to give honour to')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Honour')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            return interaction.editReply('Amount must be greater than 0.');
        }

        points.addPoints(user.id, amount);

        updateLeaderboard(interaction.client).catch(console.error);

        const embed = new EmbedBuilder()
            .setTitle('Honor Given')
            .setDescription(`Added **${amount}** honor to <@${user.id}>`)
            .setColor(0x89b9e0)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};