const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const loreManager = require('../loreManager');

const loreMissing = [
    "A blank slate, waiting to be filled with tales of victories and defeats",
    "A mysterious figure, yet to carve their name into history",
    "An enigma, with stories yet to be told",
    "A newcomer, with a destiny yet to unfold",
    "An untold story, waiting for its first chapter",
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lore')
        .setDescription('Provides lore about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to provide lore about')
                .setRequired(false)
        )
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const user = interaction.options.getUser('user') || interaction.user;

            const loreText = loreManager.getLore(user.id);

            const embed = new EmbedBuilder()
                .setTitle(`${user.username}'s Lore`)
                .setDescription(
                    loreText || loreMissing[Math.floor(Math.random() * loreMissing.length)]
                );

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply("Error running command.");
            } else {
                await interaction.reply({ content: "Error running command.", ephemeral: true });
            }
        }
    }
};