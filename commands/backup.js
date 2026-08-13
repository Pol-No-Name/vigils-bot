const { SlashCommandBuilder } = require('discord.js');
const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription('Request backup')
        .addStringOption(option =>
            option.setName('location')
                .setDescription('The luminant and server you require backup at')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('info')
                .setDescription('Any additional information for the backup request')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(0),

    async execute(interaction) {
        const location = interaction.options.getString('location');
        const info = interaction.options.getString('info') || 'N/A';
        const member = interaction.options.getMember('user') || interaction.member;

        const embed = {
            color: 0xFF0000,
            title: `${member.user.username} has requested backup!`,
            description: `The backup has been requested at the location **${location}**.`,
            fields: [
                {
                    name: info !== 'N/A' ? 'Additional Information:' : '\u200B',
                    value: info !== 'N/A' ? info : '\u200B',
                }
            ]
        };

        const button = new ButtonBuilder()
            .setCustomId('acknowledge_backup')
            .setLabel('Respond to Backup')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        await interaction.reply({
            content: '<@1405290375773556957>',
            embeds: [embed],
            components: [row]
            });
    }
};