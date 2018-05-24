/***

    Discord utility bot built mostly by Jett and Jonah. 
    
    TODO:
    Add a category property for each cmd, since some are for moderation.
    Auto delete mod cmds
    DM me errors
    Management category
    Should mod cmds be deleted?
    
***/

const Discord = require('discord.js');
const request = require('request');
const client = new Discord.Client();
//const fs = require('fs');

const prefix = '=';
const deleteDelay = 5000; // 5 second delete delay.
const embedColor = '#00ffcc'; // Color of all embeds
const whitelistRoles = ['Trusty flagger'];
const creators = ["<@218397146049806337>", "<@309845156696424458>"];

const getDefaultChannel = async (guild) => {
    if(guild.channels.has(guild.id))
        return guild.channels.get(guild.id)

    if(guild.channels.exists("name", "general"))
        return guild.channels.find("name", "general");
    return guild.channels.filter(c => c.type === "text" && 
                                 c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
        .sort((a, b) => a.position - b.position || 
              Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber()).first();
}

const millisToTime = function(milliseconds) {
    let x = milliseconds / 1000;
    let s = Math.floor(x % 60);
    x /= 60;
    let m = Math.floor(x % 60);
    x /= 60;
    let h = Math.floor(x % 24);

    return h + ' Hours, ' + m + ' Minutes, ' + s + " Seconds";
};

const sendDM = (msg) => {
    client.users.find('id', '218397146049806337').send(msg);
};

const sendError = (error) => {
    let embed = new Discord.RichEmbed();
    embed.setColor('#e60000');
    embed.setAuthor('Opps, we have an error!', 'https://media.discordapp.net/attachments/386537690260176897/418165473897611274/unknown.png');
    embed.setThumbnail('https://media.discordapp.net/attachments/386537690260176897/418165473897611274/unknown.png');
    embed.addField('Error', error);
    embed.setTimestamp();
    sendDM({ embed });
};

const commands = {
    help: {
        name: 'help',
        category: 'General',
        description: 'Returns all of my commands.',
        usage: `${prefix}help`,
        do: (message, client, args, Discord) => {
            try {
                if (!args[0]){
                    let embed = new Discord.RichEmbed();
                    embed.setColor(embedColor);
                    embed.setAuthor('My Commands', client.user.avatarURL);
                    embed.addField('General', Object.keys(commands).filter(function(key) {
                        return commands[key].category === 'General';
                    }).map(function(key) {
                        return commands[key].name;
                    }));
                    embed.addField('Moderation', Object.keys(commands).filter(function(key) {
                        return commands[key].category === 'Moderation';
                    }).map(function(key) {
                        return commands[key].name;
                    }));
                    message.channel.send({ embed });
                } else {                 
                    let selection = args[0];
                    let embed = new Discord.RichEmbed();
                    embed.setColor(embedColor);
                    embed.addField('Usage:', commands[selection].usage);
                    embed.addField('Description:', commands[selection].description);
                    message.channel.send({ embed });
                }

            } catch(e) {
                sendError(e);
            };
        }
    },
    purge: {
        name: 'purge',
        category: 'Moderation',
        description: 'Remove messages in bulk, 1-100.',
        usage: `${prefix}purge <number>`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("MANAGE_MESSAGES")) {
                    if (args[0] <= 100 && args >= 1){
                        message.channel.bulkDelete(parseInt(args[0]) + 1).then(() => {
                            message.reply(`Deleted ${args[0]} messages`).then(msg => msg.delete(deleteDelay));
                        }).catch(e => {
                            sendError(e);
                        });
                    } else {
                        message.reply("Please provide a number ≤ 100 and ≥ 1").then(msg => msg.delete(deleteDelay));
                    }
                } else {
                    message.delete();
                    message.channel.send("You do not have permissions to use this command.").then(msg => msg.delete(deleteDelay));
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    kick: {
        name: 'kick',
        description: 'Kick a member.',
        category: 'Moderation',
        usage: `${prefix}kick <member> [reason]`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("KICK_MEMBERS")){
                    let reason = args.slice(1).join(' ');
                    if(message.mentions.members.size !== 0){
                        message.mentions.members.first().kick(reason).catch(e => {
                            sendError(e);
                        });
                        message.channel.send(`<@${message.mentions.users.first().id}> has been kicked by <@${message.author.id}> because: ${reason}`);
                    } else {
                        message.channel.send("You didn't identify a valid user").then(msg => msg.delete(deleteDelay));
                    }
                } else {
                    message.delete();
                    message.channel.send("You do not have permissions to use this command.").then(msg => msg.delete(deleteDelay));
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    ban: {
        name: 'ban',
        description: 'Ban a member.',
        category: 'Moderation',
        usage: `${prefix}ban <member> [reason]`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("BAN_MEMBERS")) {
                    let reason = args.slice(1).join(' ');
                    if (message.mentions.members.size !== 0) {
                        message.mentions.members.first().ban(reason).catch(e => {
                            sendError(e);
                        });
                        message.channel.send(`<@${message.mentions.users.first().id}> has been banned by <@${message.author.id}> because: ${reason}`);
                    } else {
                        message.channel.send("You didn't identify a valid user").then(msg => msg.delete(deleteDelay));
                    }
                } else {
                    message.delete();
                    message.channel.send("You do not have permissions to use this command.").then(msg => msg.delete(deleteDelay));
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    memberCount: {
        name: 'memberCount',
        description: 'Check how many members are in the server.',
        category: 'General',
        usage: `${prefix}memberCount`,
        do: (message, client, args, Discord) => {
            try {
                let embed = new Discord.RichEmbed();
                embed.addField('Members', message.guild.memberCount);
                embed.setColor(embedColor);
                message.channel.send({ embed });
            } catch(e) {
                sendError(e);
            };
        }
    },
    uptime: {
        name: 'uptime',
        description: 'Shows how long the bot has been online.',
        category: 'General',
        usage: `${prefix}uptime`,
        do: (message, client, args, Discord) => {
            try {
                message.channel.send(':clock230: Bot has been online for ' + millisToTime(client.uptime));
            } catch(e) {
                sendError(e);
            };
        }
    },
    info: {
        name: 'info',
        description: 'Shows info about this bot.',
        category: 'General',
        usage: `${prefix}info`,
        do: (message, client, args, Discord) => {
            try {
                let embed = new Discord.RichEmbed();
                embed.setThumbnail(client.user.avatarURL);
                embed.addField('Users', client.users.size, true); 
                embed.addField('Servers', client.guilds.size, true);
                embed.addField('Creators', creators[0] + ', ' + creators[1], true);
                embed.addField('Invite', 'http://bit.ly/InviteToolbot', true);
                embed.addField('GitHub', 'https://github.com/JettBurns14/Discord-tool-bot', true);
                embed.setColor(embedColor);
                message.channel.send({ embed });
            } catch(e) {
                sendError(e);
            };
        }
    },
    userInfo: {
        name: 'userInfo',
        description: 'Check info about a given user.',
        category: 'General',
        usage: `${prefix}userInfo <member>`,
        do: (message, client, args, Discord) => {
            try {
                let member = message.mentions.members.first();
                let joined = new Date(member.joinedAt);
                let registered = new Date(member.user.createdAt);
                let embed = new Discord.RichEmbed();
                let perms = [];
                for (let [key, value] of Object.entries(member.permissions.serialize())) {
                    if (value == true) {
                        perms.push(key);
                    } else {
                        continue;
                    }
                }
                embed.setAuthor(member.user.tag, member.user.avatarURL);
                embed.setThumbnail(member.user.avatarURL);
                embed.addField('ID', member.id, true);
                embed.addField('Nickname', (member.nickname != null ? member.nickname : 'None'), true);
                embed.addField('Status', member.presence.status, true);
                embed.addField('Game', (member.presence.game != null ? member.presence.game.name : 'None'), true);
                embed.addField('Joined', joined, true);
                embed.addField('Registered', registered, true);
                embed.addField('Roles', member.roles.map(x => x.name).join(', '), true);
                embed.addField('Permissions', perms.join(', ').toLowerCase(), true);
                embed.setColor(embedColor);
                message.channel.send({ embed }).catch(e => {
                    sendError(e);
                });
                //console.log(Object.entries(Object.values(member.permissions.serialize()).filter(x => x == true)));
            } catch(e) {
                sendError(e);
            };
        }
    },
    setGame: {
        name: 'setGame',
        description: 'Set game of the bot.',
        category: 'Moderation',
        usage: `${prefix}setGame <game>`,
        do: (message, client, args, Discord) => {
            try {
                if (message.author.id == '218397146049806337') {
                    client.user.setPresence({ game: { name: args[0], type: 0 } });
                    message.channel.send(':white_check_mark: Game set to: `' + args[0] + '`').then(msg => msg.delete(deleteDelay));
                } else {
                    message.delete();
                    message.channel.send(':x: You don\'t have permission to use this command!').then(msg => msg.delete(deleteDelay));
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    bans: {
        name: 'bans',
        description: 'View bans for this server',
        category: 'Moderation',
        usage: `${prefix}bans`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("MANAGE_GUILD")) {
                    let embed = new Discord.RichEmbed();
                    //embed.setThumbnail(client.user.avatarURL);
                    embed.setColor(embedColor);
                    message.guild.fetchBans().then(promise => {
                        let resolvedBans = Promise.resolve(promise);
                        resolvedBans.then((u) => {
                            embed.addField('Bans', u.map(x => x.tag));
                            message.channel.send({ embed });
                        }).catch(e => {
                            sendError(e);
                        });
                    }).catch(e => {
                        sendError(e);
                    });
                } else {
                    message.delete();
                    message.channel.send(':x: You don\'t have permission to use this command!').then(msg => msg.delete(deleteDelay));
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    eval: {
        name: 'eval',
        description: 'Evaluates JavaScript code.',
        usage: `${prefix}eval <code>`,
        do: (message, client, args, Discord) => {
            try {
                if (message.author.id === "218397146049806337" || message.author.id === "309845156696424458") {
                    function clean(text) {
                        if (typeof(text) === "string")
                            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                        else
                            return text;
                    }
                    try {
                        const code = args.join(" ");
                        let evaled = eval(code);

                        if (typeof evaled !== "string") {
                            evaled = require("util").inspect(evaled);
                        }

                        message.channel.send(clean(evaled), { code: "xl" }).catch(e => {
                            sendError(e);
                        });
                  } catch (err) {
                      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
                  }
                } else {
                    message.delete();
                    message.reply(":x: Only the bot owners can use this command.").then(msg => msg.delete(deleteDelay));
                    return;
                }                
            } catch(e) {
                sendError(e);
            };
        }
    },
    msgEdits: {
        name: 'msgEdits',
        description: 'View edit history of a given message.',
        category: 'Moderation',
        usage: `${prefix}msgEdits <messageID>`,
        do: (message, client, args, Discord) => {
            try {
                var edits = '';
                let embed = new Discord.RichEmbed();
                //embed.setThumbnail(client.user.avatarURL);
                embed.setColor(embedColor);
                message.channel.fetchMessage(args[0])
                    .then(msg => {
                        for (var i = 0; i < msg.edits.length; ++i) {
                            edits += msg.edits[i] + ', ';
                        }
                        embed.addField('Content', msg.content);
                        embed.addField('Edits', edits);
                        message.channel.send({ embed });
                }).catch(e => {
                    sendError(e);
                });
            } catch(e) {
                sendError(e);
            };
        }
    },
    clearReactions: {
        name: 'clearReactions',
        description: 'Clear reactions for a given message.',
        category: 'Moderation',
        usage: `${prefix}clearReactions <messageId>`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("MANAGE_MESSAGES")) {
                    let embed = new Discord.RichEmbed();
                    embed.setColor(embedColor);
                    message.channel.fetchMessage(args[0]).then(msg => {
                        msg.clearReactions();
                        embed.addField('Success', ':white_check_mark: Reactions cleared.');
                        message.channel.send({ embed }).then(msg => msg.delete(deleteDelay));
                    }).catch(e => {
                        sendError(e);
                    });
                } else {
                    message.delete();
                    message.channel.send(':x: You don\'t have permission to use this command!').then(msg => msg.delete(deleteDelay));
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    pin: {
        name: 'pin',
        description: 'Pin a given message.',
        category: 'Moderation',
        usage: `${prefix}pin <messageId>`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("MANAGE_GUILD")) {
                    let embed = new Discord.RichEmbed();
                    embed.setColor(embedColor);
                    message.channel.fetchMessage(args[0]).then(msg => {
                        msg.pin();
                        embed.addField('Success', ':white_check_mark: Message pinned.');
                        message.channel.send({ embed }).then(msg => msg.delete(deleteDelay));
                    }).catch(e => {
                        sendError(e);
                    });
                } else {
                    message.delete();
                    message.channel.send(':x: You don\'t have permission to use this command!').then(msg => msg.delete(deleteDelay));
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    unpin: {
        name: 'unpin',
        description: 'Unpin a given message.',
        category: 'Moderation',
        usage: `${prefix}unpin <messageId>`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("MANAGE_GUILD")) {
                    let embed = new Discord.RichEmbed();
                    embed.setColor(embedColor);
                    message.channel.fetchMessage(args[0]).then(msg => {
                        msg.unpin();
                        embed.addField('Success', ':white_check_mark: Message unpinned.');
                        message.channel.send({ embed }).then(msg => msg.delete(deleteDelay));
                    }).catch(e => {
                        sendError(e);
                    });
                } else {
                    message.delete();
                    message.channel.send(':x: You don\'t have permission to use this command!').then(msg => msg.delete(deleteDelay));
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    servers: {
        name: 'servers',
        description: 'Get names and IDs of servers this bot is handling.',
        category: 'Moderation',
        usage: `${prefix}servers`,
        do: (message, client, args, Discord) => {
            try {
                if (message.author.id === '218397146049806337') {
                    let embed = new Discord.RichEmbed();
                    embed.setColor(embedColor);
                    embed.addField('Servers', client.guilds.map(guild => guild.name));
                    embed.addField('IDs', client.guilds.map(guild => guild.id));
                    embed.addField('Owners', client.guilds.map(guild => guild.owner));
                    message.channel.send({ embed });
                    
                } else {
                    message.delete();
                    message.channel.send(':x: You don\'t have permission to use this command!').then(msg => msg.delete(deleteDelay));
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    say: {
        name: 'say',
        description: 'Send a message with given content',
        category: 'Moderation',
        usage: `${prefix}say <content>`,
        do: (message, client, args, Discord) => {
            try {
                if (message.author.id === '218397146049806337') {
                    message.delete().then(msg => {
                        message.channel.send(args.join(' '));
                    }).catch(e => {
                        sendError(e);
                    });
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    mute: {
        name: 'mute',
        description: 'Mutes a member',
        category: 'Moderation',
        usage: `${prefix}mute <user>`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("MANAGE_ROLES")) {
                    let reason = args.slice(1).join(' ');
                    let muteRole = message.guild.roles.find("id", "398661819989884928");
                    if (message.mentions.members.size !== 0){
                        message.mentions.members.first().addRole(muteRole, reason).then(() => {
                            message.channel.send(`${message.mentions.users.first()} has been muted by <@${message.author.id}> because: ${reason}`);
                        }).catch(e => {
                            sendError(e);
                        });
                    } else {
                        message.delete();
                        message.channel.send("You didn't identify a valid user").then(msg => msg.delete(deleteDelay));
                    }
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    unmute: {
        name: 'unmute',
        description: 'Unmutes a member',
        category: 'Moderation',
        usage: `${prefix}unmute <user>`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("MANAGE_ROLES")) {
                    if (message.mentions.members.size !== 0){
                        let muteRole = message.guild.roles.find("id", "398661819989884928");
                        message.mentions.members.first().removeRole(muteRole).then(() => {
                            message.channel.send(`${message.mentions.users.first()} has been unmuted by <@${message.author.id}>.`);
                        }).catch(e => {
                            sendError(e);
                        });
                    } else {
                        message.delete();
                        message.channel.send("You didn't identify a valid user").then(msg => msg.delete(deleteDelay));
                    }
                }
            } catch(e) {
                sendError(e);
            };
        }
    },
    test: {
        name: 'test',
        description: 'This is a test command.  What the command does depends on whatever the devs are testing at the time.',
        category: 'General',
        usage: `${prefix}test`,
        do: (message, client, args, Discord) => {
            /*for (var i in client.channels.get("380940603246116866").fetchMessages({ limit: 1 })) {
                message.channel.send(i);
            }*/
        }
    },
    levels: {
        name: 'levels',
        description: 'Displays top ten Mee6 users.',
        category: 'General',
        usage: `${prefix}levels`,
        do: (message, client, args, Discord) => {
            // Check if Mee6 is in server
            if (message.guild.members.exists("id", "159985870458322944")) {
                let serverId = message.guild.id;
                // Get Mee6 stats
                request(`https://api.mee6.xyz/plugins/levels/leaderboard/${serverId}`, (err, res, body) => {
                    let data = JSON.parse(body);
                    // Get top ten users
                    let topTen = data.players.filter((curr, ind, arr) => {
                        return ind < 10;
                    });
                    // Incase the above doesn't work
                    if (topTen.length === 10) {
                        let embed = new Discord.RichEmbed();
                        embed.setColor(embedColor);
                        // Add 10 fields in embed
                        topTen.forEach((user, i) => {
                            embed.addField(i + 1, `<@${user.id}> – **${user.xp.toLocaleString()}** Exp – Level **${user.level}**`);
                        });
                        embed.setThumbnail(message.guild.iconURL);
                        message.channel.send({ embed });
                    } else {
                        sendError('Couldn\'t get top ten Mee6 users');
                    }
                });
            } else {
                message.channel.send('This command only works if Mee6 is in the server');
            }
        }
    },
    rank: {
        name: 'rank',
        description: 'Displays your current Mee6 stats.',
        category: 'General',
        usage: `${prefix}rank`,
        do: (message, client, args, Discord) => {
            // Check if Mee6 is in server
            if (message.guild.members.exists("id", "159985870458322944")) {
                let serverId = message.guild.id;
                let playerGot = false;
                let embed = new Discord.RichEmbed();
                var page = 0;
                // Get Mee6 stats
                while (!playerGot) {
                    request(`https://api.mee6.xyz/plugins/levels/leaderboard/${serverId}?page=${page}`, (err, res, body) => {
                        let data = JSON.parse(body);
                        for (let i = 0; i < data.players.length; i++) {
                            if (data.players[i].id === message.author.id) {
                                playerGot = true;
                                let user = data.players[i];
                                embed.setColor(embedColor);
                                embed.setAuthor(user.username, message.author.avatarURL)
                                embed.addField("Rank", `${page * 100 + i + 1}`, true);
                                embed.addField("Lvl.", user.level, true);
                                embed.addField("Exp.", `${user.detailed_xp[0]}/${user.detailed_xp[1]} (tot. ${user.detailed_xp[2]})`, true);
                            }
                        }
                    });
                    page++;
                }
                message.channel.send({ embed });
            } else {
                message.channel.send('This command only works if Mee6 is in the server');
            }
        }
    }
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

const otherFunctions = (message) => {
    var content = message.content.toLowerCase();
    if (content.includes("good night") || content.includes("g'night") || content.includes("goodnight") || content.includes("g night")) message.react("🌙");
    if (message.author.id === '309845156696424458' || message.author.id === '218397146049806337' || message.author.id === "221285118608801802" || message.author.id === "299150484218970113") {
        if (content == 'blob') {
            message.delete();
            message.channel.send("<a:rainbowBlob:402289443593125888>").then((m) => {
                m.react("402289443593125888");
            }).catch(e => {
                sendError(e);
            });
        }
    }
    if (content.includes("jett burns") || content.includes("jett") || message.mentions.users.exists('id', '218397146049806337')) {
        if (message.author.id != '218397146049806337') {
            let embed = new Discord.RichEmbed();
            embed.setColor(embedColor);
            embed.setAuthor('You were mentioned!', message.author.avatarURL);
            embed.addField('Content', message.content);
            embed.addField('Sender', message.author);
            embed.addField('Server', message.guild);
            embed.addField('Channel', message.channel, true);
            embed.addField('Link', `https://discordapp.com/channels/${message.guild.id}/${message.channel.id}?jump=${message.id}`, true);
            embed.setTimestamp();
            sendDM({ embed });
        }
    }
    // If bot is mentioned, react with thinking.
    if (message.mentions.users.exists('id', '372013264453894154')) message.react("🤔");
};


setInterval(() => {
    var d = new Date(Date.now());
    
    // If the time is 11:15 AM CST, execute this code.
    if (d.getHours() == 16 && d.getMinutes() == 15) {
        // Find Daily Dose channel and most recent message.
        client.channels.find('id', '380940603246116866').fetchMessages({ limit: 1 }).then(msg => {
            // If the message's created day is equal to today, that means someone posted today, so return.
            if (new Date(msg.first().createdTimestamp).getDay() == new Date(Date.now()).getDay()) {
                message.channel.send("Yay, the Daily Dose is done, have a cookie: 🍪");
                return;
            }
            // If it doesn't return, this means nobody has posted for today yet.
            console.log(d);
            // Send DD reminder.
            client.channels.find('id', '424681674333487115').send(`<@&395704791101079553> \nSomeone do the Daily Dose please! \n\nGet __Word of the day__ here: https://www.merriam-webster.com/word-of-the-day \nGet __Fact of the day__ here: https://www.beagreatteacher.com/daily-fun-fact/ \nGet __Phobia of the day__ here: http://phobialist.com/ \nGet __Quote of the day__ here: https://www.brainyquote.com/topics/day \nChallenge and question of the day can be your own. \nMake sure the first three haven't been used before by searching the channel.`);
        });
    }
}, 1000 * 60);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setUsername('Helpful Bot');
    client.user.setPresence({ game: { name: `${prefix}help`, type: 0 } });
    
    let embed = new Discord.RichEmbed();
    embed.setColor(embedColor);
    embed.setThumbnail('https://media.discordapp.net/attachments/307975805357522944/392142646618882060/image.png');
    embed.addField('Ready', 'I am online and at your service, Jett!');
    embed.setTimestamp();
    client.users.find('id', '218397146049806337').send({ embed });
});

client.on("guildCreate", guild => {
    sendDM(`:inbox_tray: New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setGame(`on ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
    sendDM(`:outbox_tray: I have been removed from: ${guild.name} (id: ${guild.id}), it had ${guild.memberCount} members.`);
    client.user.setGame(`on ${client.guilds.size} servers`);
});

client.on('message', (message) => {
    if (message.author.bot) return;
    otherFunctions(message);
    if (!message.content.startsWith(prefix)) return;
    let args = message.content.split(" ").splice(1);
    let command = message.content.substring(prefix.length).split(' ');
    for (let i in commands){
        if (command[0].toLowerCase() === commands[i].name.toLowerCase()) {
            commands[i].do(message, client, args, Discord);
        }
    }
});


client.on("messageReactionAdd", (messageReaction, user) => {
    switch(messageReaction.emoji.name) {
            // Look for log sending messages
        case "🚩":
            let flagCount = 0;
            /*
            for (let i = 0; i < messageReaction.count; i ++) {
                for (let j = 0; j < whitelistRoles.length; j ++) {
                    if (messageReaction.message.guild.members.find("id", messageReaction.users[i]).roles.has(messageReaction.message.guild.roles.find("name", whitelistRoles[j]))) {
                        flagCount ++;
                        console.log(true);
                        break;
                    }
                }
            }*/
            
            if (flagCount >= 3) {
                //messageReaction.message.delete();
            } else {
                let embed = new Discord.RichEmbed();
                embed.setColor([247, 237, 96]);
                embed.setAuthor(messageReaction.message.author.tag, messageReaction.message.author.avatarURL);
                embed.addField(`Message flagged in #${messageReaction.message.channel.name} by <someone>`, messageReaction.message.content);
                embed.setFooter(messageReaction.message.createdTimestamp);
                // embed.addField('Flagged by:', 'WIP');
                if (messageReaction.message.guild.channels.exists('name', 'staff-logs')) {
                    //client.channels.find('name', 'staff-logs').send({ embed });
                }
            }
            break;
        case "📌":
            if (messageReaction.count >= 10) messageReaction.message.pin();
            break;
        case "⭐":
            let embed = new Discord.RichEmbed();
            embed.setColor('#ffd633');
            embed.addField('Author', messageReaction.message.author);
            embed.addField('Channel', messageReaction.message.channel);
            embed.addField('Message', messageReaction.message.content);
            embed.setThumbnail(messageReaction.message.author.avatarURL);
            if (messageReaction.count >= 7){
                messageReaction.message.guild.channels.find('id', '412610188944605184').send({ embed });
                messageReaction.message.clearReactions();
            }
    }
});

client.on("guildMemberAdd", (member) => {
    var  welcomes = [
        `Hello there <@${member.id}>, welcome to **${member.guild.name}**!`,
        `Welcome to **${member.guild.name}**, <@${member.id}>!`,
        `Hi there <@${member.id}>, stay ahwile!`,
        `Hey everyone, welcome our newest member <@${member.id}> to **${member.guild.name}**!`
    ];
    var welcome = `Welcome to the ${member.guild.name} Discord server, <@${member.id}>!
Please provide us with your Khan Academy __profile link__ so we can verify you.
Also, let us know what roles you'd like, which are all explained in <#423253793501741076> or with the !roleinfo command.
<@&380569987242393610>`;

    //let channel = getDefaultChannel(member.guild);
    member.guild.channels.find("name", "general").send(welcomes[Math.floor(Math.random() * welcomes.length)]);
    if (member.guild.channels.find("id", "380202012077457409")) member.guild.channels.find("id", "380202012077457409").send(welcome);
 });

client.on("guildMemberRemove", (member) => {
    //let channel = getDefaultChannel(member.guild);
    member.guild.channels.find("name", "general").send(`Aw, ${member.user.tag} just left the server, bye bye...`);
});

client.login(process.env.BOT_TOKEN);
