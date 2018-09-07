class Homoglyph {
    constructor(homoglyphRegex, replacementChar) {
        this.regex = homoglyphRegex;
        this.char = replacementChar;
    }

    replace(str) {
        return str.replace(this.regex, this. char);
    }
}

class Homoglyphs {
    constructor(glyphs) {
        this.glyphs = glyphs;
    }

    static load(raw) {
        return new Homoglyphs(Object.entries(raw)
            .map(keyval => {
                let [glyphStr, replacement] = keyval;
                return new Homoglyph(new RegExp(`[${glyphStr}]`, "g"), replacement);
            }));
    }

    replace(str) {
        for (let glyph of this.glyphs) {
            str = glyph.replace(str);
        }
        return str;
    }
}

module.exports = Homoglyphs;