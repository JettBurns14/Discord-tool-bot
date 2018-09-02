/***

    Discord utility bot built mostly by Jett, Jonah, and some cool contributors.

    TODO:
    - Word filter
    - Better mute command, hooked up to server's DB.



    IDEAS:
    - Add modules to clean up this code!!!
    - Add a databse to manage server-specific data, then bot can be added to other servers and work
    - Management category
    - Should mod cmds be deleted?
    - Turn the roles channel into a bot controlled one
      Any comments that are not role giving commands are deleted, channel will only allow giving of roles
    - Have a report feature that deletes a post after 3-5 flags, only if user is able to
      Included with the above, a message can be approved with a reaction from staff
    - Bulk add roles to someone, at least 1, check if roles are different. addRoles <user> <roles, ...>
    - Server info
    - Roleinfo
    - Total number of msgs in server
    - Ping command
    - Channel info
    - Deletion logs
    - Unban cmd
    - Polls
    - View active invites for a server
    - Lock a channel
    - Return errors if bot doesn’t have right channels to post logs and stuff in
    - Binary convertor
    - Color info
    - Cmd to make bot react to given message, with given emoji
    - If message gets N downvotes, it can’t get to star board
    - For all the events, put them in an obj like the commands obj and loop through accordingly.

***/

// Load .env variables.
require("dotenv").load();

// Require needed modules.
const Discord = require("discord.js");
const request = require("request");

// Set up client.
const client = new Discord.Client();

// Client settings.
const prefix = "=";
const deleteDelay = 5000; // 5 second delete delay.
const creators = ["<@218397146049806337>", "<@309845156696424458>"]; // Jett and Jonah
const botAdmin = []; // Maybe fill this with IDs of users who can use eval.
const blacklisted = []; // IDs of blacklisted users.

// Embed colors.
const embedDefaultColor = "b3b3b3"; // Grey.
const embedRedColor = "ff6666"; // Red.
const embedGreenColor = "00b33c"; // Green.
const embedYellowColor = "e6e600"; // Yellow.

// Channel IDs.
const TEST_LOG_CHANNEL = "482391130751631360"; // On TEST server, where filter alerts go.
const TEST_QUEUE_CHANNEL = "484162867474595850"; // On TEST server.
const LOGS_ID = "473524298368286720"; // KAD public log channel.
const JUNKYARD_ID = "477291431069745154"; // KAD filter log channel.

// Role IDs.
const TEST_MUTED_ROLE = "484928655659892736"; // On TEST server.

