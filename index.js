const DiscordSmith = require('discord.js');
const smithmta = require('gamedig');
const smithconfig = require('./config.json');

const smithbot = new DiscordSmith.Client({ intents: [DiscordSmith.Intents.FLAGS.GUILDS] });
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { config } = require('process');

const commands = [
	new SlashCommandBuilder().setName('server').setDescription('mta server status'),
    new SlashCommandBuilder().setName('player').setDescription('player in game'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(smithconfig.token);

smithbot.once('ready', () => {
	console.log(`Logged : ${smithbot.user.tag}`);
    setInterval(() => {
        smithmta.query({
            type: 'mtasa',
            host: smithconfig.server_ip,
            port: smithconfig.server_port
        }).then((state) => {
            smithbot.user.setActivity(`Player : ${state.raw.numplayers}/${state.maxplayers}`);
        }).catch(err => {
            console.log(err);
        });
    }, 5000);
    (async () => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(smithbot.user.id, smithconfig.guildId),
                { body: commands },
            );
    
            console.log('Successfully registered application commands.');
        } catch (error) {
            console.error(error);
        }
    })();
});


smithbot.on('interactionCreate', async smithmsg => {
	if (!smithmsg.isCommand()) return;

	const { commandName } = smithmsg;
    const { MessageActionRow, MessageButton } = require('discord.js');
    const message = require('discord.js');

	if (commandName === 'server') {
        smithmta.query({
            type: 'mtasa',
            host: smithconfig.server_ip,
            port: smithconfig.server_port
        }).then(async (state) => {
           console.log(state)
            var smithembed = new DiscordSmith.MessageEmbed()
            .setTitle(state.name)
            .setColor(`ORANGE`)
            .addField(`Név :`,` - ${state.map}`,true)
            .addField(`Fejlesztő: :`,` - Balivok`,true)
            .addField(`Játékosok :`,` - ${state.raw.numplayers}/${state.maxplayers}`,true)
            .addField(`Ping:`,` - ${state.ping}ms`,true)
            .addField(`IP:`,` - ${state.connect}`,true)
            .setTimestamp()
            .setThumbnail("https://media.discordapp.net/attachments/926097648077922374/952193934166220830/hmslogo20220307.png")
            .setImage("https://cdn.discordapp.com/attachments/957017034602971207/957017243357691934/logo1.png")
            .setFooter(`A botot készítette: Balivok`);

            const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('frissités')
					.setLabel('Frissítés')
					.setStyle('PRIMARY'),
			);
            smithmsg.reply({ embeds: [smithembed], components: [row] });

            smithbot.on('interactionCreate', interaction => {
                interaction.deferUpdate()
                .then(console.log)
                .catch(console.error);
                if (!interaction.isButton()) return;
                    smithmta.query({
                        type: 'mtasa',
                        host: smithconfig.server_ip,
                        port: smithconfig.server_port
                    }).then((state) => {
                        delete smithembed
                        var smithembed = new DiscordSmith.MessageEmbed()
                        .setTitle(state.name)
                        .setColor(`ORANGE`)
                        .addField(`Név :`,` - ${state.map}`,true)
                        .addField(`Fejlesztő: :`,` - Balivok`,true)
                        .addField(`Játékosok :`,` - ${state.raw.numplayers}/${state.maxplayers}`,true)
                        .addField(`Ping:`,` - ${state.ping}ms`,true)
                        .addField(`IP:`,` - ${state.connect}`,true)
                        .setTimestamp()
                        .setThumbnail("https://media.discordapp.net/attachments/926097648077922374/952193934166220830/hmslogo20220307.png")
                        .setImage("https://cdn.discordapp.com/attachments/957017034602971207/957017243357691934/logo1.png")
                        .setFooter(`A botot készítette: Balivok`);
                        smithmsg.editReply({ embeds: [smithembed], components: [row] });
                        console.log(state);
                    }).catch(err => {
                        console.log(err);
                    });
            });

        }).catch(err => {
             console.log(err);
        });

        
	}
});

smithbot.login(smithconfig.token);
