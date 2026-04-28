const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const { updateLeaderboard } = require('./leaderboardManager');

require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

// Handle interactions
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

// ✅ Ready event (FIXED)
client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Initial leaderboard setup/update
    await updateLeaderboard(client);

    // Optional fallback updater (every 60s)
    setInterval(() => {
        updateLeaderboard(client).catch(console.error);
    }, 60000);
});

client.login(process.env.BOT_TOKEN);