// Functions for filter functionality.
const badWords = [
    "test", "tst", "est", "tet",

    "fck", "uck", "ngg", "cnt", "unt", "cnt", "bich", "blwjob", "btch", "dck",
    "pssy", "ashole", "ahole", "cck", "sht", "stu", "gto", "godamn", "whre",

    "fuck", "nigg", "fuk", "cunt", "cnut", "bitch", "dick", "d1ck", "pussy",
    "asshole", "b1tch", "b!tch", "blowjob", "cock", "c0ck", "shit", "stfu",
    "gtfo", "omfg", "goddamn", "cuck", "kys", "fkys", "kms", "fkms", "whore",
    "ahole", "wh0re damned", "lmfao", "yiff", "1488", "8=D", "A55hole",
    "abortion", "AIDs", "ainujin", "ainuzin", "akimekura", "Anal anus",
    "anuses", "Anushead", "anuslick", "anuss", "aokan", "Arsch", "Arschloch",
    "arsed", "arsehole", "arseholed arseholes", "arseholing", "arselicker",
    "arses", "Ass", "asshat", "asshole", "Auschwitz", "b00bz", "b1tc",
    "Baise bakachon", "bakatyon", "Ballsack", "BAMF", "Bastard", "Beaner",
    "Beeatch", "beeeyotch", "beefwhistle", "beeotch Beetch", "beeyotch",
    "Bellend", "bestiality", "beyitch", "beyotch", "Biach", "bin laden",
    "binladen", "biotch", "bitch Bitching", "blad", "bladt", "blowjob",
    "blowme", "blyad", "blyadt", "bon3r", "boner", "boobs", "Btch",
    "Bukakke Bullshit", "bung", "butagorosi", "butthead", "Butthole",
    "Buttplug", "c0ck", "Cabron", "Cacca", "Cadela", "Cagada Cameljockey",
    "Caralho", "castrate", "Cazzo", "ceemen", "ch1nk", "chankoro", "chieokure",
    "chikusatsu", "Ching chong Chinga", "Chingada Madre", "Chingado",
    "Chingate", "chink", "chinpo", "Chlamydia", "choad", "chode",
    "chonga chonko", "chonkoro", "chourimbo", "chourinbo", "chourippo",
    "chuurembo", "chuurenbo", "circlejerk", "cl1t", "cli7 clit", "clitoris",
    "cocain", "Cocaine", "cock", "Cocksucker", "Coglione", "Coglioni",
    "coitus", "coituss", "cojelon cojones", "condom", "coon", "coon hunt",
    "coon kill", "coonhunt", "coonkill", "Cooter", "cotton pic",
    "cotton pik cottonpic", "cottonpik", "Crackhead", "CSAM", "Culear",
    "Culero", "Culo", "Cum", "cun7", "cunt", "cvn7", "cvnt cyka", "d1kc",
    "d4go", "dago", "Darkie", "Deez Nuts", "deeznut", "deeznuts", "Dickhead",
    "dikc", "dildo Dio Bestia", "dong", "dongs", "douche", "Downie", "Downy",
    "Dumbass", "Durka durka", "Dyke", "Ejaculate", "Encule enjokousai",
    "enzyokousai", "etahinin", "etambo", "etanbo", "f0ck", "f0kc", "f3lch",
    "facking", "fag", "faggot Fanculo", "Fanny", "fatass", "fck", "Fckn",
    "fcuk", "fcuuk", "felch", "Fetish", "Fgt", "FiCKDiCH Figlio di Puttana",
    "fku", "fock", "fokc", "foreskin", "Fotze", "Foutre", "fucc", "fuck",
    "Fucking", "fuct fujinoyamai", "fukashokumin", "Fupa", "fuuck", "fuuuck",
    "fuuuuck", "fuuuuuck", "fuuuuuuck", "fuuuuuuuck",
    "fuuuuuuuuck fuuuuuuuuuck", "fuuuuuuuuuu", "fvck", "fxck", "fxuxcxk",
    "g000k", "g00k", "g0ok", "gestapo", "go0k", "god damn goldenshowers",
    "golliwogg", "gollywog", "Gooch", "gook", "goook", "Gyp", "h0m0", "h0mo",
    "h1tl3", "h1tle hairpie", "hakujakusha", "hakuroubyo", "hakuzyakusya",
    "hantoujin", "hantouzin", "Herpes", "hom0", "homo", "honky Hooker",
    "hor3", "hukasyokumin", "Hure", "Hurensohn", "huzinoyamai", "hymen",
    "inc3st", "incest", "Inculato", "Injun intercourse", "inugoroshi",
    "inugorosi", "j1g4b0", "j1g4bo", "j1gab0", "j1gabo", "Jack Off", "jackass",
    "JerkOff jig4b0", "jig4bo", "jigabo", "Jigaboo", "jiggaboo", "jizz",
    "Joder", "Joto", "Jungle Bunny", "junglebunny", "k k k k1k3", "kichigai",
    "kik3", "Kike", "kikeiji", "kikeizi", "Kilurself", "kitigai", "kkk",
    "klu klux", "Klu Klux Klan", "kluklux knobhead", "koon hunt", "koon kill",
    "koonhunt", "koonkill", "koroshiteyaru", "koumoujin", "koumouzin",
    "ku klux klan kun7", "kurombo", "Kurva", "Kurwa", "kxkxk", "l3sb0",
    "lezbo", "lezzie", "m07th3rfukr", "m0th3rfvk3r",
    "m0th3rfvker Madonna Puttana", "manberries", "manko", "manshaft",
    "Maricon", "Masterbat", "masterbate", "Masturbacion",
    "masturbait Masturbare", "Masturbate", "Masturbazione", "Merda", "Merde",
    "Meth", "Mierda", "milf", "Minge", "Miststück mitsukuchi", "mitukuti",
    "Molest", "molester", "molestor", "Moon Cricket", "moth3rfucer",
    "moth3rfvk3r", "moth3rfvker motherfucker", "Mulatto", "n1663r", "n1664",
    "n166a", "n166er", "n1g3r", "n1German", "n1gg3r", "n1gGerman n3gro",
    "n4g3r", "n4gg3r", "n4gGerman", "n4z1", "nag3r", "nagg3r", "nagGerman",
    "neGerman", "ngGerman", "nggr NhigGerman", "ni666", "ni66a", "ni66er",
    "ni66g", "ni6g", "ni6g6", "ni6gg", "nig66", "nig6g", "nigar",
    "niGerman nigg3", "nigg6", "nigga", "niggaz", "nigGerman", "nigglet",
    "niggr", "nigguh", "niggur", "niggy", "niglet", "Nignog nimpinin",
    "ninpinin", "Nipples", "niqqa", "niqqer", "Nonce", "nugga", "Nutsack",
    "Nutted", "nygGerman", "omeko Orgy", "p3n15", "p3n1s", "p3ni5", "p3nis",
    "p3nl5", "p3nls", "Paki", "Panties", "Pedo", "pedoph", "pedophile pen15",
    "pen1s", "Pendejo", "peni5", "penile", "penis", "Penis", "penl5", "penls",
    "penus", "Perra", "phaggot phagot", "phuck", "Pikey", "Pinche", "Pizda",
    "Polla", "Porca Madonna", "Porch monkey", "Porn", "Porra", "pr1ck preteen",
    "prick", "pu555y", "pu55y", "pub1c", "Pube", "pubic", "pun4ni", "pun4nl",
    "Punal", "punan1", "punani punanl", "puss1", "puss3", "puss5", "pusse",
    "pussi", "Pussies", "pusss1", "pussse", "pusssi", "pusssl", "pusssy Pussy",
    "Puta", "Putain", "Pute", "Puto", "Puttana", "Puttane", "Puttaniere",
    "puzzy", "pvssy", "queef", "r3c7um r4p15t", "r4p1st", "r4p3", "r4pi5t",
    "r4pist", "raape", "raghead", "raibyo", "Raip", "rap15t", "rap1st",
    "Rapage rape", "Raped", "rapi5t", "Raping", "rapist", "rectum", "Red Tube",
    "Reggin", "reipu", "retard", "Ricchione rimjob", "rizzape", "rompari",
    "Salaud", "Salope", "sangokujin", "sangokuzin", "santorum", "Scheiße",
    "Schlampe Schlampe", "schlong", "Schwuchtel", "Scrote", "secks",
    "seishinhakujaku", "seishinijo", "seisinhakuzyaku", "seisinizyo Semen",
    "semushiotoko", "semusiotoko", "sh|t", "sh17", "sh1t", "Shat", "Shemale",
    "shi7", "shinajin", "shinheimin shirakko", "shit", "Shitty", "shl7",
    "shlt", "shokubutsuningen", "sinazin", "sinheimin", "Skank", "SMD",
    "Sodom sofa king", "sofaking", "Spanishick", "Spanishook", "Spanishunk",
    "STD", "STDs", "Succhia Cazzi", "suck my", "suckmy syokubutuningen",
    "Taint", "Tapatte", "Tapette", "Tarlouse", "tea bag", "teabag", "teebag",
    "teensex", "teino Testa di Cazzo", "Testicles", "Thot", "tieokure",
    "tinpo", "Tits", "tokushugakkyu", "tokusyugakkyu", "torukoburo",
    "torukojo torukozyo", "tosatsu", "tosatu", "towelhead", "Tranny", "tunbo",
    "tw47", "tw4t", "twat", "tyankoro", "tyonga tyonko", "tyonkoro",
    "tyourinbo", "tyourippo", "tyurenbo", "ushigoroshi", "usigorosi",
    "v461n4", "v461na", "v46in4 v46ina", "v4g1n4", "v4g1na", "v4gin4",
    "v4gina", "va61n4", "va61na", "va6in4", "va6ina", "Vaccagare",
    "Vaffanculo vag1n4", "vag1na", "vagin4", "vagina", "VateFaire",
    "vvhitepower", "w3tb4ck", "w3tback", "Wank", "wanker wetb4ck", "wetback",
    "wh0r3", "white power", "whitepower", "whor3", "Wog", "Wop", "x8lp3t",
    "xbl pet", "XBLPET XBLRewards", "Xl3LPET", "yabunirami", "Zipperhead",
    "Блядь", "сука", "アオカン", "あおかん", "イヌゴロシ", "いぬごろし インバイ",
    "いんばい", "オナニー", "おなにー", "オメコ", "カワラコジキ", "かわらこじき",
    "カワラモノ", "かわらもの キケイジ", "きけいじ", "キチガイ", "きちがい", "キンタマ",
    "きんたま", "クロンボ", "くろんぼ", "コロシテヤル ころしてやる", "シナジン",
    "しなじん", "タチンボ", "たちんぼ", "チョンコウ", "ちょんこう", "チョンコロ",
    "ちょんころ ちょん公", "チンポ", "ちんぽ", "ツンボ", "つんぼ", "とるこじょう",
    "とるこぶろ", "トルコ嬢", "トルコ風呂", "ニガー ニグロ", "にんぴにん",
    "はんとうじん", "マンコ", "まんこ", "レイプ", "れいぷ", "低能", "屠殺", "強姦",
    "援交 支那人", "精薄", "精薄者", "輪姦"
];
const homoglyphs = Object.entries({
    "a": /[ÀÁÂÃÄÅàáâãäåɑΑαаᎪＡａ]/g,
    "b": /[ßʙΒβВЬᏴᛒＢｂ]/g,
    "c": /[ϲϹСсᏟⅭⅽＣｃ]/g,
    "d": /[ĎďĐđԁժᎠḍⅮⅾＤｄ]/g,
    "e": /[ÈÉÊËéêëĒēĔĕĖėĘĚěΕЕеᎬＥｅ]/g,
    "f": /[ϜＦｆ]/g,
    "g": /[ɡɢԌնᏀＧｇ]/g,
    "h": /[ʜΗНһᎻＨｈ]/g,
    "i": /[lɩΙІіاᎥᛁⅠⅰＩ]/g,
    "j": /[ϳЈјյᎫＪｊ]/g,
    "k": /[ΚκКᏦᛕKＫｋ]/g,
    "l": /[ʟιاᏞⅬⅼＬｌ]/g,
    "m": /[ΜϺМᎷᛖⅯⅿＭｍ]/g,
    "n": /[ɴΝＮｎ]/g,
    "p": /[ΡρРрᏢＰｐ]/g,
    "q": /[ႭႳＱｑ]/g,
    "r": /[ʀԻᏒᚱＲｒ]/g,
    "s": /[ЅѕՏႽᏚＳｓ]/g,
    "t": /[ΤτТᎢＴｔ]/g,
    "u": /[μυԱՍ⋃Ｕｕ]/g,
    "v": /[νѴѵᏙⅤⅴＶｖ]/g,
    "w": /[ѡᎳＷｗ]/g,
    "x": /[ΧχХхⅩⅹＸｘ]/g,
    "y": /[ʏΥγуҮＹｙ]/g,
    "z": /[ΖᏃＺｚ]/g
});
const deHomoglyph = str => {
    // homoglyphs.forEach(h => str = str.replace(h[1], h[0]));
    // return str;

    // for each letter,
    // replace letter with standard letter,
    // repeat
    str.split("").forEach(l => {

    })
    return str.split("").map(l => {
        homoglyphs.forEach(h => l = l.replace(h[1], h[0]));
        return l;
    }).join("");
};
const deSymbolize = str => str.replace(/[~\!@#$%^&*()-=_+\[\]{}|"";:\/?.>,<`]/g, "");
const filter = message => {
    const rawMsg = message.content.toLowerCase();
    console.log(`Raw msg: ${rawMsg}`);
    const noHomoglyphs = deHomoglyph(rawMsg);
    console.log(`Homoglyphs removed: ${noHomoglyphs}`);
    const cleanedMsg = deSymbolize(noHomoglyphs);
    console.log(`No symbols: ${cleanedMsg}`);
    const cleanedWords = cleanedMsg.split(" ");
    console.log(`Cleaned split words: ${cleanedWords}`);

    badWords.forEach(bw => {
        if (cleanedMsg.includes(` ${bw} `) || cleanedWords[0] === bw || cleanedWords[cleanedWords.length-1] === bw) {
            console.log(message.edits.length);
            let embed = new Discord.RichEmbed();
            embed.setColor(embedRedColor);
            embed.setAuthor("Filter alert", "https://cdn.discordapp.com/attachments/306119383820795904/480069533676208130/emoji.png");
            embed.setThumbnail(message.author.displayAvatarURL);
            embed.addField("Word", `"**${bw}**"`);
            embed.addField("Author", message.author.username);
            embed.addField("Message", message.content);
            embed.addField("Posted in", `<#${message.channel.id}>`);
            embed.addField("Edited?", (message.edits.length === 1 ? "No" : "Yes"));
            embed.setTimestamp();
            message.delete();
            message.guild.channels.find("id", JUNKYARD_ID).send({ embed });
        }
    });
}

// Permissions checking functions.
const hasManageMessages = msg => {
    if (msg.member.hasPermission("MANAGE_MESSAGES")) {
        return true;
    }
    return false;
}
const hasKickPerms = msg => {
    if (msg.member.hasPermission("KICK_MEMBERS")) {
        return true;
    }
    return false;
}
const hasBanPerms = msg => {
    if (msg.member.hasPermission("BAN_MEMBERS")) {
        return true;
    }
    return false;
}
const hasRolesPerms = msg => {
    if (msg.member.hasPermission("MANAGE_ROLES")) {
        return true;
    }
    return false;
}
const hasManageGuild = msg => {
    if (msg.member.hasPermission("MANAGE_GUILD")) {
        return true;
    }
    return false;
}

// Message sending functions.
const deleteMessage = msg => {
    msg.delete(deleteDelay);
};
const logMessage = (msg, obj) => {
    let embed = new Discord.RichEmbed();
    embed.setTimestamp();
    if (obj.serverChange) {
        embed.setColor(embedDefaultColor);
        embed.setThumbnail(client.user.avatarURL);
        embed.addField("Server Change", obj.serverChange);
        embed.addField("Change by", obj.byWho);
        embed.addField("Reason", obj.reason);
        msg.guild.channels.find("id", LOGS_ID).send({ embed });
    } else
    if (obj.modAction) {
        embed.setColor(embedRedColor);
        embed.setThumbnail(client.user.avatarURL);
        embed.addField("Staff Action", obj.modAction);
        embed.addField("User", obj.user)
        embed.addField("Action by", obj.byWho);
        embed.addField("Reason", obj.reason);
        msg.guild.channels.find("id", LOGS_ID).send({ embed });
    } else
    if (obj.flaggers) {
        embed.setColor(embedRedColor);
        embed.setThumbnail("https://media.discordapp.net/attachments/479408863162925062/485630915586949163/unknown.png");
        embed.addField("Message Author", obj.user);
        embed.addField("Message Content", obj.content);
        embed.addField("Flaggers", obj.flaggers);
        embed.addField("Posted in", obj.channel);
        msg.guild.channels.find("id", JUNKYARD_ID).send({ embed }).then(m => m.react("🗑"));
    }
}
const sendDM = msg => {
    client.users.find("id", "218397146049806337").send(msg);
};
const sendError = err => {
    let embed = new Discord.RichEmbed();
    embed.setColor("#e60000");
    embed.setThumbnail(client.user.avatarURL);
    embed.setAuthor("Error!", "https://media.discordapp.net/attachments/386537690260176897/418165473897611274/unknown.png");
    embed.setDescription(err);
    embed.setTimestamp();
    sendDM({ embed });
};
const permError = msg => {
    msg.react("❌");
    msg.channel.send("You do not have permissions to use this command.")
        .then(m => deleteMessage(m));
};
const commandError = (msg, err) => {
    msg.react("❌");
    msg.channel.send(`:x: ${err}`)
    .then(msg => msg.delete(deleteDelay));;
}

// Misc functions.
const millisToTime = function(milliseconds) {
    let x = milliseconds / 1000;
    let s = Math.floor(x % 60);
    x /= 60;
    let m = Math.floor(x % 60);
    x /= 60;
    let h = Math.floor(x % 24);

    return h + " Hours, " + m + " Minutes, " + s + " Seconds";
};
const otherFunctions = (message) => {
    var content = message.content.toLowerCase();
    if (content.includes("good night") || content.includes("g'night") || content.includes("goodnight") || content.includes("g night")) message.react("🌙");
    if (message.author.id === "309845156696424458" || message.author.id === "218397146049806337" || message.author.id === "221285118608801802" || message.author.id === "299150484218970113") {
        if (content == "blob") {
            message.channel.send("<a:rainbowBlob:402289443593125888>").then((m) => {
                message.delete();
                m.react("402289443593125888");
            }).catch(e => {
                sendError(e);
            });
        }
    }
    if (content.includes("jett burns") || content.includes("jett") || message.mentions.users.exists("id", "218397146049806337")) {
        if (message.author.id != "218397146049806337") {
            let embed = new Discord.RichEmbed();
            embed.setColor(embedDefaultColor);
            embed.setAuthor("You were mentioned!", message.author.avatarURL);
            embed.addField("Content", message.content);
            embed.addField("Sender", message.author);
            embed.addField("Server", message.guild);
            embed.addField("Channel", message.channel, true);
            embed.addField("Link", `https://discordapp.com/channels/${message.guild.id}/${message.channel.id}?jump=${message.id}`, true);
            embed.setTimestamp();
            sendDM({ embed });
        }
    }
    // If bot is mentioned, react with thinking.
    if (message.mentions.users.exists("id", "372013264453894154")) message.react("🤔");
};

// All bot commands.
const commands = {
    help: {
        name: "help",
        category: "General",
        description: "Returns all of my commands.",
        usage: `${prefix}help`,
        do: (message, client, args, Discord) => {
            if (!args[0]){
                let embed = new Discord.RichEmbed();
                embed.setColor(embedDefaultColor);
                embed.setAuthor("My Commands", client.user.avatarURL);
                embed.addField("General", Object.keys(commands).filter(key => {
                    return commands[key].category === "General";
                }).reduce((acc, curr, idx, arr) => {
                    return acc + curr + (idx === arr.length-1 ? "" : ", ");
                }, ""), false);
                embed.addField("Moderation", Object.keys(commands).filter(key => {
                    return commands[key].category === "Moderation";
                }).reduce((acc, curr, idx, arr) => {
                    return acc + curr + (idx === arr.length-1 ? "" : ", ");
                }, ""), false);
                embed.setThumbnail(client.user.avatarURL);
                message.channel.send({ embed });
            } else {
                let selection = args[0];
                let embed = new Discord.RichEmbed();
                embed.setColor(embedDefaultColor);
                embed.setThumbnail(client.user.avatarURL);
                embed.addField("Usage:", commands[selection].usage);
                embed.addField("Description:", commands[selection].description);
                embed.setFooter("<Angle Brackets> = Required Parameters. [Brackets] = Optional Parameters.");
                message.channel.send({ embed });
            }
        }
    },
    ping: {
        name: "ping",
        category: "General",
        description: "Shows how long does it take the bot to respond.",
        usage: `${prefix}ping`,
        do: (message, client, args, Discord) => {
            message.channel.send('Pinging...').then(sent => {
                sent.edit(`:clock2: Pong! Took ${sent.createdTimestamp - message.createdTimestamp}ms`);
            });
        }
    },
    memberCount: {
        name: "memberCount",
        description: "Check how many members are in the server.",
        category: "General",
        usage: `${prefix}memberCount`,
        do: (message, client, args, Discord) => {
            let embed = new Discord.RichEmbed();
            embed.addField("Members", message.guild.memberCount);
            embed.setColor(embedDefaultColor);
            message.channel.send({ embed });
        }
    },
    uptime: {
        name: "uptime",
        description: "Shows how long the bot has been online.",
        category: "General",
        usage: `${prefix}uptime`,
        do: (message, client, args, Discord) => {
            message.channel.send(":clock230: Bot has been online for " + millisToTime(client.uptime));
        }
    },
    color: {
        name: "color",
        description: "Display a given hex color",
        category: "General",
        usage: `${prefix}color <hex>`,
        do: (message, client, args, Discord) => {
            // Add validation, regex
            if (args[0]) {
                let embed = new Discord.RichEmbed();
                embed.setThumbnail(`http://placehold.it/300x300.png/${args[0]}/000000&text=%20`);
                embed.setColor(args[0]);
                message.channel.send({ embed });
            } else {
                commandError(message, "Not a valid hex value.");
            }
        }
    },
    info: {
        name: "info",
        description: "Shows info about this bot.",
        category: "General",
        usage: `${prefix}info`,
        do: (message, client, args, Discord) => {
            let embed = new Discord.RichEmbed();
            embed.setThumbnail(client.user.avatarURL);
            embed.addField("Users", client.users.size, true);
            embed.addField("Servers", client.guilds.size, true);
            embed.addField("Creators", creators[0] + ", " + creators[1], true);
            embed.addField("Invite", "http://bit.ly/InviteToolbot", true);
            embed.addField("GitHub", "https://github.com/JettBurns14/Discord-tool-bot", true);
            embed.setColor(embedDefaultColor);
            message.channel.send({ embed });
        }
    },
    userInfo: {
        name: "userInfo",
        description: "Check info about a given user.",
        category: "General",
        usage: `${prefix}userInfo <member>`,
        do: (message, client, args, Discord) => {
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
            embed.addField("ID", member.id, true);
            embed.addField("Nickname", (member.nickname != null ? member.nickname : "None"), true);
            embed.addField("Status", member.presence.status, true);
            embed.addField("Game", (member.presence.game != null ? member.presence.game.name : "None"), true);
            embed.addField("Joined", joined, true);
            embed.addField("Registered", registered, true);
            embed.addField("Roles", member.roles.map(x => x.name).join(", "), true);
            embed.addField("Permissions", perms.join(", ").toLowerCase(), true);
            embed.setColor(embedDefaultColor);
            message.channel.send({ embed }).catch(e => {
                sendError(e);
            });
            //console.log(Object.entries(Object.values(member.permissions.serialize()).filter(x => x == true)));
        }
    },
    levels: {
        name: "levels",
        description: "Displays top ten Mee6 users.",
        category: "General",
        usage: `${prefix}levels`,
        do: (message, client, args, Discord) => {
            // Check if Mee6 is in server
            if (message.guild.members.exists("id", "159985870458322944")) {
                let serverId = message.guild.id;
                // Get Mee6 stats
                request(`https://mee6.xyz/api/plugins/levels/leaderboard/${serverId}`, (err, res, body) => {
                    let data = JSON.parse(body);
                    // Get top ten users
                    let topTen = data.players.filter((curr, idx, arr) => {
                        return idx < 10;
                    });
                    // Incase the above doesn"t work
                    if (topTen.length === 10) {
                        let embed = new Discord.RichEmbed();
                        embed.setColor(embedDefaultColor);
                        // Add 10 fields in embed
                        topTen.forEach((user, i) => {
                            embed.addField(i + 1, `<@${user.id}> – **${user.xp.toLocaleString()}** Exp – Level **${user.level}**`);
                        });
                        embed.setThumbnail(message.guild.iconURL);
                        message.channel.send({ embed });
                    } else {
                        commandError(message, "Could not get top ten Mee6 users.");
                    }
                });
            } else {
                commandError(message, "Mee6 is not in this server.");
            }
        }
    },

    purge: {
        name: "purge",
        category: "Moderation",
        description: "Remove messages in bulk, 1-100.",
        usage: `${prefix}purge <number>`,
        do: (message, client, args, Discord) => {
            if (hasManageMessages(message)) {
                if (args[0] <= 100 && args >= 1) {
                    message.channel.bulkDelete(args[0] + 1).then(msgs => {
                        message.channel.send(`:white_check_mark: Deleted ${msgs.size - 1} messages`).then(msg => deleteMessage(msg));
                    }).catch(e => {
                        sendError(e);
                    });
                } else {
                    commandError(message, "Please provide a number ≤ 100 and ≥ 1.");
                }
            } else {
                permError(message);
            }
        }
    },
    kick: {
        name: "kick",
        description: "Kick a member.",
        category: "Moderation",
        usage: `${prefix}kick <member> <reason>`,
        do: (message, client, args, Discord) => {
            if (hasKickPerms(message)) {
                const user = message.mentions.users.first();
                const reason = args.slice(1).join(" ");
                const userId = args[0];

                // This doesn't want to work when a user isn't in the guild.
                if (user) {
                    const member = message.guild.member(user);
                    if (member) {
                        if (reason) {
                            message.guild.kick(reason)
                            .then(u => {
                                logMessage(message, {
                                    modAction: "Kick User",
                                    user: `<@${u.id}>`,
                                    byWho: `<@${message.author.id}>`,
                                    reason: reason
                                });
                            })
                            .catch(e => {
                                sendError(e);
                            });
                        } else {
                            commandError(message, "You must provide a reason for kicking.");
                        }
                    } else {
                        // The mentioned user isn't in this guild
                        commandError(message, "That user isn\'t in this guild, try providing their user ID instead.");
                    }
                } else {
                    commandError(message, "You didn't identify a valid user.");
                }
            } else {
                permError(message);
            }
        }
    },
    ban: {
        name: "ban",
        description: "Ban a member.",
        category: "Moderation",
        usage: `${prefix}ban <member> <reason>`,
        do: (message, client, args, Discord) => {
            if (hasBanPerms(message)) {
                const user = message.mentions.users.first();
                const reason = args.slice(1).join(" ");
                const userId = args[0];

                // This doesn't want to work when a user isn't in the guild.
                if (user) {
                    const member = message.guild.member(user);
                    if (member) {
                        if (reason) {
                            message.guild.ban(user, {
                                days: 0,
                                reason: reason
                            })
                            .then(u => {
                                logMessage(message, {
                                    modAction: "Ban User",
                                    user: `<@${u.id}>`,
                                    byWho: `<@${message.author.id}>`,
                                    reason: reason
                                });
                            })
                            .catch(e => {
                                sendError(e);
                            });
                        } else {
                            commandError(message, "You must provide a reason for banning.");
                        }
                    } else {
                        // The mentioned user isn't in this guild
                        commandError(message, "That user isn\'t in this guild, try providing their user ID instead.");
                    }
                } else {
                    commandError(message, "You didn't identify a valid user.");
                }
            } else {
                permError(message);
            }
        }
    },
    unban: {
        name: "unban",
        description: "Unban a member.",
        category: "Moderation",
        usage: `${prefix}unban <member> <reason>`,
        do: (message, client, args, Discord) => {
            if (hasBanPerms(message)) {
                const reason = args.slice(1).join(" ");
                const user = message.mentions.members.first();
                const userId = args[0];
                console.log(userId);

                if (user || userId) {
                    if (reason) {
                        message.guild.unban(user || userId, reason)
                        .then(u => {
                            logMessage(message, {
                                modAction: "Unban User",
                                user: `<@${u.id}>`,
                                byWho: `<@${message.author.id}>`,
                                reason: reason
                            });
                        })
                        .catch(e => {
                            sendError(e);
                        });
                    } else {
                        commandError(message, "You must provide a reason for unbanning.");
                    }
                } else {
                    commandError(message, "You didn't identify a valid user.");
                }
            } else {
                permError(message);
            }
        }
    },
    setGame: {
        name: "setGame",
        description: "Set game of the bot.",
        category: "Moderation",
        usage: `${prefix}setGame <game>`,
        do: (message, client, args, Discord) => {
            if (message.author.id === "218397146049806337") {
                client.user.setPresence({ game: { name: args.join(" "), type: 0 } });
                message.channel.send(":white_check_mark: Game set to: `" + args.join(" ") + "`").then(msg => deleteMessage(msg));
            } else {
                permError(message);
            }
        }
    },
    bans: {
        name: "bans",
        description: "View bans for this server",
        category: "Moderation",
        usage: `${prefix}bans`,
        do: (message, client, args, Discord) => {
            if (hasBanPerms(message)) {
                message.guild.fetchBans()
                .then(bans => {
                    if (bans.size > 0) {
                        let embed = new Discord.RichEmbed();
                        embed.setColor(embedDefaultColor);
                        embed.addField("Bans",
                            bans.array().reduce((acc, curr) => {
                                return acc + `${curr.tag}\n`;
                            }, "")
                        );
                        message.channel.send({ embed });
                    } else {
                        commandError(message, "No bans for this server.");
                    }
                }).catch(e => {
                    sendError(e);
                });
            } else {
                permError(message);
            }
        }
    },
    eval: {
        name: "eval",
        category: "Moderation",
        description: "Evaluates JavaScript code.",
        usage: `${prefix}eval <code>`,
        do: (message, client, args, Discord) => {
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
                permError(message);
            }
        }
    },
    msgEdits: {
        name: "msgEdits",
        description: "View edit history of a given message.",
        category: "Moderation",
        usage: `${prefix}msgEdits <messageID>`,
        do: (message, client, args, Discord) => {
            if (hasManageMessages(message)) {
                let edits = "";
                let embed = new Discord.RichEmbed();
                //embed.setThumbnail(client.user.avatarURL); Use this????
                embed.setColor(embedDefaultColor);
                message.channel.fetchMessage(args[0])
                .then(msg => {
                    for (var i = 0; i < msg.edits.length; ++i) {
                        edits += msg.edits[i] + ", ";
                    }
                    embed.addField("Content", msg.content);
                    embed.addField("Edits", edits);
                    message.channel.send({ embed });
                }).catch(e => {
                    sendError(e);
                });
            } else {
                permError(message);
            }
        }
    },
    clearReactions: {
        name: "clearReactions",
        description: "Clear reactions for a given message.",
        category: "Moderation",
        usage: `${prefix}clearReactions <messageId>`,
        do: (message, client, args, Discord) => {
            if (hasManageMessages(message)) {
                let embed = new Discord.RichEmbed();
                embed.setColor(embedDefaultColor);
                message.channel.fetchMessage(args[0]).then(msg => {
                    msg.clearReactions();
                    embed.addField("Success", ":white_check_mark: Reactions cleared.");
                    message.channel.send({ embed }).then(msg => deleteMessage(msg));
                }).catch(e => {
                    sendError(e);
                });
            } else {
                permError(message);
            }
        }
    },
    pin: {
        name: "pin",
        description: "Pin a given message.",
        category: "Moderation",
        usage: `${prefix}pin <messageId>`,
        do: (message, client, args, Discord) => {
            if (hasManageMessages(message)) {
                let embed = new Discord.RichEmbed();
                embed.setColor(embedDefaultColor);
                message.channel.fetchMessage(args[0]).then(msg => {
                    msg.pin();
                    embed.addField("Success", ":white_check_mark: Message pinned.");
                    message.channel.send({ embed }).then(msg => deleteMessage(msg));
                }).catch(e => {
                    sendError(e);
                });
            } else {
                permError(message);
            }
        }
    },
    unpin: {
        name: "unpin",
        description: "Unpin a given message.",
        category: "Moderation",
        usage: `${prefix}unpin <messageId>`,
        do: (message, client, args, Discord) => {
            if (hasManageMessages(message)) {
                let embed = new Discord.RichEmbed();
                embed.setColor(embedDefaultColor);
                message.channel.fetchMessage(args[0]).then(msg => {
                    msg.unpin();
                    embed.addField("Success", ":white_check_mark: Message unpinned.");
                    message.channel.send({ embed }).then(msg => deleteMessage(msg));
                }).catch(e => {
                    sendError(e);
                });
            } else {
                permError(message);
            }
        }
    },
    servers: {
        name: "servers",
        description: "Get names and IDs of servers this bot is handling.",
        category: "Moderation",
        usage: `${prefix}servers`,
        do: (message, client, args, Discord) => {
            if (message.author.id === "218397146049806337") {
                let embed = new Discord.RichEmbed();
                embed.setColor(embedDefaultColor);
                embed.addField("Servers", client.guilds.map(guild => guild.name));
                embed.addField("IDs", client.guilds.map(guild => guild.id));
                embed.addField("Owners", client.guilds.map(guild => guild.owner));
                message.channel.send({ embed });
            } else {
                permError(message);
            }
        }
    },
    say: {
        name: "say",
        description: "Send a message with given content",
        category: "Moderation",
        usage: `${prefix}say <content>`,
        do: (message, client, args, Discord) => {
            if (message.author.id === "218397146049806337") {
                message.delete().then(() => {
                    message.channel.send(args.join(" "));
                }).catch(e => {
                    sendError(e);
                });
            } else {
                permError(message);
            }
        }
    },
    mute: {
        name: "mute",
        description: "Mutes a member",
        category: "Moderation",
        usage: `${prefix}mute <user> <reason>`,
        do: (message, client, args, Discord) => {
            if (hasRolesPerms(message)) {
                const user = message.mentions.users.first();
                const reason = args.slice(1).join(" ");

                if (user) {
                    const member = message.guild.member(user);
                    if (member) {
                        if (reason) {
                            let muteRole = message.guild.roles.find("id", TEST_MUTED_ROLE);
                            if (muteRole) {
                                member.addRole(muteRole, reason).then(u => {
                                    logMessage(message, {
                                        modAction: "Mute User",
                                        user: `<@${u.id}>`,
                                        byWho: `<@${message.author.id}>`,
                                        reason: reason
                                    });
                                }).catch(e => {
                                    sendError(e);
                                });
                            } else {
                                commandError(message, "Muted role does not exist.");
                            }
                        } else {
                            commandError(message, "Please provide a reason for this mute.");
                        }
                    } else {
                        commandError(message, "This user isn't a member of this server.");
                    }
                } else {
                    commandError(message, "This user cannot be found.");
                }
            } else {
                permError(message);
            }
        }
    },
    unmute: {
        name: "unmute",
        description: "Unmutes a member",
        category: "Moderation",
        usage: `${prefix}unmute <user>`,
        do: (message, client, args, Discord) => {
            if (hasRolesPerms(message)) {
                const user = message.mentions.users.first();
                const reason = args.slice(1).join(" ");

                if (user) {
                    const member = message.guild.member(user);
                    if (member) {
                        if (reason) {
                            let muteRole = message.guild.roles.find("id", TEST_MUTED_ROLE);
                            if (muteRole) {
                                member.removeRole(muteRole, reason).then(u => {
                                    logMessage(message, {
                                        modAction: "Unmute User",
                                        user: `<@${u.id}>`,
                                        byWho: `<@${message.author.id}>`,
                                        reason: reason
                                    });
                                }).catch(e => {
                                    sendError(e);
                                });
                            } else {
                                commandError(message, "Muted role does not exist.");
                            }
                        } else {
                            commandError(message, "Please provide a reason for this unmute.");
                        }
                    } else {
                        commandError(message, "This user isn't a member of this server.");
                    }
                } else {
                    commandError(message, "This user cannot be found.");
                }
            } else {
                permError(message);
            }
        }
    },
    invites: {
        name: "invites",
        description: "Show all invites for a server.",
        category: "Moderation",
        usage: `${prefix}invites`,
        do: (message, client, args, Discord) => {
            if (message.member.hasPermission("MANAGE_GUILD")) {
                message.guild.fetchInvites().then(invites => {
                    if (invites.size > 0) {
                        let embed = new Discord.RichEmbed();
                        embed.setColor(embedDefaultColor);
                        embed.setThumbnail(client.user.avatarURL);
                        embed.addField("Invites",
                            invites.array().reduce((acc, curr) => {
                                return acc + `${curr.code} - ${curr.uses} (${curr.inviter.username}: <@${curr.inviter.id}>)\n`;
                            }, "")
                        );
                        message.channel.send({ embed });
                    } else {
                        commandError(message, "There are no invites.");
                    }
                }).catch(e => {
                    sendError(e);
                });
            }
        }
    },
    destroy: {
        name: "destroy",
        description: "Shut down the bot",
        category: "Moderation",
        usage: `${prefix}destroy`,
        do: (message, client, args, Discord) => {
            if (message.author.id === "218397146049806337") {
                client.destroy().then(() => {
                    console.log("Client destroyed");
                    process.exit(0);
                });
            } else {
                permError(message);
            }
        }
    },

    action: {
        name: "action",
        description: "Log a change to the server.",
        category: "Moderation",
        usage: `${prefix}action <description>`,
        do: (message, client, args, Discord) => {
            if (message.member.hasPermission("MANAGE_GUILD")) {

            }
        }
    },
    modLog: {
        name: "modLog",
        description: "test",
        category: "Moderation",
        usage: `${prefix}log`,
        do: (message, client, args, Discord) => {
            logMessage(message, {
                modAction: "Kicked alt",
                user: "MrAlt",
                byWho: "Jett",
                reason: "This user was kicked because of very similar behavior to a user we previously banned and the obvious name."
            });
        }
    },
    change: {
        name: "change",
        description: "test",
        category: "Moderation",
        usage: `${prefix}change`,
        do: (message, client, args, Discord) => {
            logMessage(message, {
                serverChange: "New bot, fixed channel perms",
                byWho: "Jett",
                reason: "This bot was added because of X and the channel perms were broken, so we disabled TTS for users."
            });
        }
    },
    /*
    blacklist: {
        name: "User blacklist",
        description: "Add or remove member to blacklist, and view it.",
        usage: `${prefix}blacklist [add/remove] [member]`,
        do: (message, client, args, Discord) => {
            try {
                if (message.member.hasPermission("MANAGE_SERVER")) {
                    //let reason = args.slice(1).join(" ");
                    if (message.mentions.members.size !== 0) {
                        //message.mentions.members.first().ban(reason)
                        message.channel.send(`<@${message.mentions.users.first().id}> has been mentioned by <@${message.author.id}>.`);
                    } else {
                        message.channel.send("You didn"t identify a valid user");
                    }
                }
            } catch(e) {
                console.log(e);
            }
        }
    }*/
};


// Client events.
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setPresence({ game: { name: `${prefix}help`, type: 0 } });

    let embed = new Discord.RichEmbed();
    embed.setColor(embedDefaultColor);
    embed.setThumbnail(client.user.avatarURL);
    embed.setAuthor("Ready!", "https://media.discordapp.net/attachments/307975805357522944/392142646618882060/image.png");
    embed.setDescription("I am online and at your service, Jett!");
    embed.setTimestamp();
    client.users.find("id", "218397146049806337").send({ embed });
});
client.on("message", message => {
    if (message.author.bot) return;
    if (message.channel.type !== "dm") filter(message);
    otherFunctions(message);

    if (!message.content.startsWith(prefix)) return;
    let args = message.content.split(" ").splice(1);
    let command = message.content.substring(prefix.length).split(" ");
    for (let i in commands){
        if (command[0].toLowerCase() === commands[i].name.toLowerCase()) {
            try {
                commands[i].do(message, client, args, Discord);
            } catch(e) {
                sendError(e);
            }
        }
    }
});
client.on("messageUpdate", (oldMsg, newMsg) => {
    if (newMsg.channel.type !== "dm" && newMsg.content) {
        console.log("Message edited:");
        console.log(`Old content: ${oldMsg.content}`);
        console.log(`New content: ${newMsg.content}`);
        filter(newMsg);
    }
});
client.on("messageReactionAdd", (reaction, user) => {
    const msgChannelId = reaction.message.channel.id;

    // If emoji is the KA flag...
    if (reaction.emoji.id === "485490810071285809") {
        // and user is not blacklisted, and user isn't flagging their own msg...
        if (blacklisted.indexOf(user.id) !== -1 || user.id === reaction.message.author.id) {
            // Remove user if so.
            reaction.remove(user);
        } else {
            // log the flagged message.
            logMessage(reaction.message, {
                user: `<@${reaction.message.author.id}>`,
                flaggers: reaction.users.array().map(u => `<@${u.id}>`).join(", "),
                content: reaction.message.content,
                channel: `<#${msgChannelId}>`
            });
        }
    }
    switch(reaction.emoji.name) {
        case "🗑":
            // If user has manage message perms...
            if (reaction.message.guild.members.find("id", user.id).hasPermission("MANAGE_MESSAGES") && user.id !== "372013264453894154") {
                // and the channel is not any official one...
                if (msgChannelId !== "473520957022142484" &&
                    msgChannelId !== "473521399210835989" &&
                    msgChannelId !== "479828958498783243" &&
                    msgChannelId !== "479420816963141690") {
                    // delete the message!
                    reaction.message.delete();
                } else {
                    reaction.remove(user);
                }
            }
        break;
        case "📌":
            if (reaction.count >= 6) {
                reaction.message.pin();
            }
        break;
    }
});
client.on("guildMemberUpdate", (oldMember, newMember) => {
    // If the member roles aren't the same
    if (!oldMember.roles.equals(newMember.roles)) {
        // Role was removed from user.
        if (newMember.roles.size < oldMember.roles.size) {
            let embed = new Discord.RichEmbed();
            embed.setColor(embedRedColor);
            embed.setDescription(`Role removed from <@${newMember.id}>`);
            embed.setFooter(newMember.id);
            embed.setTimestamp();
            newMember.guild.channels.find("id", LOGS_ID).send({ embed });
        }
        // Role was added to user.
        if (newMember.roles.size > oldMember.roles.size) {
            let embed = new Discord.RichEmbed();
            embed.setColor(embedGreenColor);
            embed.setDescription(`New role added to <@${newMember.id}>`);
            embed.setFooter(newMember.id);
            embed.setTimestamp();
            newMember.guild.channels.find("id", LOGS_ID).send({ embed });
        }
    } else
    // User changed nickname
    if (oldMember.displayName !== newMember.displayName) {
        let embed = new Discord.RichEmbed();
        embed.setColor(embedGreenColor);
        embed.setDescription(`<@${newMember.id}> changed their nickname to ${newMember.displayName}`);
        embed.setFooter(newMember.id);
        embed.setTimestamp();
        newMember.guild.channels.find("id", LOGS_ID).send({ embed });
    }
});
client.on("emojiCreate", emoji => {
    let embed = new Discord.RichEmbed();
    embed.setColor(embedGreenColor);
    embed.setDescription(`New emoji **${emoji.name}** created`);
    embed.setThumbnail(emoji.url);
    embed.setFooter(emoji.id);
    embed.setTimestamp();
    emoji.guild.channels.find("id", LOGS_ID).send({ embed });
});
client.on("emojiDelete", emoji => {
    let embed = new Discord.RichEmbed();
    embed.setColor(embedRedColor);
    embed.setDescription(`The emoji **${emoji.name}** was deleted`);
    embed.setThumbnail(emoji.url);
    embed.setFooter(emoji.id);
    embed.setTimestamp();
    emoji.guild.channels.find("id", LOGS_ID).send({ embed });
});
client.on("channelCreate", channel => {
    // Toolbot's DM with me is created when it turns on, so ignore it.
    if (channel.type !== "dm" && channel.typ !== "group") {
        let embed = new Discord.RichEmbed();
        embed.setColor(embedGreenColor);
        embed.setDescription(`New channel <#${channel.id}> created`);
        embed.setFooter(channel.id);
        embed.setTimestamp();
        client.channels.find("id", LOGS_ID).send({ embed });
    }
});
client.on("channelDelete", channel => {
    if (channel.type !== "dm" && channel.typ !== "group") {
        let embed = new Discord.RichEmbed();
        embed.setColor(embedRedColor);
        embed.setDescription(`The channel <#${channel.id}> was deleted`);
        embed.setFooter(channel.id);
        embed.setTimestamp();
        client.channels.find("id", LOGS_ID).send({ embed });
    }
});
client.on("messageDelete", message => {
    if (message.embeds.length < 1) {
        // Public log of deleted messages.
        let embed1 = new Discord.RichEmbed()
            .setColor(embedRedColor)
            .setDescription(`Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>`)
            .setFooter(message.id)
            .setTimestamp();
        message.guild.channels.find("id", LOGS_ID).send(embed1);

        // Mod log of deleted messages.
        let embed2 = new Discord.RichEmbed()
            .setColor(embedRedColor)
            .setDescription(`Message sent by <@${message.author.id}> deleted in <#${message.channel.id}>`)
            .addField("Message Content", message.content)
            .setFooter(message.id)
            .setTimestamp();
        message.guild.channels.find("id", JUNKYARD_ID).send(embed2);
    }
});
client.on("messageDeleteBulk", messages => {
    console.log(messages.array());
    let embed = new Discord.RichEmbed();
    embed.setColor(embedRedColor);
    embed.setDescription(`Bulk delete in <#${messages.first().channel.id}>, ${messages.array().length - 1} messages deleted`);
    embed.setTimestamp();
    client.channels.find("id", LOGS_ID).send({ embed });
});
client.on("messageReactionRemoveAll", message => {
    let embed = new Discord.RichEmbed();
    embed.setColor(embedRedColor);
    embed.setDescription(`Reactions removed from message in <#${message.channel.id}>.`);
    embed.setFooter(message.id);
    embed.setTimestamp();
    message.guild.channels.find("id", LOGS_ID).send({ embed });
});
client.on("roleCreate", role => {
    let embed = new Discord.RichEmbed();
    embed.setColor(embedGreenColor);
    embed.setDescription(`New role **${role.name}** created`);
    embed.setFooter(role.id);
    embed.setTimestamp();
    role.guild.channels.find("id", LOGS_ID).send({ embed });
});
client.on("roleDelete", role => {
    let embed = new Discord.RichEmbed();
    embed.setColor(embedRedColor);
    embed.setDescription(`The role **${role.name}** was deleted`);
    embed.setFooter(role.id);
    embed.setTimestamp();
    role.guild.channels.find("id", LOGS_ID).send({ embed });
});
client.on("guildMemberAdd", member => {
    let embed = new Discord.RichEmbed();
    embed.setColor(embedGreenColor);
    embed.setAuthor("Member Joined");
    embed.setDescription(`<@${member.id}> ${member.user.username}`);
    embed.setThumbnail(member.user.avatarURL);
    embed.setTimestamp();
    member.guild.channels.find("id", LOGS_ID).send({ embed });
 });
client.on("guildMemberRemove", member => {
    let embed = new Discord.RichEmbed();
    embed.setColor(embedRedColor);
    embed.setAuthor("Member Left");
    embed.setDescription(`<@${member.id}> ${member.user.username}`);
    embed.setThumbnail(member.user.avatarURL);
    embed.setTimestamp();
    member.guild.channels.find("id", LOGS_ID).send({ embed });
});
client.on("guildCreate", guild => {
    sendDM(`:inbox_tray: New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setGame(`on ${client.guilds.size} servers`);
});
client.on("guildDelete", guild => {
    sendDM(`:outbox_tray: I have been removed from: ${guild.name} (id: ${guild.id}), it had ${guild.memberCount} members.`);
    client.user.setGame(`on ${client.guilds.size} servers`);
});
client.on("warn", (e) => {
    console.log("\nWARNING:\n\n", e);
});
client.on("error", (e) => {
    console.log("\nERROR:\n\n", e);
});

client.login(process.env.TOOLBOT_TOKEN);
