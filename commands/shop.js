const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const shopStuff = [
    {
        name: 'Armorer\'s Needle',
        price: 10
    },
    {
        name: 'Idol of Yun\'shul',
        price: 20
    },
    {
        name: 'Moonseye Tome',
        price: 50
    },
    {
        name: 'Easy boss carry',
        price: 75
    },
    {
        name: 'Private Titus carry',
        price: 100
    },
    {
        name: 'Stack of Relic',
        price: 200
    },
    {
        name: 'Whistling Periapt',
        price: 500
    },
    {
        name: 'Custom Role',
        price: 1500
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bank')
        .setDescription('View the items available to purchase from the Vigil\'s Bank')
        .setDMPermission(false),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('The Vigils Bank')
            .setDescription('Here are the current items you are able to purchase with honor')
            .setColor(0xf5d06c);
        
        shopStuff.forEach(item => {
            embed.addFields({ name: item.name, value: `Price: ${item.price} Honor Points`, inline: true });
        });

        await interaction.reply({ embeds: [embed] });
    }
};