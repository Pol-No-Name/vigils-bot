const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

const honorPoints = require('../hnManager');
const eventPoints = require('../epManager');

const { updateLeaderboard } = require('../leaderboardManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give points to a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to give points to')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount of points')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('The points type to give')
                .setRequired(true)
                .addChoices(
                    { name: 'Honor', value: 'Honor' },
                    { name: 'Event', value: 'Event' },
                )
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const type = interaction.options.getString('type');

        if (amount <= 0) {
            return interaction.editReply('Amount must be greater than 0.');
        }

        if (type === 'Honor') {
            honorPoints.addPoints(user.id, amount);
        }

        if (type === 'Event') {
            eventPoints.addPoints(user.id, amount);
        }

        if (type === 'Honor') {
            updateLeaderboard(interaction.client).catch(console.error);
        }

        const embed = new EmbedBuilder()
            .setTitle(`${type} Given`)
            .setDescription(
                `Added **${amount}** ${type.toLowerCase()} points to <@${user.id}>`
            )
            .setColor(type === 'Honor' ? 0x89b9e0 : 0xffd166)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};