const { SlashCommandBuilder } = require('discord.js');
const points = require('../hnManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check')
        .setDescription("Check your or someone else's honor points")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check honor points for')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const pointsValue = points.getPoints(user.id);

        const embed = {
            title: `${user.username}'s Honor Points`,
            description: `**${pointsValue}** honor points\n`,
            color: 0x89b9e0
        };

        await interaction.reply({ embeds: [embed] });
    }
};