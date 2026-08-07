const { SlashCommandBuilder } = require('discord.js');
const points = require('../hnManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription("Check your own profile or another person's profile")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check the profile of')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const pointsValue = points.getPoints(user.id);

        const embed = {
            title: `${user.nickname || user.username}'s Profile`,
            description: `**${pointsValue}** honor points\n`,
            color: 0x89b9e0
        };

        await interaction.reply({ embeds: [embed] });
    }
};