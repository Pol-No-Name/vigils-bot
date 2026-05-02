const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events, EmbedBuilder, ActivityType } = require('discord.js');
const { DateTime } = require("luxon");
const { debugLog, setDebug } = require('./debug');

let DEBUG = false;

const worldEvent_channelid = "1498803604939739186";
const warning_time = 10;

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

const sentEvents = new Set();

function checkEvent(client, event, now) {
    const diff = event.time.diff(now, 'minutes').minutes;
    const key = `${event.name}-${event.time.toISO()}`;

    if (diff <= warning_time && diff > warning_time - 1 && !sentEvents.has(key)) {
        sentEvents.add(key);

        const channel = client.channels.cache.get(worldEvent_channelid);

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

        checkEvent(client, carnival, now);
        checkEvent(client, parasol, now);
        checkEvent(client, battleRoyale, now);

        if (sentEvents.size > 100) sentEvents.clear();

        const events = [carnival, parasol, battleRoyale];

        const nextEvent = events.reduce((a, b) =>
            a.time < b.time ? a : b
        );
        debugLog(`Next event: ${nextEvent.name} at ${nextEvent.time.toLocaleString(DateTime.DATETIME_MED)}`);
    }, 60 * 1000);

    console.log(client.ws.ping);
    console.log(client.ws.status);
});

client.login(process.env.BOT_TOKEN);

// --- DEV: CONSOLE COMMANDS ---

function printMemory() {
    const mem = process.memoryUsage();

    console.log("=== RAM USAGE ===");
    console.log(`RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log("=================");
}

function printWsPing(client) {
    console.log(`WS Ping: ${client.ws.ping}ms`);
    console.log(client.ws.status);
}

const readline = require('readline');
let last = null;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', async (input) => {
    const [command, ...args] = input.split(' ');

    if (command === 'say') {
        const channel = await client.channels.fetch(args[0]);
        const message = args.slice(1).join(' ');
        await channel.send(message);
        last = channel.id;
    }

    if (command === 'shutdown') {
        console.log("Shutting down...");
        process.exit(0);
    }

    if (command === 'debug') {
        DEBUG = !DEBUG;
        setDebug(DEBUG);
        debugLog(`Debug mode: ${DEBUG ? "ON" : "OFF"}`);
    }

    if (command === 'memory' || command === 'mem') {
        printMemory();
    }

    if (command === 'ping') {
        printWsPing(client);
    }

    if (command === 'repeat' && last) {
        const channel = await client.channels.fetch(last);
        const message = args.join(' ');
        await channel.send(message);
    }

    if (command === 'repeat' && !last) {
        console.log("No last channel to repeat to.");
    }

    if (command === 'clear') {
        console.clear();
    }

    if (command === 'vars') {
        console.log("=== VARIABLES ===");
        console.log(`DEBUG: ${DEBUG}`);
        console.log(`Last Channel ID: ${last}`);
        console.log('Sent Events:', sentEvents);
        console.log(`Leaderboard Cache: ${JSON.stringify(require('./leaderboardManager').cache)}`);
        console.log(`Next Carnival: ${JSON.stringify(getNextCarnival())}`);
        console.log(`Next Parasol: ${JSON.stringify(getNextParasol())}`);
        console.log(`Next Battle Royale: ${JSON.stringify(getNextBattleRoyale())}`);
        console.log("=================");
    }

    if (command === 'events') {
        console.log("=== UPCOMING EVENTS ===");
        const carnival = getNextCarnival();
        const parasol = getNextParasol();
        const battleRoyale = getNextBattleRoyale();
        console.log(`Carnival: ${carnival.name} at ${carnival.time.toLocaleString(DateTime.DATETIME_MED)}`);
        console.log(`Parasol: ${parasol.name} at ${parasol.time.toLocaleString(DateTime.DATETIME_MED)}`);
        console.log(`Battle Royale: ${battleRoyale.name} at ${battleRoyale.time.toLocaleString(DateTime.DATETIME_MED)}`);
        console.log("=======================");
    }

    if (command === 'info') {
        console.log("Random Information");
        console.log(`Logged in as: ${client.user.tag}`);
        console.log(`Guilds: ${client.guilds.cache.size}`);
        console.log(`Channels: ${client.channels.cache.size}`);
        console.log(`Users: ${client.users.cache.size}`);
    }

    if (command === 'status') {
        const type = args[0]?.toUpperCase();
        const text = args.slice(1).join(' ');

        if (!type || !text) {
        return console.log("Usage: status <type> <text>");
        }

        await client.user.setPresence({
        activities: [{ name: text, type: ActivityType[type] }],
        status: 'online'
        });

        console.log(`Status updated to ${type} ${text}`);
    }

    if (command === 'help') {
        console.log("Available commands:");
        console.log("say <channelId> <message> - Send a message to a channel");
        console.log("repeat <message> - Repeat a message to the last used channel");
        console.log("shutdown - Shut down the bot");
        console.log("debug - Toggle debug mode");
        console.log("memory | mem - Print memory usage");
        console.log("ping - Print WebSocket ping");
        console.log("vars - Print variable values");
        console.log("events - Print upcoming events");
        console.log("clear - Clear the console");
    }
});