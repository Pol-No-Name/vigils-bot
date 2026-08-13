const { SlashCommandBuilder } = require('discord.js');
const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require('discord.js');

let backupResponses = 0;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription('Request backup')
        .addStringOption(option =>
            option.setName('server')
                .setDescription('The server you are requesting backup for')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('location')
                .setDescription('The location where backup is needed')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('enemies')
                .setDescription('The guild name(s) of the enemies')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(0),

    getBackupResponses: () => backupResponses,
    addBackupResponse: () => {
        backupResponses++;
        return backupResponses;
    },  

    async execute(interaction) {   

        const server = interaction.options.getString('server');
        const location = interaction.options.getString('location');
        const enemies = interaction.options.getString('enemies');
        const member = interaction.options.getMember('user') || interaction.member;

        const embed = {
            color: 0xFF0000,
            title: `${member.displayName} has requested backup!`,
            description: `The backup has been requested at the location **${location}**.`,
            fields: [
                {
                    name: 'Server',
                    value: server,
                    inline: true,
                },
                {
                    name: 'Location',
                    value: location,
                    inline: true,
                },
                {
                    name: 'Enemies',
                    value: enemies,
                    inline: true,
                },
                {
                    name: 'Backup Responders',
                    value: '',
                }
            ]
        };

        const button = new ButtonBuilder()
            .setCustomId('acknowledge_backup')
            .setLabel('Provide Reinforcement')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(button);

        await interaction.reply({
            content: '<@&1405290375773556957>',
            allowedMentions: {
                roles: ['1405290375773556957']
            },

            embeds: [embed],
            components: [row]
            });
    }
};