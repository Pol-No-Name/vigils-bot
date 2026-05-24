const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');
const sheetdbapi = process.env.SHEETDB_API_MEMBERS;

getRobloxId = async (username) => {
    try {
        const response = await axios.post(
            'https://users.roblox.com/v1/usernames/users',
            {
                usernames: [username],
                excludeBannedUsers: false
            }
        );

        const data = response.data;

        if (!data.data || data.data.length === 0) {
            throw new Error('User not found');
        }

        return data.data[0].id;
    } catch (error) {
        console.error('Error fetching Roblox ID:', error.response?.data || error.message);
        throw new Error('Failed to fetch Roblox ID');
    }
};

function formatDate(input) {
    const datePart = input.split('T')[0]; // YYYY-MM-DD
    const [year, month, day] = datePart.split('-');

    return `${day}.${month}.${year}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmember')
        .setDescription('Add a new member to the database')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to add to the database')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rusername')
                .setDescription('The Roblox username of the member to add')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('region')
                .setDescription('The region of the member to add')
                .setRequired(true)
                .addChoices(
                { name: 'NA', value: 'NA' },
                { name: 'EU', value: 'EU' },
            )
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const username = user.username;
        const robloxUsername = interaction.options.getString('rusername');
        const robloxId = await getRobloxId(robloxUsername);
        const userId = user.id;
        const region = interaction.options.getString('region');
        const timestamp = await formatDate(new Date().toISOString());

        try {
            await axios.post(sheetdbapi, {
                data: {
                    Roblox_Username: robloxUsername,
                    Roblox_ID: robloxId,
                    Discord_Username: username,
                    Discord_ID: userId,
                    Region: region,
                    Rank: 'Vigil Initiate',
                    Lore_slot: '',
                    Loreslot: 'No',
                    Lore_Name: '',
                    Join_Date: timestamp,
                }
            });
            await interaction.reply({ content: 'Member added successfully!', ephemeral: true });
        } catch (error) {
            console.error('Error adding member:', error);
            await interaction.reply({ content: 'Failed to add member.', ephemeral: true });
        }

        embed = new EmbedBuilder()
            .setTitle('New Member Added')
            .setColor(0x89b9e0)
            .setDescription(`Added <@${userId}> to the database.`)
            .addFields(
                { name: 'Discord Username', value: username, inline: true },
                { name: 'Roblox Username', value: robloxUsername, inline: true },
                { name: 'Region', value: region, inline: true },
                { name: 'Join Date', value: timestamp, inline: true }
        )
        
        await interaction.followUp({ embeds: [embed] });
    }
};