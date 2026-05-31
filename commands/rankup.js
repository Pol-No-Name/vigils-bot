const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const rankRequirements = [
    { rank: 'Initiate', req: "none", roleId: '1361370411241050243' },
    { rank: 'Swordsman', req: "**25 Honor**, Have the uniform.", roleId: '1361370385244749926' },
    { rank: 'Advanced Swordsman', req: "**50 Honor**, Attend 2 WFTE events. Have a vouch from Instructor+", roleId: '1438837496082599946' },
    { rank: 'Captain', req: "**100 Honor**, Attend 2 WFTE events. Have a vouch from a Sentinel+ as well as passing a special tryout.", roleId: '1505316830678356049' },
    { rank: 'Instructor', req: "**150 Honor**, Attend 3 WFTE events. Have tryoutted multiple people, approved by either Stratos or Maestro.", roleId: '1361370380773621770' },
    { rank: 'Blademaster', req: "**250 Honor**, Attend 3 WFTE events. Must have hosted at least 2 events, MVP in one WFTE event and approval by either Maestro or Stratos.", roleId: '1438836488346275870' },
    { rank: 'Sentinel', req: "A Sentinel is specifically chosen by Maestro.", roleId: '1438836688305651792' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranks')
        .setDescription('Shows rank progression'),

    getCurrentRankIndex(member) {
        let highest = -1;

        for (let i = 0; i < rankRequirements.length; i++) {
            if (member.roles.cache.has(rankRequirements[i].roleId)) {
                highest = i;
            }
        }

        return highest;
    },

    async execute(interaction) {
        const member = interaction.member;

        const currentIndex = this.getCurrentRankIndex(member);

        const currentRank =
            currentIndex >= 0 ? rankRequirements[currentIndex] : null;

        const nextRank = rankRequirements[currentIndex + 1] || null;

        const embed = new EmbedBuilder()
            .setTitle('Rank Progression')
            .setColor(0xf5d06c);

        if (!currentRank) {
            embed.setDescription(
                `You have no rank in the vigils.`
            );
        } else if (!nextRank) {
            embed.setDescription(
                `You are currently **${currentRank.rank}**.\n\nYou have reached the highest rank.`
            );
        } else {
            embed.setDescription(
                `You are currently **${currentRank.rank}**.\n\nNext rank: **${nextRank.rank}**\n${nextRank.req}`
            );
        }

        await interaction.reply({ embeds: [embed] });
    }
};