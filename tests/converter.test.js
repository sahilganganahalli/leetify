const test = require("node:test");
const assert = require("node:assert/strict");
const { convert, MAP } = require("../src/js/converter.js");

// ---- The eight cases from the project brief --------------------------------
const briefCases = [
  ["Test 1", "I am Sahil", "1 4M 54H1L"],
  ["Test 2", "Hello World!", "H3LL0 W0RLD!"],
  ["Test 3", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "48CD3F6H1JKLMN09QR57UVWXY2"],
  ["Test 4", "Statistics and Data Analysis", "57471571C5 4ND D474 4N4LY515"],
  ["Test 5", "I love coding.", "1 L0V3 C0D1N6."],
  ["Test 6", "Hello,\nWorld!", "H3LL0,\nW0RLD!"],
  ["Test 7", "12345 !?", "12345 !?"],
  ["Test 8", "", ""],
];
for (const [name, input, expected] of briefCases) {
  test(`${name}: ${JSON.stringify(input)}`, () => {
    assert.equal(convert(input), expected);
  });
}

// ---- Mapping is exactly what the brief specifies ---------------------------
test("mapping table matches the specification exactly", () => {
  assert.deepEqual(
    { ...MAP },
    { A: "4", B: "8", E: "3", G: "6", I: "1", O: "0", P: "9", S: "5", T: "7", Z: "2" }
  );
});

test("every non-mapped letter is kept (uppercased) with no extra substitutions", () => {
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    const expected = MAP[letter] ?? letter;
    assert.equal(convert(letter), expected, `upper ${letter}`);
    assert.equal(convert(letter.toLowerCase()), expected, `lower ${letter}`);
  }
});

// ---- Preservation rules ----------------------------------------------------
test("existing digits are never altered", () => {
  assert.equal(convert("0123456789"), "0123456789");
});

test("no double conversion: produced digits are not re-processed", () => {
  const once = convert("Statistics and Data Analysis");
  assert.equal(convert(once), once); // idempotent
});

test("multiple spaces, tabs and blank lines survive", () => {
  assert.equal(convert("a   b\t\tc\n\n\nd"), "4   8\t\tC\n\n\nD");
});

test("Windows (CRLF) line breaks survive", () => {
  assert.equal(convert("Hi\r\nthere"), "H1\r\n7H3R3");
});

test("punctuation is preserved", () => {
  assert.equal(convert("Yes, no. Why? Because: so; ok!"), "Y35, N0. WHY? 83C4U53: 50; 0K!");
});

test("emoji and other Unicode are preserved", () => {
  assert.equal(convert("Hello 👋🏽 café"), "H3LL0 👋🏽 C4FÉ");
});

test("words that collide with JavaScript object keys are safe", () => {
  assert.equal(convert("constructor"), "C0N57RUC70R");
  assert.equal(convert("__proto__"), "__9R070__");
  assert.equal(convert("toString"), "7057R1N6");
});

test("null and undefined give an empty string", () => {
  assert.equal(convert(null), "");
  assert.equal(convert(undefined), "");
});

test("handles a very long passage quickly", () => {
  const start = Date.now();
  const out = convert("a".repeat(1_000_000));
  assert.equal(out.length, 1_000_000);
  assert.equal(out[0], "4");
  assert.ok(Date.now() - start < 1000, "should take well under a second");
});

// ---- Documented behaviour of the "uppercase first" rule --------------------
test("Unicode uppercasing happens before substitution (ß -> SS -> 55)", () => {
  assert.equal(convert("ß"), "55");
});
