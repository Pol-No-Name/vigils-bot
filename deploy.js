const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { debugLog, setDebug } = require('./debug');
require('dotenv').config();

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`🧹 Clearing guild commands...`);

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: [] }
        );

        console.log(`📦 Deploying ${commands.length} commands...`);

        const result = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log(`✅ Deployed commands:`);
        console.log(result.map(c => c.name));
    } catch (err) {
        console.error(err);
    }
})();