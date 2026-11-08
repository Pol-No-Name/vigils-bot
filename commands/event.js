const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Create an event')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The event title')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('The event description')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time until the event starts (e.g. 30m, 1h, 2d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('category')
                .setRequired(true)
                .addChoices(
                    { name: 'Patrol', value: 'Patrol' },
                    { name: 'Sparring', value: 'Sparring' },
                    { name: 'Tournament', value: 'Tournament' },
                    { name: 'Misc', value: 'Misc' }
                )
        ),

    async execute(interaction) {

        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const timeInput = interaction.options.getString('time');
        const host = interaction.user;
        const category = interaction.options.getString('category');

        const match = timeInput.match(/^(\d+)(s|m|h|d)$/i);

        if (!match || parseInt(match[1]) < 1) {
            return interaction.reply({
                content: 'Invalid time! Use something like 30m, 1h or 2d.',
                ephemeral: true
            });
        }

        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        const multipliers = {
            s: 1000,
            m: 60000,
            h: 3600000,
            d: 86400000
        };

        const eventTime = Math.floor(
            (Date.now() + amount * multipliers[unit]) / 1000
        );

        const discordTimestamp = `<t:${eventTime}:R>`;

        const embed = {
            title: `#${title}`,
            description: `**Host: **<@${host.id}>\n
                          **Info: **  ${description}\n
                          **Category: ** ${category}\n
                          **Starts: **${discordTimestamp}\n`,
            color: 0x89b9e0
        };

        await interaction.reply({
            embeds: [embed]
        });
    }
};