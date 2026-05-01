const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const { DateTime } = require("luxon");

const worldEvent_channelid = "1498803604939739186";
const warning_time = 5;

const { updateLeaderboard } = require('./leaderboardManager');

const {
    getNextCarnival,
    getNextParasol,
    getNextBattleRoyale
} = require('./eventmanager');

require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: 'Error running command.' });
        } else {
            await interaction.reply({ content: 'Error running command.', ephemeral: true });
        }
    }
});

// --- EVENT TRACKING ---
const sentEvents = new Set();

function checkEvent(client, event, now) {
    const diff = event.time.diff(now, 'minutes').minutes;
    const key = `${event.name}-${event.time.toISO()}`;

    if (diff <= warning_time && diff > warning_time - 1 && !sentEvents.has(key)) {
        sentEvents.add(key);

        const channel = client.channels.cache.get(worldEvent_channelid);

        // ✅ everything in SECONDS (Discord format)
        const startTimestamp = Math.floor(event.time.toSeconds());
        const endTimestamp = startTimestamp + (5 * 60);

        const embed = new EmbedBuilder()
            .setTitle(`${event.name} Starting soon!`)
            .setDescription(
                `${event.name} starts in **${warning_time} minutes!**\n` +
                `Starts: <t:${startTimestamp}:t>\n` +
                `Ends: <t:${endTimestamp}:t>`
            )
            .setColor(0x89b9e0)
            .setTimestamp();

        if (channel) {
            channel.send({
                content: `<@&${event.role}>`,
                allowedMentions: {
                    roles: [event.role]
                },
                embeds: [embed]
            });
        }
    }
}

client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}`);

    await updateLeaderboard(client);

    setInterval(() => {
        updateLeaderboard(client).catch(console.error);

        const now = DateTime.now().setZone("Europe/London");

        const carnival = getNextCarnival();
        const parasol = getNextParasol();
        const battleRoyale = getNextBattleRoyale();

        // check alerts
        checkEvent(client, carnival, now);
        checkEvent(client, parasol, now);
        checkEvent(client, battleRoyale, now);

        // cleanup
        if (sentEvents.size > 100) sentEvents.clear();

        // find next event overall
        const events = [carnival, parasol, battleRoyale];

        const nextEvent = events.reduce((a, b) =>
            a.time < b.time ? a : b
        );

        console.log(
            `Next event: ${nextEvent.name} at ${nextEvent.time.toFormat("HH:mm")}`
        );

    }, 60 * 1000);
});

client.login(process.env.BOT_TOKEN);