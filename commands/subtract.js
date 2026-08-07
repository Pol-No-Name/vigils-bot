const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

const honorPoints = require('../hnManager');
const eventPoints = require('../epManager');

const { updateLeaderboard } = require('../leaderboardManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove points from a user (admin only)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to remove points from')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('The amount of points to remove')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('The points type to remove')
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
            honorPoints.subtractPoints(user.id, amount);
        }

        if (type === 'Event') {
            eventPoints.subtractPoints(user.id, amount);
        }

        if (type === 'Honor') {
            updateLeaderboard(interaction.client).catch(console.error);
        }

        const embed = new EmbedBuilder()
            .setTitle(`${type} Removed`)
            .setDescription(
                `Removed **${amount}** ${type.toLowerCase()} points from <@${user.id}>`
            )
            .setColor(type === 'Honor' ? 0x89b9e0 : 0xffd166)
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};