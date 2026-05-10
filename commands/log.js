const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, } = require('discord.js');
const sheetdbapi = process.env.SHEETDB_API;
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Logs a report to the spreadsheet')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to report')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the report')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),


     async execute(interaction) {
        const user = interaction.options.getUser('user');
        const username = user.username;
        const userId = user.id;
        const reason = interaction.options.getString('reason');
        const timestamp = new Date().toLocaleString('en-UK', { timeZone: 'UTC', hour12: false });

        try {
            await axios.post(sheetdbapi, {
                data: {
                    USER: username,
                    USERID: userId,
                    REASON: reason,
                    TIMESTAMP: timestamp + ' UTC'
                }
            });
            embed = new EmbedBuilder()
                .setTitle('Report Logged')
                .setColor(0xeb4034)
                .setDescription(`Report for <@${userId}> has been logged successfully.`)
                .addFields(
                    { name: 'User', value: `<@${userId}>`, inline: true },
                    { name: 'Reason', value: reason, inline: true }
            )
            .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error logging to SheetDB:', error);
            return interaction.reply({ content: 'Failed to log the report. Please try again later.', ephemeral: true });
        }
     }
}