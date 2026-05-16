const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const Swordsman_ID = 1361370385244749926;
const AdvSwordsman_ID = 1438837496082599946;
const Captain_ID = 1505316830678356049;
const Instructor_ID = 1361370380773621770;
const Blademaster_ID = 1438836488346275870;
const Sentinel_ID = 1438836688305651792;

const rankRequirements = [
    { rank: 'Swordsman', req: "**25 Honor**, Have the uniform.", roleId: Swordsman_ID },
    { rank: 'Advanced Swordsman', req: "**50 Honor**, Attend 2 WFTE events. Have a vouch from Instructor+", roleId: AdvSwordsman_ID },
    { rank: 'Captain', req: "**150 Honor**, Attend 2 WFTE events. Have a vouch from a Sentinel+ as well as passing a special tryout.", roleId: Captain_ID },
    { rank: 'Instructor', req: "**250 Honor**, Attend 3 WFTE events. Have tryoutted multiple people, approved by either Stratos or Maestro.", roleId: Instructor_ID },
    { rank: 'Blademaster', req: "**500 Honor**, Attend 3 WFTE events. Must have hosted at least 2 events, MVP in one WFTE event and approval by either Maestro or Stratos.", roleId: Blademaster_ID },
    { rank: 'Sentinel', req: "A Sentinel is specifically chosen by Maestro.", roleId: Sentinel_ID }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranks')
        .setDescription('Shows the requirements to rank up'),

    getNextRank(member) {
        let highestIndex = -1;
        
        for (let i = 0; i < rankRequirements.length; i++) {
            const rank = rankRequirements[i];

            if (member.roles.cache.has(rank.roleId)) {
                highestIndex = i;
            }
        }

        return rankRequirements[highestIndex + 1] || null;
    },

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Rank Up Requirements')
            .setColor(0xf5d06c);

        const nextRank = this.getNextRank(interaction.member);

        if (nextRank) {
            embed.setDescription(
                `To rank up to **${nextRank.rank}**, you need:\n${nextRank.req}`
            );
        } else {
            embed.setDescription(
                'Congratulations! You have achieved the highest rank!'
            );
        }

        await interaction.reply({ embeds: [embed] });
    }
};