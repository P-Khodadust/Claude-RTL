<div align="center">

<img src="assets/before-after.svg" alt="Persian text in Claude: scrambled and left-aligned today, correct and right-aligned with Claude RTL" width="100%">

### Persian & Arabic, right-to-left on claude.ai, the way it's supposed to be.

<img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white">
<img alt="Zero dependencies" src="https://img.shields.io/badge/dependencies-0-3fb950?style=flat-square">
<img alt="No permissions" src="https://img.shields.io/badge/permissions-none-3fb950?style=flat-square">
<img alt="Vanilla JS" src="https://img.shields.io/badge/vanilla-JS-f7df1e?style=flat-square&logo=javascript&logoColor=black">
<a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square"></a>

[Install](#-install) · [How it works](#-how-it-works) · [Develop & test](#-develop--test)

</div>

---

A featherweight browser extension (Manifest V3, about 40 lines of code, zero dependencies) that fixes the
broken bidirectional rendering of RTL languages across the whole Claude web interface: your messages,
Claude's streaming responses, and the input box.

## 🤕 The problem

Out of the box, Claude renders Persian/Arabic text **left-aligned**, and as soon as you mix in English
words, numbers or punctuation, the bidirectional (BiDi) algorithm gives up and the word order falls apart:

```
❌  .می‌کنم استفاده Node.js و React از من
✅  من از React و Node.js استفاده می‌کنم.
```

## 🪄 The fix

The browser already has a world-class BiDi engine; it just needs to be told each text block's base
direction. Claude RTL walks every text block, and if it contains an RTL character, tags it with
`dir="auto"`. The browser does the rest, per block, automatically. That's the whole trick.

## ✨ Features

| | |
|:--|:--|
| ➡️ **Right-aligned blocks** | Persian/Arabic paragraphs, headings, lists, quotes and tables align right |
| 🔀 **Mixed text fixed** | `React` and `Node.js` inside a Persian sentence keep the correct word and punctuation order |
| 🔢 **Numbers & punctuation** | land in the right place at the start and end of a line |
| ⌨️ **Live in the input box** | your Persian typing right-aligns as you type |
| ⚡ **Streaming-aware** | applies instantly to responses as they arrive, character by character |
| 🛡️ **Code stays code** | `pre`/`code` blocks are never touched and stay left-to-right |
| 🪶 **No bloat** | content script only: **no permissions**, no tracking, no network calls, no libraries |

## 📦 Install

1. [Download](../../archive/refs/heads/main.zip) or clone this repo.
2. Open `chrome://extensions` (Edge: `edge://extensions`, Brave: `brave://extensions`).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.
5. Open or reload **claude.ai**. Done ✨

> After editing any file, hit the **↻ reload** icon on the extension card, then reload the Claude tab.

## 🔧 How it works

| File | Role |
|:--|:--|
| `manifest.json` | MV3 config: content script scoped to `claude.ai` / `claude.com`, **no permissions** |
| `content.js` | Detects RTL text and sets `dir="auto"` on each block; a `MutationObserver` handles streaming and SPA navigation |
| `styles.css` | `text-align: start` so alignment follows direction; keeps code blocks LTR |

A few deliberate design choices:

- **Resilient to Claude's obfuscated CSS.** Selectors are generic block-level tags (`p`, `li`, `h1`–`h6`,
  `blockquote`, `td`…) and `[contenteditable]`, never hashed class names that change on every deploy.
- **No feedback loop.** The observer watches `childList`/`characterData`/`subtree` but *not* attributes,
  so writing `dir` never retriggers it.
- **Cheap under heavy streaming.** Work is batched with `requestAnimationFrame` and scoped to the changed
  region, not the whole page.
- **`dir="auto"` only when needed.** Pure-LTR UI (buttons, English text) is left completely alone.

## 🧪 Develop & test

No build step: edit the files and reload the extension.

For a quick offline check, open `test.html` directly in a browser. It reproduces a message DOM (Persian,
mixed, English, lists, code, an editor) and asserts that `dir` lands on the right elements. All nine lines
should read **PASS** in green. `test.html` isn't part of the shipped extension (the manifest doesn't
reference it).

## 📄 License

[MIT](LICENSE). Do whatever you want. Unofficial; not affiliated with Anthropic.
