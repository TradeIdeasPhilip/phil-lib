"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countMap = exports.Random = exports.phi = exports.radiansPerDegree = exports.degreesPerRadian = exports.FULL_CIRCLE = exports.FIGURE_SPACE = exports.NON_BREAKING_SPACE = exports.MIN_DATE = exports.MAX_DATE = exports.csvStringToArray = void 0;
exports.assertClass = assertClass;
exports.sleep = sleep;
exports.testXml = testXml;
exports.parseXml = parseXml;
exports.followPath = followPath;
exports.getAttribute = getAttribute;
exports.parseFloatX = parseFloatX;
exports.parseIntX = parseIntX;
exports.parseTimeT = parseTimeT;
exports.pickAny = pickAny;
exports.pick = pick;
exports.take = take;
exports.filterMap = filterMap;
exports.makePromise = makePromise;
exports.dateIsValid = dateIsValid;
exports.angleBetween = angleBetween;
exports.positiveModulo = positiveModulo;
exports.rotateArray = rotateArray;
exports.rectUnion = rectUnion;
exports.rectAddPoint = rectAddPoint;
exports.dateToFileName = dateToFileName;
exports.lerp = lerp;
exports.assertFinite = assertFinite;
exports.shuffleArray = shuffleArray;
exports.zip = zip;
exports.count = count;
exports.initializedArray = initializedArray;
exports.sum = sum;
exports.makeLinear = makeLinear;
exports.makeBoundedLinear = makeBoundedLinear;
exports.polarToRectangular = polarToRectangular;
exports.permutations = permutations;
function assertClass(item, ty, notes = "Assertion Failed.") {
    const failed = (typeFound) => {
        throw new Error(`${notes}  Expected type:  ${ty.name}.  Found type:  ${typeFound}.`);
    };
    if (item === null) {
        failed("null");
    }
    else if (typeof item != "object") {
        failed(typeof item);
    }
    else if (!(item instanceof ty)) {
        failed(item.constructor.name);
    }
    else {
        return item;
    }
    throw new Error("wtf");
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function testXml(xmlStr) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xmlStr, "application/xml");
    for (const element of Array.from(dom.querySelectorAll("parsererror"))) {
        if (element instanceof HTMLElement) {
            return { error: element };
        }
    }
    return { parsed: dom };
}
function parseXml(bytes) {
    if (bytes === undefined) {
        return undefined;
    }
    else {
        const parsed = testXml(bytes);
        return parsed?.parsed?.documentElement;
    }
}
function followPath(from, ...path) {
    for (const transition of path) {
        if (from === undefined) {
            return undefined;
        }
        else if (typeof transition === "number") {
            from = from.children[transition];
        }
        else {
            const hasCorrectName = from.getElementsByTagName(transition);
            if (hasCorrectName.length != 1) {
                return undefined;
            }
            else {
                from = hasCorrectName[0];
            }
        }
    }
    return from;
}
function getAttribute(attributeName, from, ...path) {
    from = followPath(from, ...path);
    if (from === undefined) {
        return undefined;
    }
    if (!from.hasAttribute(attributeName)) {
        return undefined;
    }
    return from.getAttribute(attributeName) ?? undefined;
}
function parseFloatX(source) {
    if (source === undefined || source === null) {
        return undefined;
    }
    const result = +source;
    if (isFinite(result)) {
        return result;
    }
    else {
        return undefined;
    }
}
function parseIntX(source) {
    const result = parseFloatX(source);
    if (result === undefined) {
        return undefined;
    }
    else if (result > Number.MAX_SAFE_INTEGER ||
        result < Number.MIN_SAFE_INTEGER ||
        result != Math.floor(result)) {
        return undefined;
    }
    else {
        return result;
    }
}
function parseTimeT(source) {
    if (typeof source === "string") {
        source = parseIntX(source);
    }
    if (source === undefined || source === null) {
        return undefined;
    }
    if (source <= 0) {
        return undefined;
    }
    return new Date(source * 1000);
}
const csvStringToArray = (data) => {
    const re = /(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi;
    const result = [[]];
    let matches;
    while ((matches = re.exec(data))) {
        if (matches[1].length && matches[1] !== ",")
            result.push([]);
        result[result.length - 1].push(matches[2] !== undefined ? matches[2].replace(/""/g, '"') : matches[3]);
    }
    return result;
};
exports.csvStringToArray = csvStringToArray;
function pickAny(set) {
    const first = set.values().next();
    if (first.done) {
        return undefined;
    }
    else {
        return first.value;
    }
}
function pick(array) {
    if (array.length == 0) {
        throw new Error("wtf");
    }
    return array[(Math.random() * array.length) | 0];
}
function take(array) {
    if (array.length < 1) {
        throw new Error("wtf");
    }
    const index = (Math.random() * array.length) | 0;
    const removed = array.splice(index, 1);
    return removed[0];
}
function filterMap(input, transform) {
    const result = [];
    input.forEach((input, index) => {
        const possibleElement = transform(input, index);
        if (undefined !== possibleElement) {
            result.push(possibleElement);
        }
    });
    return result;
}
function makePromise() {
    let resolve;
    let reject;
    const promise = new Promise((resolve1, reject1) => {
        resolve = resolve1;
        reject = reject1;
    });
    return { promise, resolve, reject };
}
exports.MAX_DATE = new Date(8640000000000000);
exports.MIN_DATE = new Date(-8640000000000000);
function dateIsValid(date) {
    return isFinite(date.getTime());
}
exports.NON_BREAKING_SPACE = "\xa0";
exports.FIGURE_SPACE = "\u2007";
exports.FULL_CIRCLE = 2 * Math.PI;
exports.degreesPerRadian = 360 / exports.FULL_CIRCLE;
exports.radiansPerDegree = exports.FULL_CIRCLE / 360;
exports.phi = (1 + Math.sqrt(5)) / 2;
function angleBetween(angle1, angle2) {
    const angle1p = positiveModulo(angle1, exports.FULL_CIRCLE);
    const angle2p = positiveModulo(angle2, exports.FULL_CIRCLE);
    let difference = angle2p - angle1p;
    const maxDifference = exports.FULL_CIRCLE / 2;
    if (difference > maxDifference) {
        difference -= exports.FULL_CIRCLE;
    }
    else if (difference < -maxDifference) {
        difference += exports.FULL_CIRCLE;
    }
    if (Math.abs(difference) > maxDifference) {
        throw new Error("wtf");
    }
    return difference;
}
function positiveModulo(numerator, denominator) {
    const simpleAnswer = numerator % denominator;
    if (simpleAnswer < 0) {
        return simpleAnswer + Math.abs(denominator);
    }
    else {
        return simpleAnswer;
    }
}
function rotateArray(input, by) {
    if ((by | 0) != by) {
        throw new Error(`invalid input: ${by}`);
    }
    by = positiveModulo(by, input.length);
    if (by == 0) {
        return input;
    }
    else {
        return [...input.slice(by), ...input.slice(0, by)];
    }
}
class Random {
    static sfc32(a, b, c, d) {
        return function () {
            a |= 0;
            b |= 0;
            c |= 0;
            d |= 0;
            let t = (((a + b) | 0) + d) | 0;
            d = (d + 1) | 0;
            a = b ^ (b >>> 9);
            b = (c + (c << 3)) | 0;
            c = (c << 21) | (c >>> 11);
            c = (c + t) | 0;
            return (t >>> 0) / 4294967296;
        };
    }
    static #nextSeedInt = 42;
    static create(seed = this.newSeed()) {
        console.info(seed);
        const seedObject = JSON.parse(seed);
        if (!(seedObject instanceof Array)) {
            throw new Error("invalid seed");
        }
        if (seedObject.length != 4) {
            throw new Error("invalid seed");
        }
        const [a, b, c, d] = seedObject;
        if (!(typeof a == "number" &&
            typeof b == "number" &&
            typeof c == "number" &&
            typeof d == "number")) {
            throw new Error("invalid seed");
        }
        return this.sfc32(a, b, c, d);
    }
    static newSeed() {
        const ints = [];
        ints.push(Date.now());
        ints.push(this.#nextSeedInt++);
        ints.push((Math.random() * 2 ** 31) | 0);
        ints.push((Math.random() * 2 ** 31) | 0);
        const seed = JSON.stringify(ints);
        return seed;
    }
}
exports.Random = Random;
function rectUnion(r1, r2) {
    const x = Math.min(r1.x, r2.x);
    const y = Math.min(r1.y, r2.y);
    const right = Math.max(r1.x + r1.width, r2.x + r2.width);
    const bottom = Math.max(r1.y + r1.height, r2.y + r2.height);
    const width = right - x;
    const height = bottom - y;
    return { x, y, width, height };
}
function rectAddPoint(r, x, y) {
    return rectUnion(r, { x, y, width: 0, height: 0 });
}
function dateToFileName(date) {
    if (isNaN(date.getTime())) {
        return "0000⸱00⸱00 00⦂00⦂00";
    }
    else {
        return `${date.getFullYear().toString().padStart(4, "0")}⸱${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}⸱${date.getDate().toString().padStart(2, "0")} ${date
            .getHours()
            .toString()
            .padStart(2, "0")}⦂${date.getMinutes().toString().padStart(2, "0")}⦂${date
            .getSeconds()
            .toString()
            .padStart(2, "0")}`;
    }
}
function lerp(at0, at1, where) {
    return at0 + (at1 - at0) * where;
}
function assertFinite(...values) {
    values.forEach((value) => {
        if (!isFinite(value)) {
            throw new Error("wtf");
        }
    });
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function* zip(...toZip) {
    const iterators = toZip.map((i) => i[Symbol.iterator]());
    while (true) {
        const results = iterators.map((i) => i.next());
        if (results.some(({ done }) => done)) {
            break;
        }
        yield results.map(({ value }) => value);
    }
}
function* count(start = 0, end = Infinity, step = 1) {
    for (let i = start; i < end; i += step) {
        yield i;
    }
}
function initializedArray(count, callback) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(callback(i));
    }
    return result;
}
exports.countMap = initializedArray;
function sum(items) {
    return items.reduce((accumulator, current) => accumulator + current, 0);
}
function makeLinear(x1, y1, x2, y2) {
    const slope = (y2 - y1) / (x2 - x1);
    return function (x) {
        return (x - x1) * slope + y1;
    };
}
function makeBoundedLinear(x1, y1, x2, y2) {
    if (x2 < x1) {
        [x1, y1, x2, y2] = [x2, y2, x1, y1];
    }
    const slope = (y2 - y1) / (x2 - x1);
    return function (x) {
        if (x <= x1) {
            return y1;
        }
        else if (x >= x2) {
            return y2;
        }
        else {
            return (x - x1) * slope + y1;
        }
    };
}
function polarToRectangular(r, θ) {
    return { x: Math.cos(θ) * r, y: Math.sin(θ) * r };
}
function* permutations(toPermute, prefix = []) {
    if (toPermute.length == 0) {
        yield prefix;
    }
    else {
        for (let index = 0; index < toPermute.length; index++) {
            const nextItem = toPermute[index];
            const newPrefix = [...prefix, nextItem];
            const stillNeedToPermute = [
                ...toPermute.slice(0, index),
                ...toPermute.slice(index + 1),
            ];
            yield* permutations(stillNeedToPermute, newPrefix);
        }
    }
}
//# sourceMappingURL=misc.js.map