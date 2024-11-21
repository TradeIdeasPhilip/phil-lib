"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationLoop = void 0;
exports.getById = getById;
exports.loadDateTimeLocal = loadDateTimeLocal;
exports.getBlobFromCanvas = getBlobFromCanvas;
exports.getAudioBalanceControl = getAudioBalanceControl;
exports.getHashInfo = getHashInfo;
exports.createElementFromHTML = createElementFromHTML;
exports.download = download;
const misc_js_1 = require("./misc.js");
function getById(id, ty) {
    const found = document.getElementById(id);
    if (!found) {
        throw new Error("Could not find element with id " + id + ".  Expected type:  " + ty.name);
    }
    if (found instanceof ty) {
        return found;
    }
    else {
        throw new Error("Element with id " +
            id +
            " has type " +
            found.constructor.name +
            ".  Expected type:  " +
            ty.name);
    }
}
function loadDateTimeLocal(input, dateAndTime, truncateTo = "milliseconds") {
    let truncateBy;
    switch (truncateTo) {
        case "minutes": {
            truncateBy =
                dateAndTime.getSeconds() * 1000 + dateAndTime.getMilliseconds();
            break;
        }
        case "seconds": {
            truncateBy = dateAndTime.getMilliseconds();
            break;
        }
        case "milliseconds": {
            truncateBy = 0;
            break;
        }
        default: {
            throw new Error("wtf");
        }
    }
    input.valueAsNumber =
        +dateAndTime - dateAndTime.getTimezoneOffset() * 60000 - truncateBy;
}
function getBlobFromCanvas(canvas) {
    const { reject, resolve, promise } = (0, misc_js_1.makePromise)();
    canvas.toBlob((blob) => {
        if (!blob) {
            reject(new Error("blob is null!"));
        }
        else {
            resolve(blob);
        }
    });
    return promise;
}
function getAudioBalanceControl(audioElement) {
    const audioContext = new AudioContext();
    const track = audioContext.createMediaElementSource(audioElement);
    const stereoNode = new StereoPannerNode(audioContext, { pan: 0 });
    track.connect(stereoNode).connect(audioContext.destination);
    return (balance) => {
        stereoNode.pan.value = balance;
    };
}
function getHashInfo() {
    const result = new Map();
    const hashString = /^#?(.*)$/.exec(location.hash.replace("+", "%20"))[1];
    const pairs = hashString.split("&");
    pairs.forEach((pair) => {
        const kvp = pair.split("=", 2);
        if (kvp.length == 2) {
            const key = decodeURIComponent(kvp[0]);
            const value = decodeURIComponent(kvp[1]);
            result.set(key, value);
        }
    });
    return result;
}
function createElementFromHTML(htmlString, ty) {
    var div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    return (0, misc_js_1.assertClass)(div.firstChild, ty, "createElementFromHTML:");
}
function download(filename, text) {
    var pom = document.createElement("a");
    pom.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    pom.setAttribute("download", filename);
    if (document.createEvent) {
        var event = document.createEvent("MouseEvents");
        event.initEvent("click", true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}
class AnimationLoop {
    onWake;
    constructor(onWake) {
        this.onWake = onWake;
        this.callback = this.callback.bind(this);
        requestAnimationFrame(this.callback);
    }
    #cancelled = false;
    cancel() {
        this.#cancelled = true;
    }
    callback(time) {
        if (!this.#cancelled) {
            requestAnimationFrame(this.callback);
            this.onWake(time);
        }
    }
}
exports.AnimationLoop = AnimationLoop;
//# sourceMappingURL=client-misc.js.map