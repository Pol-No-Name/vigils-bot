const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const descriptions = [
    'So you require assistance? Here you go.',
    'I assume, I am here to help after all.',
    'Heres a list of commands, I hope it helps.'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows a list of information about the bot'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Vigil Isaac, The smartest vigil.')
            .setDescription(descriptions[Math.floor(Math.random() * descriptions.length)])
            .addFields(
                { name: '/check <user>', value: 'Check your or someone else\'s honor points.' },
                { name: '/leaderboard', value: 'Shows top users by honor points.' },
                { name: '/ping', value: 'Replies with pong.' },
                { value: '**---- Admin Commands ----**', name: '\u200B' },
                { name: '/reset', value: 'Reset all honor points to 0' },
                { name: '/subtract <user> <amount>', value: 'Remove honor points from a user.' },
                { name: '/give <user> <amount>', value: 'Give honor points to a user.' },
                { value: '**---- Honor Info ----**', name: '\u200B' },
                { name: 'How do I earn honor?', value: 'Honor is earned by doing tasks for the guild. Check PLACEHOLDER for more information.'},
                { name: 'What can I do with honor?', value: 'Honor can be used to buy items from the guild shop. Check PLACEHOLDER for more information.'}
            )
            .setColor(0x89b9e0);
        await interaction.reply({ embeds: [embed] }); 
}};