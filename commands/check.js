const { SlashCommandBuilder } = require('discord.js');
const points = require('../hnManager');
const eventPoints = require('../epManager');
const loreManager = require('../loreManager');

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
        const loreText = loreManager.getLore(user.id);

        const pointsValue = points.getPoints(user.id);

        const embed = {
            title: `${member.displayName}'s Profile`,
            color: 0x89b9e0,
            description: 'Joined ' + member.joinedAt.toDateString(),
            fields: [
                {
                    name: "Honor:",
                    value: `${pointsValue}`,
                    inline: true
                },
                {
                    name: "Event Points:",
                    value: `${eventPoints.getPoints(user.id)}`,
                    inline: true
                },
                {
                    name: "Region:",
                    value: member.roles.cache.some(role => role.name === 'NA division') 
                        ? 'NA' 
                        : member.roles.cache.some(role => role.name === 'EU division') 
                            ? 'EU' 
                            : 'Unknown',
                    inline: false
                },
                {
                    name: "Rank:",
                    value: member.roles.cache.some(role => role.name === 'Vigil Initiate') 
                        ? 'Vigil Initiate'
                        : member.roles.cache.some(role => role.name === 'Vigil Swordsman')
                            ? 'Vigil Swordsman'
                            : member.roles.cache.some(role => role.name === 'Advanced Vigil Swordsman')
                                ? 'Adv. Vigil Swordsman'
                                : member.roles.cache.some(role => role.name === 'Vigil Captain')
                                    ? 'Vigil Captain'
                                    : member.roles.cache.some(role => role.name === 'Blade Instructor')
                                        ? 'Blade Instructor'
                                        : member.roles.cache.some(role => role.name === 'Vigil Blademaster')
                                            ? 'Vigil Blademaster'
                                            : member.roles.cache.some(role => role.name === 'Vigil Sentinel')
                                                ? 'Vigil Sentinel'
                                                : member.roles.cache.some(role => role.name === 'Maestro Evengarde Rest')
                                                    ? 'Maestro'
                                                    : 'Unknown',
                    inline: true
                },
                {
                    name: "-----Lore-----",
                    value: loreText || "No lore available for this user.",
                    inline: false
                }
            ],
            thumbnail: {
                url: member.displayAvatarURL()
            }
        };

        await interaction.reply({ embeds: [embed] });
    }
};