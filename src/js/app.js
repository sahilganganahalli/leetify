/* UI wiring. All work happens in the browser; nothing is sent anywhere. */
(function () {
  "use strict";

  const { convert, MAP } = window.Leetify;
  const config = window.LEETIFY_CONFIG || {};

  const $ = (id) => document.getElementById(id);
  const inputEl = $("input");
  const outputEl = $("output");
  const countEl = $("count");
  const pasteBtn = $("paste-btn");
  const clearBtn = $("clear-btn");
  const copyBtn = $("copy-btn");
  const downloadBtn = $("download-btn");
  const selectBtn = $("select-btn");
  const themeBtn = $("theme-toggle");
  const toastEl = $("toast");

  let currentOutput = "";

  /* ---------- Branding (from config.js) ---------- */
  function applyBrand() {
    const name = config.name || "LEETIFY";
    const tagline = config.tagline || "Your words. A different code.";
    document.querySelectorAll("[data-brand-name]").forEach((el) => (el.textContent = name));
    document.querySelectorAll("[data-tagline]").forEach((el) => (el.textContent = tagline));
    document.querySelectorAll("[data-brand-mark]").forEach((el) => {
      if (config.logoMark) el.textContent = config.logoMark;
    });
    const brandLink = document.querySelector(".brand");
    if (brandLink) brandLink.setAttribute("aria-label", name + " home");
    document.title = name + " — " + tagline;
  }

  /* ---------- Live conversion ---------- */
  function update() {
    const text = inputEl.value;
    currentOutput = convert(text);
    // Only the output box is ever written to while typing, so the caret in the input never moves.
    if (outputEl.value !== currentOutput) outputEl.value = currentOutput;

    const n = Array.from(text).length;
    countEl.textContent = n.toLocaleString() + (n === 1 ? " character" : " characters");

    const empty = text.length === 0;
    clearBtn.disabled = empty;
    copyBtn.disabled = empty;
    downloadBtn.disabled = empty;
    selectBtn.disabled = empty;
  }

  /* ---------- Feedback ---------- */
  let toastTimer;
  let toastClearTimer;
  function toast(message, kind) {
    clearTimeout(toastTimer);
    clearTimeout(toastClearTimer);
    toastEl.textContent = message;
    toastEl.dataset.kind = kind || "ok";
    toastEl.classList.add("is-visible");
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
      toastClearTimer = setTimeout(() => (toastEl.textContent = ""), 250);
    }, kind === "error" ? 5000 : 2000);
  }

  function flashLabel(btn, text) {
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.textContent = text;
    clearTimeout(btn._flash);
    btn._flash = setTimeout(() => (btn.textContent = btn.dataset.label), 1800);
  }

  /* ---------- Copy ---------- */
  function legacyCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    let ok = false;
    try { ok = !!(document.execCommand && document.execCommand("copy")); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  async function copyOutput() {
    if (!currentOutput) return;
    let ok = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { await navigator.clipboard.writeText(currentOutput); ok = true; } catch (e) { ok = false; }
    }
    if (!ok) ok = legacyCopy(currentOutput);

    if (ok) {
      toast("Copied!");
      flashLabel(copyBtn, "Copied!");
    } else {
      selectOutput();
      toast("Couldn't copy automatically. The text is selected, so press Ctrl+C (Cmd+C on Mac).", "error");
    }
  }

  /* ---------- Paste ---------- */
  async function pasteIntoInput() {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      inputEl.focus();
      toast("This browser can't paste with a button. Click the text box and press Ctrl+V (Cmd+V on Mac).", "error");
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast("Your clipboard is empty.");
        return;
      }
      inputEl.focus();
      inputEl.setRangeText(text, inputEl.selectionStart, inputEl.selectionEnd, "end");
      update();
    } catch (e) {
      inputEl.focus();
      toast("Clipboard access was blocked. Click the text box and press Ctrl+V (Cmd+V on Mac) instead.", "error");
    }
  }

  /* ---------- Clear / Select / Download ---------- */
  function clearAll() {
    inputEl.value = "";
    update();
    inputEl.focus();
  }

  function selectOutput() {
    outputEl.focus();
    outputEl.select();
    outputEl.setSelectionRange(0, outputEl.value.length); // iOS needs this
  }

  function downloadOutput() {
    if (!currentOutput) return;
    const blob = new Blob([currentOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = config.downloadFilename || "converted-text.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Download started.");
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0e1113" : "#f4f6f5");
  }

  function toggleTheme() {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("leetify-theme", next); } catch (e) { /* storage unavailable: fine */ }
  }

  /* ---------- Mapping reference (drawn from the real MAP) ---------- */
  function renderMapping() {
    const list = $("mapping");
    list.textContent = "";
    Object.keys(MAP).forEach((letter) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<span class="mapping__from"></span>' +
        '<span class="mapping__arrow" aria-hidden="true">→</span>' +
        '<span class="sr-only"> becomes </span>' +
        '<span class="mapping__to"></span>';
      li.querySelector(".mapping__from").textContent = letter;
      li.querySelector(".mapping__to").textContent = MAP[letter];
      list.appendChild(li);
    });
  }

  function renderExample() {
    const sample = $("example-in").textContent;
    $("example-out").textContent = convert(sample);
  }

  /* ---------- Init ---------- */
  applyBrand();
  applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  renderMapping();
  renderExample();

  inputEl.addEventListener("input", update); // typing, paste, cut, delete, drag-drop, IME
  pasteBtn.addEventListener("click", pasteIntoInput);
  clearBtn.addEventListener("click", clearAll);
  copyBtn.addEventListener("click", copyOutput);
  downloadBtn.addEventListener("click", downloadOutput);
  selectBtn.addEventListener("click", selectOutput);
  themeBtn.addEventListener("click", toggleTheme);
  update();
})();
