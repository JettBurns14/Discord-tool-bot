// Write code here, obviously
const Discord = require('discord.js');
const client = new Discord.Client();
//const fs = require('fs');

const prefix = '?';
//const bannedRoles = [];
//var blacklist = require("./bot.json");
const whitelistRoles = ['Trusty flagger'];

const welcome = () => {
    //return `Hello there, welcome to ${member.guild.name}!`,
    //`Welcome to ${member.guild.name}!`
};

const commands = {
    help: {
        name: 'help',
        description: 'Returns all of my commands.',
        usage: `${prefix}help`,
        do: (message, client, args, Discord) => {
            try {
                if (!args[0]){
                    let embed = new Discord.RichEmbed();
                    embed.setAuthor('My Commands', client.user.avatarURL);
                    embed.setDescription(Object.keys(commands));
                    message.channel.send({ embed });
                } else {                 
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
        usage: `${prefix}purge <number>`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("MANAGE_MESSAGES")){
                    if (args[0] <= 99 && args > 1){
                        message.channel.bulkDelete(parseInt(args[0]) + 1).then(() => {
                            message.reply(`Deleted ${args[0]} messages`);
                        });
                    } else {
                        message.reply("Please provide a number under 100 and above 1");
                    }
                } else {
                    message.channel.send("You do not have permissions to use this command.");
                }
            } catch (e) {
                console.log(e);
            }
        }
    },
    kick: {
        name: 'kick',
        description: 'Kick a member.',
        usage: `${prefix}kick <member> [reason]`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("KICK_MEMBERS")){
                    let reason = args.slice(1).join(' ');
                    if(message.mentions.members.size !== 0){
                        message.mentions.members.first().kick(reason)
                        message.channel.send(`<@${message.mentions.users.first().id}> has been kicked by <@${message.author.id}> because: ${reason}`);
                       
                    } else {
                        message.channel.send("You didn't identify a valid user");
                    }
                } else {
                    message.channel.send("You do not have permissions to use this command.");
                }
            } catch(e) {
                console.log(e);
            }
        }
    },
    ban: {
        name: 'ban',
        description: 'Ban a member.',
        usage: `${prefix}ban <member> [reason]`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("BAN_MEMBERS")) {
                    let reason = args.slice(1).join(' ');
                    if(message.mentions.members.size !== 0){
                        message.mentions.members.first().ban(reason)
                        message.channel.send(`<@${message.mentions.users.first().id}> has been banned by <@${message.author.id}> because: ${reason}`);
                    } else {
                        message.channel.send("You didn't identify a valid user");
                    }
                }
            } catch(e) {
                console.log(e);              
            }
        }
    },
    blacklist: {
        name: 'User blacklist',
        description: 'Add or remove member to blacklist, and view it.',
        usage: `${prefix}blacklist [add/remove] [member]`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("MANAGE_SERVER")) {
                    //let reason = args.slice(1).join(' ');
                    if (message.mentions.members.size !== 0) {
                        //message.mentions.members.first().ban(reason)
                        message.channel.send(`<@${message.mentions.users.first().id}> has been mentioned by <@${message.author.id}>.`);
                    } else {
                        message.channel.send("You didn't identify a valid user");
                    }
                }
            } catch(e) {
                console.log(e);              
            }
        }
    }
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setUsername('Helpful Bot');
});

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


client.on("messageReactionAdd", (messageReaction, user) => {
    switch(messageReaction.emoji.name){
        case "🚩":
            let flagCount = 0;
            /**for (let i = 0; i < messageReaction.count; i ++) {
                for (let j = 0; j < whitelistRoles.length; j ++) {
                    if (messageReaction.message.guild.members.find("id", messageReaction.users[i]).roles.find("name", whitelistRoles[j])) {
                        flagCount ++;
                        break;
                    }
                }
            }**/
            
            for (let i in messageReaction.users) {
                    console.log(messageReaction.users[i].roles.has(messageReaction.message.guild.roles.find("name", "Trusty flagger")));
                    //console.log(messageReaction.user.roles.has(messageReaction.message.guild.roles.find("name", "Trusty flagger")));
            }
            //if (flagCount >= 2) messageReaction.message.delete();
            break;
        case "📌":
            if (messageReaction.count >= 1) messageReaction.message.pin().then(message => console.log('Pinnged message')).catch(console.error);
            break;
    }
});

client.on("guildMemberAdd", (member) => {
    var  welcomes = [
        `Hello there ${member.user}, welcome to **${member.guild.name}**!`,
        `Welcome to **${member.guild.name}**, ${member.user}!`,
        `Hi there ${member.user}, stay ahwile!`,
        `Hey everyone, welcome our newest member to **${member.guild.name}**!`
    ];
    member.guild.channels.find("name", "general").send(welcomes[Math.floor(Math.random() * welcomes.length)]);
 });

client.on("guildMemberRemove", (member) => {
    member.guild.channels.find("name", "general").send(`Aw, ${member.user} just left the server, bye bye...`);
});

client.login(process.env.BOT_TOKEN);
