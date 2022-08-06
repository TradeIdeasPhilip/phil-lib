export function assertClass(item, ty, notes = "Assertion Failed.") {
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
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export function testXml(xmlStr) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xmlStr, "application/xml");
    for (const element of Array.from(dom.querySelectorAll("parsererror"))) {
        if (element instanceof HTMLElement) {
            return { error: element };
        }
    }
    return { parsed: dom };
}
export function parseXml(bytes) {
    if (bytes === undefined) {
        return undefined;
    }
    else {
        const parsed = testXml(bytes);
        return parsed?.parsed?.documentElement;
    }
}
export function followPath(from, ...path) {
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
export function getAttribute(attributeName, from, ...path) {
    from = followPath(from, ...path);
    if (from === undefined) {
        return undefined;
    }
    if (!from.hasAttribute(attributeName)) {
        return undefined;
    }
    return from.getAttribute(attributeName) ?? undefined;
}
export function parseFloatX(source) {
    if (source === undefined || source === null) {
        return undefined;
    }
    const result = parseFloat(source);
    if (isFinite(result)) {
        return result;
    }
    else {
        return undefined;
    }
}
export function parseIntX(source) {
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
export function parseTimeT(source) {
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
export const csvStringToArray = (data) => {
    const re = /(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi;
    const result = [[]];
    let matches;
    while ((matches = re.exec(data))) {
        if (matches[1].length && matches[1] !== ',')
            result.push([]);
        result[result.length - 1].push(matches[2] !== undefined ? matches[2].replace(/""/g, '"') : matches[3]);
    }
    return result;
};
export function pickAny(set) {
    const first = set.values().next();
    if (first.done) {
        return undefined;
    }
    else {
        return first.value;
    }
}
export function pick(array) {
    return array[(Math.random() * array.length) | 0];
}
export function filterMap(input, transform) {
    const result = [];
    input.forEach((input, index) => {
        const possibleElement = transform(input, index);
        if (undefined !== possibleElement) {
            result.push(possibleElement);
        }
    });
    return result;
}
export function makePromise() {
    let resolve;
    let reject;
    const promise = new Promise((resolve1, reject1) => {
        resolve = resolve1;
        reject = reject1;
    });
    return { promise, resolve, reject };
}
export const MAX_DATE = new Date(8640000000000000);
export const MIN_DATE = new Date(-8640000000000000);
export function dateIsValid(date) {
    return isFinite(date.getTime());
}
export const NON_BREAKING_SPACE = "\xa0";
export const FIGURE_SPACE = "\u2007";
export function* zip(...toZip) {
    const iterators = toZip.map((i) => i[Symbol.iterator]());
    while (true) {
        const results = iterators.map((i) => i.next());
        if (results.some(({ done }) => done)) {
            break;
        }
        yield results.map(({ value }) => value);
    }
}
export function* count(start = 0, end = Infinity, step = 1) {
    for (let i = start; i < end; i += step) {
        yield i;
    }
}
export function initializedArray(count, callback) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(callback(i));
    }
    return result;
}
export const countMap = initializedArray;
export function sum(items) {
    return items.reduce((accumulator, current) => accumulator + current, 0);
}
export function makeLinear(x1, y1, x2, y2) {
    const slope = (y2 - y1) / (x2 - x1);
    return function (x) {
        return (x - x1) * slope + y1;
    };
}
export function makeBoundedLinear(x1, y1, x2, y2) {
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
export function polarToRectangular(r, θ) {
    return { x: Math.sin(θ) * r, y: Math.cos(θ) * r };
}
//# sourceMappingURL=misc.js.map