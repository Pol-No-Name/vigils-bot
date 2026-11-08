const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

const eventCommand = require('./event');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('endevent')
        .setDescription('End an existing event')
        .addAttachmentOption(option =>
            option.setName('photo')
                .setDescription('Photo to upload to the event channel')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('event_message_id')
                .setDescription('The message ID of the event')
                .setRequired(true)),

    async execute(interaction) {

        const photo = interaction.options.getAttachment('photo');
        const eventMessageId = interaction.options.getString('event_message_id');

        // Find the event
        const event = eventCommand.events.get(eventMessageId);

        if (!event) {
            return interaction.reply({
                content: 'Could not find that event. Make sure the message ID is correct.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Check permissions
        const isAdmin = interaction.member.permissions.has('Administrator');
        const isHost = event.host === interaction.user.id;

        if (!isAdmin || !isHost) {
            return interaction.reply({
                content: 'Only the event host or an Administrator can end this event.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (event.ended) {
            return interaction.reply({
                content: 'This event has already ended.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Get the photo destination channel from Railway
        const photoChannelId = process.env.EVENT_PHOTO_CHANNEL_ID;

        if (!photoChannelId) {
            return interaction.reply({
                content: 'The event photo channel has not been configured.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Fetch the original event message
        const eventChannel = await interaction.guild.channels.fetch(event.channelId);
        const eventMessage = await eventChannel.messages.fetch(eventMessageId);

        // Fetch the photo destination channel
        const photoChannel = await interaction.guild.channels.fetch(photoChannelId);

        if (!photoChannel || typeof photoChannel.send !== 'function') {
            return interaction.editReply({
                content: 'The configured photo channel could not be found.'
            });
        }

        // Upload the photo
        const participantList = event.participants.length > 0
            ? event.participants.map(id => `<@${id}>`).join('\n')
            : 'Nobody joined the event.';

        await photoChannel.send({
            content: `**Event:** ${event.title}\n**Participants (${event.participants.length}):**\n${participantList}`,
            files: [{
                attachment: photo.url,
                name: photo.name
            }],
            allowedMentions: {
                users: event.participants
            }
        });

        // Mark the event as ended
        event.ended = true;

        // Update the original event card
        await eventMessage.edit({
            components: [
                eventCommand.buildEventContainer(event)
            ]
        });

        await interaction.editReply({
            content: 'The event has been ended and the photo has been uploaded.'
        });
    }
};