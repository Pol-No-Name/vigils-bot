const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events, EmbedBuilder, ActivityType } = require('discord.js');
const { DateTime } = require("luxon");
const { debugLog, setDebug } = require('./debug');
const OWNER_ID = process.env.OWNER_ID;
const SECONDOUNDER_ID = process.env.SECONDOUNDER_ID;

let DEBUG = false;
require('dotenv').config();

const warning_time = 5;

const { updateLeaderboard } = require('./leaderboardManager');

const {
    getNextCarnival,
    getNextParasol,
    getNextBattleRoyale
} = require('./eventmanager');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
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
    if (!interaction.inGuild()) return;

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

async function checkEvent(client, event, now) {
    const diff = event.time.diff(now, 'minutes').minutes;
    const key = `${event.name}-${event.time.toISO()}`;

    if (diff <= warning_time && diff > warning_time - 1 && !sentEvents.has(key)) {
        sentEvents.add(key);

        const channel = await client.channels.fetch(process.env.WOLRDEVENTCHANNEL);

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

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'acknowledge_backup') {

        const message = interaction.message;
        const embed = message.embeds[0];

        // Find the Backup Responders field
        const responderField = embed.fields.find(
            field => field.name === 'Backup Responders'
        );

        let responders = [];

        if (responderField && responderField.value !== 'None yet.') {
            responders = responderField.value
                .split('\n')
                .filter(Boolean);
        }

        // Don't allow the same person to respond twice
        const mention = `<@${interaction.user.id}>`;

        if (responders.includes(mention)) {
            await interaction.reply({
                content: 'You have already responded to this backup request.',
                ephemeral: true
            });
            return;
        }

        responders.push(mention);

        // Create a new embed with the updated responder list
        const updatedEmbed = EmbedBuilder.from(embed)
            .spliceFields(
                embed.fields.findIndex(
                    field => field.name === 'Backup Responders'
                ),
                1,
                {
                    name: 'Backup Responders',
                    value: responders.join('\n')
                }
            );

        await interaction.update({
            embeds: [updatedEmbed]
        });
    }
});

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

client.on('messageCreate', async (message) => {
    // Ignore bots
    if (message.author.bot) return;

    // Owner-only
    if (message.author.id !== OWNER_ID && message.author.id !== SECONDOUNDER_ID) return;

    // Must start with !
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    try {

        if (command === 'say') {
            const channel = await client.channels.fetch(args[0]);
            const text = args.slice(1).join(' ');

            await channel.send(text);
            last = channel.id;

            return message.reply('Message sent.');
        }

        if (command === 'repeat') {
            if (!last) {
                return message.reply('No last channel to repeat to.');
            }

            const channel = await client.channels.fetch(last);
            const text = args.join(' ');

            await channel.send(text);
            return message.reply('Repeated.');
        }

        if (command === 'shutdown') {
            await message.reply('Shutting down...');
            process.exit(0);
        }

        if (command === 'debug') {
            DEBUG = !DEBUG;
            setDebug(DEBUG);

            return message.reply(
                `Debug mode: ${DEBUG ? 'ON' : 'OFF'}`
            );
        }

        if (command === 'memory' || command === 'mem') {
            const mem = process.memoryUsage();

            return message.reply(
                `RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB\n` +
                `Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
                `Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`
            );
        }

        if (command === 'ping') {
            return message.reply(`WS Ping: ${client.ws.ping}ms`);
        }


        if (command === 'vars') {
            return message.reply(
                `DEBUG: ${DEBUG}\n` +
                `Last Channel: ${last || 'None'}\n` +
                `Sent Events: ${JSON.stringify(sentEvents, null, 2)}`
            );
        }

        if (command === 'events') {
            const carnival = getNextCarnival();
            const parasol = getNextParasol();
            const battleRoyale = getNextBattleRoyale();

            return message.reply(
                `Carnival: ${carnival.name}\n` +
                `Parasol: ${parasol.name}\n` +
                `Battle Royale: ${battleRoyale.name}`
            );
        }

        if (command === 'info') {
            return message.reply(
                `Logged in as: ${client.user.tag}\n` +
                `Guilds: ${client.guilds.cache.size}\n` +
                `Channels: ${client.channels.cache.size}\n` +
                `Users: ${client.users.cache.size}`
            );
        }

        if (command === 'status') {
            const type = args[0]?.toUpperCase();
            const text = args.slice(1).join(' ');

            if (!type || !text) {
                return message.reply(
                    'Usage: !status <PLAYING|WATCHING|LISTENING|COMPETING> <text>'
                );
            }

            await client.user.setPresence({
                activities: [{
                    name: text,
                    type: ActivityType[type]
                }],
                status: 'online'
            });

            return message.reply(
                `Status updated to ${type} ${text}`
            );
        }

        if (command === 'help') {
            return message.reply(
                [
                    '**Owner Commands**',
                    '`!say <channelId> <message>`',
                    '`!repeat <message>`',
                    '`!shutdown`',
                    '`!debug`',
                    '`!memory` / `!mem`',
                    '`!ping`',
                    '`!vars`',
                    '`!events`',
                    '`!info`',
                    '`!status <type> <text>`'
                ].join('\n')
            );
        }

    } catch (err) {
        console.error(err);
        message.reply(`Error: ${err.message}`);
    }
});