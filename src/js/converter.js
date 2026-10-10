/*!
 * Conversion core: English text -> uppercase alphanumeric "leetspeak".
 * Pure and dependency-free. Works as a browser global (window.Leetify)
 * and as a CommonJS module (require) so it can be unit-tested in Node.
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.Leetify = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // The one and only substitution table. The UI reads this same object to draw
  // the "Conversion rules" grid, so the reference can never drift from the logic.
  var MAP = Object.freeze({
    A: "4",
    B: "8",
    E: "3",
    G: "6",
    I: "1",
    O: "0",
    P: "9",
    S: "5",
    T: "7",
    Z: "2",
  });

  // Matches exactly the ten mapped capital letters, nothing else.
  var PATTERN = new RegExp("[" + Object.keys(MAP).join("") + "]", "g");

  /**
   * Convert text: uppercase first, then substitute in a single pass.
   * Because the substitution runs once over the already-uppercased string,
   * a digit that was just produced is never looked at again.
   *
   * @param {string} input
   * @returns {string}
   */
  function convert(input) {
    if (input === null || input === undefined) return "";
    // toUpperCase (not toLocaleUpperCase) keeps the result identical on every device.
    var upper = String(input).toUpperCase();
    return upper.replace(PATTERN, function (letter) {
      return MAP[letter];
    });
  }

  return { convert: convert, MAP: MAP };
});
