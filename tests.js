const test = require("tape");
const Homoglyphs = require("./modules/filter/Homoglyphs");

const homoglyphs = Homoglyphs.load(require("./homoglyphs.json"));

test("Homoglyph test", t => {
    const tests = [
        ["ᛒᏒᏞɑｌ", "brlal"],
        ["Р0p", "p0p"],
        ["Աa 2", "ua 2"],
        ["abcdefghijklmnopqrstuvwxyz", "abcdefghijklmnopqrstuvwxyz"],
        ["abcdĘfghijklmＮopqrstuvwxyz", "abcdefghijklmnopqrstuvwxyz"],
        ["ႳႳႳ", "qqq"],
    ];

    t.plan(tests.length);

    for (let glyphTest of tests) {
        const [obfuscated, pure] = glyphTest;
        t.equal(homoglyphs.replace(obfuscated), pure);
    }
});