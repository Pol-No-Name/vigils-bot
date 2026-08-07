const { SlashCommandBuilder } = require('discord.js');
const points = require('../hnManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription("Check your own profile or another person's profile")
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to check the profile of')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.options.getMember('user') || interaction.member;

        const pointsValue = points.getPoints(user.id);

        const embed = {
            title: `${member.displayName}'s Profile`,
            color: 0x89b9e0,
            description: 'Joined the server on ' + member.joinedAt.toDateString(),
            fields: [
                {
                    name: "HONOR",
                    value: `${pointsValue}`,
                    inline: true
                },
                {
                    name: "EVENTS",
                    value: "0",
                    inline: true
                }
            ],
            thumbnail: {
                url: user.displayAvatarURL()
            }
        };

        await interaction.reply({ embeds: [embed] });
    }
};