import { initializedArray } from "./misc";
function encodeTclListElement(toEncode) {
    if (typeof toEncode === "string") {
        return tclQuote(toEncode);
    }
    else if (typeof toEncode === "number") {
        return toEncode.toString();
    }
    else if (toEncode === true) {
        return "1";
    }
    else if (toEncode === false) {
        return "0";
    }
    else {
        return tclQuote(tclList(toEncode));
    }
}
export function tclList(list) {
    let result = "";
    for (const item of list) {
        if (result != "") {
            result += " ";
        }
        result += encodeTclListElement(item);
    }
    return result;
}
function isUnprintableAscii(char) {
    const charCode = char.charCodeAt(0);
    return charCode < 32 || charCode == 127;
}
if (Array.from("😀")[0] != "😀") {
    console.error({
        entireArray: Array.from("😀"),
        first: Array.from("😀")[0],
        expected: "😀",
    });
    throw new Error("Incompatible version of JavaScript.");
}
for (const codePoint of "😀") {
    if (codePoint != "😀") {
        console.error({ codePoint, expected: "😀" });
        throw new Error("Incompatible version of JavaScript.");
    }
}
function tclQuote(s) {
    if (s == "") {
        return "{}";
    }
    let requireSlashQuote = false;
    let requireBraceQuote = false;
    let braceCount = 0;
    const asArray = Array.from(s);
    const inputLength = asArray.length;
    for (let i = 0; i < inputLength; i++) {
        const character = asArray[i];
        if (character.length > 1) {
        }
        else if (isUnprintableAscii(character)) {
            requireSlashQuote = true;
        }
        else {
            switch (character) {
                case " ":
                case '"': {
                    requireBraceQuote = true;
                    break;
                }
                case "\\": {
                    if (i + 1 == inputLength) {
                        requireSlashQuote = true;
                    }
                    else {
                        requireBraceQuote = true;
                        i++;
                    }
                    break;
                }
                case "{": {
                    requireBraceQuote = true;
                    braceCount++;
                    break;
                }
                case "}": {
                    requireBraceQuote = true;
                    if (braceCount) {
                        braceCount--;
                    }
                    else {
                        requireSlashQuote = true;
                    }
                    break;
                }
            }
        }
        if (requireSlashQuote) {
            break;
        }
    }
    if (braceCount) {
        requireSlashQuote = true;
    }
    if (requireSlashQuote) {
        let result = "";
        for (const character of s) {
            switch (character) {
                case "\b": {
                    result += "\\b";
                    break;
                }
                case "\f": {
                    result += "\\f";
                    break;
                }
                case "\n": {
                    result += "\\n";
                    break;
                }
                case "\r": {
                    result += "\\r";
                    break;
                }
                case "\t": {
                    result += "\\t";
                    break;
                }
                case "\v": {
                    result += "\\v";
                    break;
                }
                case " ":
                case '"':
                case "\\":
                case "{":
                case "}": {
                    result += "\\";
                    result += character;
                    break;
                }
                default: {
                    if (isUnprintableAscii(character)) {
                        const quoted = `\\x` + character.codePointAt(0)?.toString(16).padStart(2, "0");
                        result += quoted;
                    }
                    else {
                        result += character;
                    }
                }
            }
        }
        return result;
    }
    else if (requireBraceQuote) {
        return "{" + s + "}";
    }
    else {
        return s;
    }
}
export function tclUnitTest(additionalTestCases = []) {
    const testCases = [
        ...additionalTestCases,
        {
            source: String.fromCharCode(...initializedArray(128, (i) => i)),
            notes: "all ASCII chars",
            expectedResult: "\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\b\\t\\n\\v\\f\\r\\x0e\\x0f\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f\\ !\\\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\]^_`abcdefghijklmnopqrstuvwxyz\\{|\\}~\\x7f",
        },
        { source: "", expectedResult: "{}", notes: "empty string" },
        {
            source: "simple_value",
            expectedResult: "simple_value",
            notes: "simple value",
        },
        { source: "a b c", expectedResult: "{a b c}", notes: "simple list" },
        {
            source: "{a b} {{c d} {e f}} {} {g h}",
            expectedResult: "{{a b} {{c d} {e f}} {} {g h}}",
            notes: "recursive list (just add { and }.)",
        },
        {
            source: "{a b} \\\\ \\} \\{ {c d}",
            expectedResult: "{{a b} \\\\ \\} \\{ {c d}}",
            notes: "fancy list (just add { and }.)",
        },
        {
            source: "a bc\\",
            expectedResult: "a\\ bc\\\\",
            notes: "ends with slash (add two slashes)",
        },
        {
            source: "{{{}}",
            expectedResult: "\\{\\{\\{\\}\\}",
            notes: "too many opens",
        },
        {
            source: "{{}}}",
            expectedResult: "\\{\\{\\}\\}\\}",
            notes: "too many closes",
        },
        {
            source: "{}}{{}",
            expectedResult: "\\{\\}\\}\\{\\{\\}",
            notes: "wrong order",
        },
        {
            source: 'a"b{c',
            expectedResult: 'a\\"b\\{c',
            notes: "quote and curly (Add 2 slashes.  This test case is aimed at a specific but in the C++ version of this library.)",
        },
        {
            source: "“Hello_world”",
            expectedResult: "“Hello_world”",
            notes: "Simple value with UTF-8",
        },
        {
            source: "¡Hola! ¿Què pasa?",
            expectedResult: "{¡Hola! ¿Què pasa?}",
            notes: "Simple list with UTF-8",
        },
        {
            source: "Don’t stop here {",
            expectedResult: "Don’t\\ stop\\ here\\ \\{",
            notes: "UTF-8 and backslash",
        },
        {
            source: "沒有測試，直到有中文測試！",
            expectedResult: "沒有測試，直到有中文測試！",
            notes: "It's not tested until it's tested in Chinese!",
        },
        {
            source: "🙁😆—🕶⅓👌 𝔘𝔫𝔦𝔠𝔬𝔡𝔢 𝕔𝕠𝕕𝕖 𝐩𝐨𝐢𝐧𝐭  𝑣𝑠 𝒹𝒶𝓉𝒶 𝚙𝚘𝚒𝚗𝚝",
            expectedResult: "{🙁😆—🕶⅓👌 𝔘𝔫𝔦𝔠𝔬𝔡𝔢 𝕔𝕠𝕕𝕖 𝐩𝐨𝐢𝐧𝐭  𝑣𝑠 𝒹𝒶𝓉𝒶 𝚙𝚘𝚒𝚗𝚝}",
            notes: "troublesome unicode",
        },
        {
            source: [[], [1, 2, "three", [true, false]]],
            expectedResult: "{{} {1 2 three {1 0}}}",
            notes: "recursion",
        },
    ];
    let successCount = 0;
    let needsReviewCount = 0;
    let failedCount = 0;
    for (const { source, expectedResult: result, notes } of testCases) {
        const actualResult = tclList([source]);
        if (result === undefined) {
            needsReviewCount++;
            console.log("needs review", {
                source,
                actualResult,
                notes,
                needsReviewCount,
            });
        }
        else if (actualResult === result) {
            successCount++;
        }
        else {
            failedCount++;
            console.error({ source, actualResult, result, notes, failedCount });
        }
    }
    if (failedCount > 0) {
        console.error("FAILED", { failedCount, needsReviewCount, successCount });
    }
    else if (needsReviewCount > 0) {
        console.log("NEEDS REVIEW", { needsReviewCount, successCount });
    }
    else {
        console.log("SUCCESS", { successCount });
    }
}
//# sourceMappingURL=tcl.js.map