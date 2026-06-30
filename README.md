# Claude RTL 🪄

**Make Persian & Arabic text render right-to-left in [Claude](https://claude.ai) — the way it's supposed to.**

A featherweight Chrome extension (Manifest V3, zero dependencies, ~60 lines) that fixes the broken bidirectional rendering of RTL languages across the entire Claude web interface: your messages, Claude's streaming responses, and the input box.

<p align="center">
  <img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white">
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-success">
  <img alt="Vanilla JS" src="https://img.shields.io/badge/vanilla-JS-f7df1e?logo=javascript&logoColor=black">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue">
</p>

---

## The problem

Out of the box, Claude renders Persian/Arabic text **left-aligned**, and the moment you mix in English words, numbers, or punctuation, the bidirectional (BiDi) algorithm gives up and the word order falls apart:

```
❌  .می‌کنم استفاده Node.js و React از من
✅  من از React و Node.js استفاده می‌کنم.
```

## The fix

The browser already has a world-class BiDi engine — it just needs to be told each text block's base direction. Claude RTL walks every text block, and if it contains an RTL character, tags it with `dir="auto"`. The browser does the rest, per block, automatically. That's the whole trick.

## Features

- ✅ **Right-aligns** full Persian/Arabic paragraphs, headings, lists, quotes, and tables
- ✅ **Fixes mixed text** — `I use React and Node.js.` inside Persian keeps correct word & punctuation order
- ✅ **Numbers & punctuation** land in the right place at the start/end of a line
- ✅ **Live in the input box** — your Persian typing right-aligns as you type
- ✅ **Streaming-aware** — applies instantly to responses as they arrive, character by character
- 🛡️ **Code stays code** — `pre`/`code` blocks are never touched and remain LTR & left-aligned
- 🪶 **No bloat** — content script only, **no permissions**, no tracking, no network calls, no libraries

## Install (Load unpacked)

1. [Download](../../archive/refs/heads/main.zip) or clone this repo.
2. Open `chrome://extensions` (Edge: `edge://extensions`, Brave: `brave://extensions`).
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked** and select the project folder.
5. Open or reload **claude.ai** — done. ✨

> After editing any file, hit the **↻ reload** icon on the extension card, then reload the Claude tab.

## How it works

| File | Role |
|------|------|
| `manifest.json` | MV3 config — content script scoped to `claude.ai` / `claude.com`, **no permissions** |
| `content.js`    | Detects RTL text and sets `dir="auto"` on each block; a `MutationObserver` handles streaming & SPA navigation |
| `styles.css`    | `text-align: start` so alignment follows direction; guards code blocks back to LTR |

A few deliberate design choices:

- **Resilient to Claude's obfuscated CSS** — selectors are generic block-level tags (`p`, `li`, `h1`–`h6`, `blockquote`, `td`…) and `[contenteditable]`, never hashed class names that change on every deploy.
- **No feedback loop** — the observer watches `childList`/`characterData`/`subtree` but *not* attributes, so writing `dir` never retriggers it.
- **Cheap under heavy streaming** — work is debounced with `requestAnimationFrame` and scoped to the changed region, not the whole page.
- **`dir="auto"` only when needed** — pure-LTR UI (buttons, English text) is left completely alone.

## Develop & test

No build step. Edit the files and reload the extension.

For a quick offline sanity check, open `test.html` directly in a browser — it reproduces a message DOM (Persian, mixed, English, lists, code, an editor) and asserts that `dir` lands on the right elements. All nine lines should read **PASS** in green. `test.html` is not part of the shipped extension (the manifest doesn't reference it) — delete it whenever you like.

## License

MIT — do whatever you want.
