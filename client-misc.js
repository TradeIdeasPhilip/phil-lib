import { assertClass, makePromise } from "./misc.js";
export function getById(id, ty) {
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
export function loadDateTimeLocal(input, dateAndTime, truncateTo = "milliseconds") {
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
export function getBlobFromCanvas(canvas) {
    const { reject, resolve, promise } = makePromise();
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
export function getAudioBalanceControl(audioElement) {
    const audioContext = new AudioContext();
    const track = audioContext.createMediaElementSource(audioElement);
    const stereoNode = new StereoPannerNode(audioContext, { pan: 0 });
    track.connect(stereoNode).connect(audioContext.destination);
    return (balance) => {
        stereoNode.pan.value = balance;
    };
}
export function getHashInfo() {
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
export function createElementFromHTML(htmlString, ty) {
    var div = document.createElement("div");
    div.innerHTML = htmlString.trim();
    return assertClass(div.firstChild, ty, "createElementFromHTML:");
}
//# sourceMappingURL=client-misc.js.map