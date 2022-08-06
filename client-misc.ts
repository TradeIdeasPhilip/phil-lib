import { assertClass, makePromise } from "./misc.js";

/**
 * This is a wrapper around document.getElementById().
 * This ensures that we find the element and that it has the right type or it throws an exception.
 * Note that the return type of the function matches the requested type.
 * @param id Look for an element with this id.
 * @param ty This is the type we are expecting.  E.g. HtmlButtonElement
 */
export function getById<T extends Element>(id: string, ty: { new (): T }): T {
  // https://stackoverflow.com/a/64780056/971955
  const found = document.getElementById(id);
  if (!found) {
    throw new Error(
      "Could not find element with id " + id + ".  Expected type:  " + ty.name
    );
  }
  if (found instanceof ty) {
    return found;
  } else {
    throw new Error(
      "Element with id " +
        id +
        " has type " +
        found.constructor.name +
        ".  Expected type:  " +
        ty.name
    );
  }
}

/**
 * Store the given date and time into the given input element.
 * Everything will be displayed in local time, similar to dateAndTime.toString().
 *
 * Going the other way is easy:  `new Date(input.value)`.
 * @param input This should be set to "datetime-local".
 * @param dateAndTime The date and time to load into the input.
 */
export function loadDateTimeLocal(
  input: HTMLInputElement,
  dateAndTime: Date,
  truncateTo: "minutes" | "seconds" | "milliseconds" = "milliseconds"
) {
  // The element will remember this value.
  // If you store a time like '2021-12-08T14:23:01.001', the display and the editor will show seconds and milliseconds.
  // If you store a time like '2021-12-08T14:23:01.000' or '2021-12-08T14:23:01', the display and the editor will show seconds but not milliseconds.
  // If you store a time like '2021-12-08T14:23:00.000' or '2021-12-08T14:23', the display and the editor will show neither seconds nor milliseconds.
  // Changing the time using the GUI will not change which fields are displayed.
  // Note:  Rounding or truncating will only remove fields, not add them.
  // If you want to display "14:23:00.000", and you want the user to be able to set the seconds via the GUI, I don't think that's possible.
  // Note:  I didn't see this documented anywhere.  I learned this by experimenting with Chrome.
  let truncateBy: number;
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
  // This is conversion is surprisingly hard to do.  Advice from MDN and others failed miserably.
  input.valueAsNumber =
    +dateAndTime - dateAndTime.getTimezoneOffset() * 60000 - truncateBy;
}

export function getBlobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  const { reject, resolve, promise } = makePromise<Blob>();
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error("blob is null!"));
    } else {
      resolve(blob);
    }
  });
  return promise;
}

/**
 *
 * @param audioElement The element to control.
 * @returns A function which will control the balance for the given element.
 * * An input of -1 means all left.
 * * 0 means center / both.
 * * 1 means all right.
 * * Values between -1 and 1 are continuously interpolated.
 */
export function getAudioBalanceControl(audioElement: HTMLAudioElement) {
  //https://stackoverflow.com/a/63193575/971955
  const audioContext = new AudioContext();
  // pass the audio element into the audio context
  const track = audioContext.createMediaElementSource(audioElement);
  // default pan set to 0 - center
  const stereoNode = new StereoPannerNode(audioContext, { pan: 0 });
  track.connect(stereoNode).connect(audioContext.destination);
  return (balance: number) => {
    stereoNode.pan.value = balance;
  };
}

/**
 * Reads the hash (a.k.a the fragment) associated with the current url and
 * parses it like a url query string.  E.g. key1=value1&key2=value2.
 *
 * Keys and values are both decoded by normal url rules.
 *
 * I explicitly allow + to be converted to space.  These might be written by hand
 * and + is convenient for that.
 */
export function getHashInfo(): Map<string, string> {
  const result = new Map<string, string>();
  const hashString = /^#?(.*)$/.exec(location.hash.replace("+", "%20"))![1];
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

/**
 *
 * @param htmlString A string to convert into an element.
 * @param ty The type of the result.
 * @returns The element that was created.
 * @throws An `Error` if the new element is not of the given type.  Or if we couldn't create an element at all.
 */
export function createElementFromHTML<T extends object>(
  htmlString: string,
  ty: { new (): T }
) {
  // From https://stackoverflow.com/a/494348/971955
  // From that SO question:
  // It's unfortunate that these solutions are so indirect. I wish the standards committee would specify something similar like: var nodes = document.fromString("<b>Hello</b> <br>");
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  // Change div.firstChild to div.childNodes to support multiple top-level nodes.
  return assertClass(div.firstChild, ty, "createElementFromHTML:");
}
