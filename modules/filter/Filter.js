const SizedQueue = require("./SizedQueue");
const Homoglyphs = require("./Homoglyphs");
const { Colors } = require("../../constants");
const onlyEmoji = require('emoji-aware').onlyEmoji;

// Strip unwanted characters that could be used for evading the filter
const removeSymbols = str =>
    str.replace(/[~\!@#$%^&*()-=_+\[\]{}|"";:\/?.>,<`]/g, "");

// Replace server emotes with regular emojis so that `onlyEmoji` picks them up
const replaceServerEmotes = str => str.replace(/<:\w+:\d+>/g, "\uD83D\uDC3E");

// Calculate what percentage of chars are emojis.
// Returns a value between 0 and 1, 0 being no emojis and 1 being completely emojis
const calculateEmojiFrequency = str => onlyEmoji(str).length / [...str].length;

const filterIcon = "https://cdn.discordapp.com/attachments/306119383820795904/480069533676208130/emoji.png";

class Filter {
    constructor(rawGlyphs, options) {
        this.homoglyphs = Homoglyphs.load(rawGlyphs);
        this.profanity = options.profanity;
        this.chain = {
            inner: new SizedQueue(options.queueSize || 0),
            threshold: options.threshold,
        };
        this.emoteFrequency = options.emoteFrequency || 0.0;
    }

    // Checks if the a cleaned message is "good" (meaning that it should not get filtered)
    cleanedMessageIsOkay(cleanMessage) {
        const cleanedWords = cleanMessage.split(/\s+/);

        return cleanedWords.every(word => !this.profanity.includes(word.toLowerCase())) &&
            this.chain.inner.countInstances(cleanMessage) < this.chain.threshold &&
            calculateEmojiFrequency(cleanMessage) < this.emoteFrequency;
    }

    // Strips symbols and homoglyphs from a message
    cleanMessage(msg) {
        return removeSymbols(this.homoglyphs.replace(replaceServerEmotes(msg)));
    }

    // The main filter method.  Returns a promise
    run(message, Discord) {
        const cleanMessage = this.cleanMessage(message.content);

        if (this.cleanedMessageIsOkay(cleanMessage)) {
                this.chain.inner.push(cleanMessage);
                return Promise.resolve(null);
            } else {
                let embed = new Discord.RichEmbed()
                    .setColor(Colors.RED)
                    .setAuthor("Filter alert", filterIcon)
                    .setThumbnail(message.author.displayAvatarURL)
                    .addField("Author", message.author.username)
                    .addField("Message", message.content)
                    .addField("Posted in", `<#${message.channel.id}>`)
                    .addField("Edited?", (message.edits.length === 1 ? "No" : "Yes"))
                    .setTimestamp();
                return message.delete().then(_ => {
                    console.log(JUNKYARD_ID);
                    return message.guild.channels.find("id", JUNKYARD_ID).send({ embed });
                });
            }
    }
}

module.exports = Filter;