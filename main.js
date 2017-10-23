// Write code here, obviously
const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);
const prefix = '?';

const commands = {
    help: {
        name: 'help',
        description: 'Returns all of my commands.',
        do: function(message, client, args, Discord){
            let embed = new Discord.RichEmbed();
            embed.setAuthor(client.avatarURL, 'My Commands');
            embed.setDescription('This is a test');
            message.channel.send(embed);
        }
    },
    purge: {
        name: 'purge',
        description: 'Remove messages in bulk.',
        do: function(message, client, args, Discord) {
            let deleteCount = parseInt(args[0], 10);

            if(!deleteCount || deleteCount < 2 || deleteCount > 100) {
                //message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
                let embed = new Discord.RichEmbed();
                embed.setAuthor(client.avatarURL, 'Purge');
                embed.setDescription('Please provide a number between 2 and 100 for the number of messages to delete');
                message.channel.send(embed);    
            }

            // So we get our messages, and delete them. Simple enough, right?
            let fetched = message.channel.fetchMessages({count: deleteCount});
            message.channel.bulkDelete(fetched)
                .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
        }
    },
}

client.on('message', (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    let args = message.content.split(" ").splice(1);
    let command = message.content.substring(prefix.length).split(' ');
    for (let i in commands){
        if (command[0] === commands[i].name)){
            commands[i].do(message, client, args, Discord);
        }
    }

});

client.login(process.env.BOT_TOKEN);
