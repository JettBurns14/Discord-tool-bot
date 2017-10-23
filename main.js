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
            embed.setTitle('My Commands');
            embed.setDescription('This is a test');
            message.channel.send({ embed });
        }
    }

};
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)    
});
client.on('message', (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    let args = message.content.split(" ").splice(1);
    let command = message.content.substring(prefix.length).split(' ');
    console.log(command[0]);
    for (let i in commands){
        if (command[0].toLowerCase() === commands[i].name){
            commands[i].do(message, client, args, Discord);
        }
    }

});
