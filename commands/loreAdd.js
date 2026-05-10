const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const loreManager = require('../loreManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lore-add')
        .setDescription('Adds or updates lore for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to add or update lore for')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('lore')
                .setDescription('Lore text to add or update')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
        
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const lore = interaction.options.getString('lore');

        loreManager.addLore(user.id, lore);
        await interaction.reply({ content: `Lore added/updated for ${user.displayName}.`, ephemeral: true });
    }
};