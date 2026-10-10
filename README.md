# LEETIFY (Riito Webapp)

> Your words. A different code.

A fast, private, real-time converter that turns English text into uppercase alphanumeric "leetspeak". Type or paste on the left and the result appears on the right instantly. No button, no reload, no server.

```
I am Sahil                      ->  1 4M 54H1L
Hello World!                    ->  H3LL0 W0RLD!
Statistics and Data Analysis    ->  57471571C5 4ND D474 4N4LY515
```

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies. Open `src/index.html` and it works.

## How the conversion works

1. Convert the whole input to uppercase with `String.prototype.toUpperCase()`.
2. Replace the ten mapped letters in **one pass** over that uppercased string, using the table below.
3. Return the result.

| Letter | A | B | E | G | I | O | P | S | T | Z |
|---|---|---|---|---|---|---|---|---|---|---|
| Becomes | 4 | 8 | 3 | 6 | 1 | 0 | 9 | 5 | 7 | 2 |

Everything else is untouched: other letters (kept as capitals), spaces, repeated spaces, line breaks, punctuation, existing digits, emoji and other Unicode.

Because the replacement happens once, a digit that was just produced is never treated as an original letter. The function is in [`src/js/converter.js`](src/js/converter.js) (about 15 lines of logic). The mapping table there is the single source of truth: the "Conversion rules" grid on the page is drawn from the same object, so the reference can never disagree with the behaviour.

## Features

- Live output on every keystroke, paste, cut, delete or drag-and-drop. The output box is separate and read-only, so the cursor in your input never jumps.
- **Paste** (Clipboard API, with a helpful message if the browser blocks it), **Clear**, character count.
- **Copy Output** (with a "Copied!" confirmation and a fallback for older browsers), **Download .txt** (`converted-text.txt`), **Select All**.
- Dark theme by default (charcoal with neon green), light theme toggle, follows your system preference on first visit.
- Responsive: side by side on wide screens, stacked on phones. 44px touch targets, visible focus rings, labelled controls, skip link, reduced-motion support, WCAG AA contrast in both themes.
- Private: conversion happens in your browser. No analytics, no external fonts or scripts, no network requests after the page loads. Your text is never stored; only the light/dark choice is saved in `localStorage`.

## Project structure

```
riito-webapp/
├── .github/workflows/deploy.yml   Runs tests, then deploys src/ to GitHub Pages
├── src/                           The entire website (this folder is what gets published)
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── config.js              Name, tagline, logo badge text, download filename
│       ├── converter.js           The conversion function and mapping table
│       └── app.js                 UI wiring: live update, copy, paste, download, theme
├── tests/converter.test.js        Unit tests (built-in Node test runner, no packages)
├── package.json
├── LICENSE
└── README.md
```

## Run locally

You need nothing installed to try it: double-click `src/index.html`.

For a proper local server (closer to how it behaves when deployed), from the project folder:

```bash
python3 -m http.server 8080 --directory src
# then open http://localhost:8080
```

(On Windows, use `python` instead of `python3`.)

## Run the tests

Requires Node.js 18 or newer.

```bash
npm test
```

No `npm install` is needed because there are no dependencies. The suite covers the eight cases from the project brief plus edge cases (see "Tests" below).

## Customise

- **Name, tagline, logo badge, download filename:** edit `src/js/config.js`.
- **Page title and link-preview description:** edit the `<title>` and `<meta name="description">` in `src/index.html` (search engines read the HTML, not the JavaScript).
- **Colours:** change the variables at the top of `src/css/styles.css` (`--accent` and friends, with separate sets for dark and light).
- **Mapping:** edit `MAP` in `src/js/converter.js`. The rules grid updates by itself. Update the tests and the table in this README to match.

## Put it on GitHub

1. Create a GitHub account if you don't have one, then click **New repository**. Name it (for example `riito-webapp`), set it to **Public**, and do **not** tick "Add a README" (this project already has one).
2. In a terminal, inside the project folder:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/riito-webapp.git
   git push -u origin main
   ```

   Prefer a visual tool? [GitHub Desktop](https://desktop.github.com/) can publish the folder too. If you upload through the website, make sure the hidden `.github` folder comes along, because it contains the deployment workflow.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` runs the tests and then publishes the `src/` folder.

1. On GitHub, open your repository, then **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Go to the **Actions** tab. If the first run (triggered by your push) failed because Pages wasn't enabled yet, open it and click **Re-run all jobs**. You can also start it any time with **Run workflow**.
4. When the run turns green, your site is live at:

   ```
   https://<your-username>.github.io/riito-webapp/
   ```

The site is not hosted at the domain root, so every asset path in `index.html` is relative (`css/styles.css`, `js/app.js`). No base-path setting is needed, and the same files work on a custom domain too.

## Update and redeploy

Edit files, then:

```bash
npm test                      # optional but recommended
git add .
git commit -m "Describe your change"
git push
```

Each push to `main` redeploys automatically, usually within a minute or two. If you don't see your change, hard-refresh the page (Ctrl+Shift+R, or Cmd+Shift+R on Mac).

## Tests

`tests/converter.test.js` checks:

| # | Input | Expected |
|---|---|---|
| 1 | `I am Sahil` | `1 4M 54H1L` |
| 2 | `Hello World!` | `H3LL0 W0RLD!` |
| 3 | `ABCDEFGHIJKLMNOPQRSTUVWXYZ` | `48CD3F6H1JKLMN09QR57UVWXY2` |
| 4 | `Statistics and Data Analysis` | `57471571C5 4ND D474 4N4LY515` |
| 5 | `I love coding.` | `1 L0V3 C0D1N6.` |
| 6 | `Hello,` + newline + `World!` | `H3LL0,` + newline + `W0RLD!` |
| 7 | `12345 !?` | `12345 !?` |
| 8 | empty string | empty string |

Plus: the mapping table equals the specification exactly; all 26 letters in upper and lower case (unmapped letters are only uppercased); digits unchanged; converting an already-converted string changes nothing; repeated spaces, tabs, blank lines and CRLF line breaks; punctuation; emoji and accented letters; words like `constructor` and `__proto__`; `null`/`undefined`; and a one-million-character input finishing in under a second.

## Known limitations

- **"Uppercase first" is applied to all Unicode.** A few characters expand when uppercased, so `ß` becomes `SS` and then `55`. Accented letters such as `é` become `É` and are otherwise left alone. This follows the conversion order exactly as specified.
- **Only the ten listed letters are replaced.** There is intentionally no reverse (number-to-letter) conversion, and the output can't be decoded back reliably, since the original case and the original digits are lost.
- **Paste button support varies.** It needs a secure context (HTTPS or localhost) and clipboard permission. Where blocked, the app says so and you can paste with Ctrl+V / Cmd+V. Firefox and Safari may show their own small "Paste" prompt.
- **Line endings.** Browsers normalise line breaks in text boxes to `\n`, so a downloaded file uses `\n` line breaks even if you pasted `\r\n`. Modern editors, including Notepad, display this correctly.

## Licence

MIT. See [LICENSE](LICENSE).
