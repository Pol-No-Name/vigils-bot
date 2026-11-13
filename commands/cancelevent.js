
const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');

const eventCommand = require('./event');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cancelevent')
        .setDescription('Cancel an existing event')
        .addStringOption(option =>
            option.setName('event_message_id')
                .setDescription('The message ID of the event')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for cancelling the event')
                .setRequired(false)),

    async execute(interaction) {

        const eventMessageId = interaction.options.getString('event_message_id');
        const reason = interaction.options.getString('reason') || 'No reason provided.';

        const event = eventCommand.events.get(eventMessageId);

        if (!event) {
            return interaction.reply({
                content: 'Could not find that event. Make sure the message ID is correct.',
                flags: MessageFlags.Ephemeral
            });
        }

        const isAdmin = interaction.member.permissions.has('Administrator');
        const isHost = event.host === interaction.user.id;

        if (!isAdmin && !isHost) {
            return interaction.reply({
                content: 'Only the event host or an Administrator can cancel this event.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (event.ended || event.cancelled) {
            return interaction.reply({
                content: 'This event has already ended or been cancelled.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const eventChannel = await interaction.guild.channels.fetch(event.channelId);

        if (!eventChannel || !eventChannel.messages) {
            return interaction.editReply({
                content: 'Could not find the event channel.'
            });
        }

        const eventMessage = await eventChannel.messages.fetch(eventMessageId);

        event.cancelled = true;
        event.cancelReason = reason;

        await eventMessage.edit({
            components: [
                eventCommand.buildEventContainer(event)
            ]
        });

        await interaction.editReply({
            content: 'The event has been cancelled successfully. No rewards have been distributed.'
        });
    }
};
