import { initializedArray } from "./misc";

/**
 * Strings and things that I feel comfortable automatically converting into strings.
 */
export type TclListable = string | number | boolean | Iterable<TclListable>;

function encodeTclListElement(toEncode: TclListable): string {
  if (typeof toEncode === "string") {
    return tclQuote(toEncode);
  } else if (typeof toEncode === "number") {
    return toEncode.toString();
  } else if (toEncode === true) {
    return "1";
  } else if (toEncode === false) {
    return "0";
  } else {
    return tclQuote(tclList(toEncode));
  }
}

/**
 * This encodes a list of strings in the TCL format.
 *
 * TCL lists and programs are inspired by shell script.
 * A space separates two adjacent items.
 * If a list item contains a space (or other special character) we quote the item.
 * Any valid unicode string is a valid list item, including the output of previous calls to `tclList()`.
 * In fact the format is optimized for recursive lists.
 *
 * `tclList(a, b, c)` in JavaScript is the same as
 * `[list $a $b $c]` in TCL.
 *
 * If the items are strings, they are encoded in the normal TCL way.
 * If an item is a boolean, it is first converted to "1" or "0".
 * If an item is a number, it is converted to a string in the default way.
 * If an item is an array, `tclList()` recursively calls itself.
 *
 * For the unquoting rules, see http://tmml.sourceforge.net/doc/tcl/Tcl.html
 * @param list The items to encode in a single string.
 * @returns The list in TCL format.
 */
export function tclList(list: Iterable<TclListable>): string {
  let result = "";
  for (const item of list) {
    if (result != "") {
      result += " ";
    }
    result += encodeTclListElement(item);
  }
  return result;
}

function isUnprintableAscii(char: string): boolean {
  const charCode = char.charCodeAt(0);
  return charCode < 32 || charCode == 127;
}

// This is more than a curiosity.  I'm telling my tools (in the various config files)
// that I know these features work.  Maybe I should start my program by checking.  And
// print a nice error message if there's a problem, and refusing to continue.
if (Array.from("😀")[0] != "😀") {
  // Apparently older versions of JavaScript didn't do this the same way.
  // "😀" is one unicode "code point" (roughly a character), but two
  // "code units" (roughly, it would take 32 bits to store this
  // internally) and older versions of JavaScript split this string into
  // two pieces, neither of which is a valid unicode string.
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

/**
 * This is the same as saying `[list $s]` in TCL.
 * @param s The list item to be quoted
 * @returns A quoted version of s.
 */
function tclQuote(s: string): string {
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
      // A unicode character that required multiple code points.
      // E.g. 😀
      // These are all safe and require no special quoting.
    } else if (isUnprintableAscii(character)) {
      // Quote all unprintable characters.
      requireSlashQuote = true;
    } else {
      switch (character) {
        case " ":
        case '"': {
          requireBraceQuote = true;
          break;
        }
        case "\\": {
          if (i + 1 == inputLength) {
            // Ends with a \.
            requireSlashQuote = true;
          } else {
            // The character after the \ can be safely ignored.
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
          } else {
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
    // The braces did not match.
    requireSlashQuote = true;
  }
  if (requireSlashQuote) {
    // This is the most comprehensive quoting solution.  It can quote
    // anything.  But the input can grow to 4 times the original size.
    // If applied recursively, the size could double each time.
    let result = "";
    for (const character of s) {
      switch (character) {
        // Some of this effort is not required.  \a does not need
        // to be quoted at all.  \t could be quoted just like a brace
        // or an unprintable character.  We go out of our way here to
        // make things more readable to a human.  Also, sometimes it is
        // convenient to the programmer to get rid or \n and \r,
        // so the main input loop can use something simple like a gets().
        //
        // Interesting:  "\a" means beep in C++ and TCL.
        // But "\a" in JavaScript just translates to "a".
        /*
        case "\\a": {
          result += "\\a";
          break;
        }
        */
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
            // By the time we get here we know that we could include the
            // character as is and TCL would not complain.  But this
            // is convenient to the human reader.
            const quoted =
              // E.g. \x01 for character #1.
              `\\x` + character.codePointAt(0)?.toString(16).padStart(2, "0");
            result += quoted;
          } else {
            result += character;
          }
        }
      }
    }
    return result; // Slash quoted
  } else if (requireBraceQuote) {
    return "{" + s + "}";
  } else {
    return s;
  }
}

type TestCase = {
  /**
   * A valid list item.
   *
   * This test focuses on individual list items, because assembling the items after they have been
   * quoted is trivial.  However, `source` can be an array, which we will turn into a TCL list.
   */
  source: TclListable;
  /**
   * The expected result.
   *
   * If our output matches this exactly, the test passes.
   * If out output differs from this, the test fails.
   * If this is missing, the test will just print the result on the console, without judgement.
   */
  expectedResult?: string;
  /**
   * A human readable description of the test case.
   */
  notes?: string;
};

export function tclUnitTest(additionalTestCases: TestCase[] = []) {
  const testCases: TestCase[] = [
    ...additionalTestCases,
    {
      source: String.fromCharCode(...initializedArray(128, (i) => i)),
      notes: "all ASCII chars",
      expectedResult:
        "\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\b\\t\\n\\v\\f\\r\\x0e\\x0f\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f\\ !\\\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\]^_`abcdefghijklmnopqrstuvwxyz\\{|\\}~\\x7f",
    },
    { source: "", expectedResult: "{}", notes: "empty string" },
    //{ source: "something to fail", result: "no", notes: "something to fail" },
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
      notes:
        "quote and curly (Add 2 slashes.  This test case is aimed at a specific but in the C++ version of this library.)",
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
    } else if (actualResult === result) {
      successCount++;
    } else {
      failedCount++;
      console.error({ source, actualResult, result, notes, failedCount });
    }
  }
  if (failedCount > 0) {
    console.error("FAILED", { failedCount, needsReviewCount, successCount });
  } else if (needsReviewCount > 0) {
    console.log("NEEDS REVIEW", { needsReviewCount, successCount });
  } else {
    console.log("SUCCESS", { successCount });
  }
}
