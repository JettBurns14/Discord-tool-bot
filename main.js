// Write code here, obviously
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '?';

const commands = {
    help: {
        name: 'help',
        description: 'Returns all of my commands.',
        usage: prefix + this.name,
        do: (message, client, args, Discord) => {
            try {
                if (!args[0]){
                    let embed = new Discord.RichEmbed();
                    embed.setAuthor('My Commands', client.avatarURL);
                    embed.setDescription('This is a test');
                    message.channel.send({ embed });
                } else {
                    console.log(commands['purge'].usage);
                    
                    let selection = args[0];
                    let embed = new Discord.RichEmbed();
                    embed.addField('Usage:', commands[selection].usage);
                    embed.addField('Description:', commands[selection].description);
                    message.channel.send({ embed });
                }

            } catch (e) {
                console.log(e);
            }
        }
    },
    purge: {
        name: 'purge',
        description: 'Remove messages in bulk.',
        usage: prefix + this.name + " <number>",
        do: (message, client, args, Discord) => {
            try {
                if (args[0] <= 99 && args > 1){
                    message.channel.bulkDelete(parseInt(args[0]) + 1).then(() => {
                        message.reply(`Deleted ${args[0]} messages`);
                    });
                } else {
                    message.reply("Please provide a number under 100 and above 1");
                }
            } catch (e) {
                console.log(e);
            }
        }
    },
};

client.on('message', (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    let args = message.content.split(" ").splice(1);
    let command = message.content.substring(prefix.length).split(' ');
    for (let i in commands){
        if (command[0] === commands[i].name){
            commands[i].do(message, client, args, Discord);
        }
    }

});

client.login(process.env.BOT_TOKEN);
