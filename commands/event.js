const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    SectionBuilder,
    MessageFlags
} = require('discord.js');

const events = new Map();

function buildEventContainer(event) {

    const mentions = event.participants.map(id => `<@${id}>`);

    const formattedParticipants = [];

    for (let i = 0; i < mentions.length; i += 4) {
        formattedParticipants.push(
            mentions.slice(i, i + 4).join(' • ')
        );
    }

    const participantText = formattedParticipants.length
        ? formattedParticipants.join('\n')
        : 'Nobody has joined yet.';

    return new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# ${event.title}`)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`Hosted by <@${event.host}>`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`**Description:**\n${event.description}`)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`**Category:**\n${event.category}`)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`**Location:**\n${event.location}`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
                    `**Participants [${event.participants.length}]**\n${participantText}`
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**Starts:**\n<t:${event.eventTime}:R>`)
                )
                .setButtonAccessory(
                    new ButtonBuilder()
                        .setCustomId('join_event')
                        .setLabel('Join Event')
                        .setStyle(ButtonStyle.Primary)
                )
        );
}

module.exports = {
    events,
    buildEventContainer,

    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('create an event')
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
                .setDescription('The event category')
                .setRequired(true)
                .addChoices(
                    { name: 'Patrol', value: 'Patrol' },
                    { name: 'Sparring', value: 'Sparring' },
                    { name: 'Tournament', value: 'Tournament' },
                    { name: 'Misc', value: 'Misc' }
                ))
        .addStringOption(option =>
            option.setName('location')
                .setDescription('The event location')
                .setRequired(false)),

    async execute(interaction) {

        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const timeInput = interaction.options.getString('time');
        const host = interaction.user;
        const category = interaction.options.getString('category');
        const location = interaction.options.getString('location') || 'Not specified';

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

        const event = {
            title,
            description,
            category,
            location,
            host: host.id,
            eventTime,
            participants: []
        };

        const container = buildEventContainer(event);

        const message = await interaction.reply({
            content: '<@&1361371687505105128>',
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {
                roles: ['1361371687505105128']
            },
            fetchReply: true
        });

        events.set(message.id, event);
    }
};