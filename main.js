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
                    embed.setColor('#00ffcc');
                    embed.setAuthor('My Commands', client.user.avatarURL);
                    embed.setDescription(Object.keys(commands));
                    message.channel.send({ embed });
                } else {                 
                    let selection = args[0];
                    let embed = new Discord.RichEmbed();
                    embed.setColor('#00ffcc');
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
    memberCount: {
        name: 'memberCount',
        description: 'Check how many members are in the server.',
        usage: `${prefix}memberCount`,
        do: (message, client, args, Discord) => {
            try {
                let embed = new Discord.RichEmbed();
                embed.addField('Members', message.guild.memberCount);
                embed.setColor('#00ffcc'); // #00ffcc? #6699ff?
                message.channel.send({ embed });
            } catch(e) {
                console.log(e);
            }
        }
    },
    uptime: {
        name: 'uptime',
        description: 'How long it has been since the bot last went online.',
        usage: `${prefix}uptime`,
        do: (message, client, args, Discord) => {
            try {
                message.channel.send(':clock230: Bot has been online for ' + client.uptime);
            } catch(e) {
                console.log(e);
            }
        }
    },
    /*
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
    }*/
};

const otherFunctions = () => {
    
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setUsername('Helpful Bot');
    client.user.setGame(`${prefix}help`);
});

client.on('message', (message) => {
    if (message.author.bot) return;
    if (message.content.toLowerCase().includes("good night") || message.content.toLowerCase().includes("g'night") || message.content.toLowerCase().includes("goodnight")) message.react("🌙");
    if (message.content.toLowerCase().includes("jett burns") || message.content.toLowerCase().includes("jett")/* || message.mentions.includes()*/) {
        let embed = new Discord.RichEmbed();
        let sent = new Date(message.createdTimestamp).toLocaleString();
        embed.setColor('#00ffcc');
        embed.setAuthor('You were mentioned!', message.author.avatarURL);
        embed.addField('Content', message.content);
        embed.addField('Sender', message.author);
        embed.addField('Sent', sent, true);
        embed.addField('Server', message.guild);
        embed.addField('Channel', message.channel, true);
        embed.setTimestamp();
        client.users.find('id', '218397146049806337').send({ embed });
    }
    // if bot is mentioned, react to it with reaction :thinking:
    for (var i = 0; i < message.mentions.length; ++i) {
        if (message.content.includes('test')) message.channel.send(message.mentions[i])
    }
    
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
            for (let i = 0; i < messageReaction.count; i ++) {
                for (let j = 0; j < whitelistRoles.length; j ++) {
                    if (messageReaction.message.guild.members.find("id", messageReaction.users[i]).roles.has(messageReaction.message.guild.roles.find("name", whitelistRoles[j]))) {
                        flagCount ++;
                        console.log(true);
                        break;
                    }
                }
            }
            
            //if (flagCount >= 2) messageReaction.message.delete();
            break;
        case "📌":
            if (messageReaction.count >= 10) messageReaction.message.pin();
            break;
    }
});

client.on("guildMemberAdd", (member) => {
    var  welcomes = [
        `Hello there <@${member.user.tag}>, welcome to **${member.guild.name}**!`,
        `Welcome to **${member.guild.name}**, <@${member.user.tag}>!`,
        `Hi there <@${member.user.tag}>, stay ahwile!`,
        `Hey everyone, welcome our newest member <@${member.user.tag}> to **${member.guild.name}**!`
    ];
    member.guild.channels.find("name", "general").send(welcomes[Math.floor(Math.random() * welcomes.length)]);
 });

client.on("guildMemberRemove", (member) => {
    member.guild.channels.find("name", "general").send(`Aw, <@${member.user.tag}> just left the server, bye bye...`);
});

client.login(process.env.BOT_TOKEN);
