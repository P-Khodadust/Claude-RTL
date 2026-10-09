<div align="center">

<img src="assets/before-after.svg" alt="Persian text in Claude: scrambled and left-aligned today, correct and right-aligned with Claude RTL" width="100%">

### Persian & Arabic, right-to-left on Claude, ChatGPT and Grok, the way it's supposed to be.

<img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white">
<img alt="Zero dependencies" src="https://img.shields.io/badge/dependencies-0-3fb950?style=flat-square">
<img alt="No permissions" src="https://img.shields.io/badge/permissions-none-3fb950?style=flat-square">
<img alt="Vanilla JS" src="https://img.shields.io/badge/vanilla-JS-f7df1e?style=flat-square&logo=javascript&logoColor=black">
<a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square"></a>

[Install](#-install) · [How it works](#-how-it-works) · [Known limits](#-known-limits) · [Develop & test](#-develop--test)

</div>

---

A featherweight browser extension (Manifest V3, about 70 lines of code, zero dependencies) that fixes the
broken bidirectional rendering of RTL languages on **Claude**, **ChatGPT** and **Grok**: your messages, the
streaming responses, and the input box.

## 🤕 The problem

Out of the box, Claude renders Persian/Arabic text **left-aligned**, and as soon as you mix in English
words, numbers or punctuation, the bidirectional (BiDi) algorithm gives up and the word order falls apart:

```
❌  .می‌کنم استفاده Node.js و React از من
✅  من از React و Node.js استفاده می‌کنم.
```

## 🪄 The fix

The browser already has a world-class BiDi engine; it just needs to be told each text block's base
direction. Claude RTL walks every text block that contains RTL text, counts its Persian/Arabic words
against its Latin ones (code excluded), and tags it `dir="rtl"` or `dir="ltr"`. The browser does the
rest, per block, automatically. That's the whole trick.

Why not `dir="auto"`? It picks the direction from the *first* letter, so `React یک کتابخانه است` or a
list item starting with `` `useState` `` comes out left-to-right and scrambled.

## ✨ Features

| | |
|:--|:--|
| 🌐 **Claude, ChatGPT & Grok** | one generic script for all three, no per-site code |
| ➡️ **Right-aligned blocks** | Persian/Arabic paragraphs, headings, lists, quotes and table cells align right |
| 🔀 **Mixed text fixed** | `React` and `Node.js` inside a Persian sentence keep the correct word and punctuation order, even at the start of a line |
| 🔢 **Numbers & punctuation** | land in the right place at the start and end of a line |
| ⌨️ **Live in the input box** | your Persian typing right-aligns as you type |
| ⚡ **Streaming-aware** | applies instantly to responses as they arrive, character by character |
| 🛡️ **Code stays code** | code blocks stay left-to-right; inline `useState()` inside Persian keeps its `()` in place |
| 🪶 **No bloat** | content script only: **no permissions**, no tracking, no network calls, no libraries |

## 📦 Install

1. [Download](../../archive/refs/heads/main.zip) or clone this repo.
2. Open `chrome://extensions` (Edge: `edge://extensions`, Brave: `brave://extensions`).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.
5. Open or reload **claude.ai**, **chatgpt.com** or **grok.com**. Done ✨

> After editing any file, hit the **↻ reload** icon on the extension card, then reload the chat tab.

## 🔧 How it works

| File | Role |
|:--|:--|
| `manifest.json` | MV3 config: content script scoped to `claude.ai` / `claude.com` / `chatgpt.com` / `grok.com`, **no permissions** |
| `content.js` | Votes each block's direction and sets `dir`; a `MutationObserver` handles streaming and SPA navigation |
| `styles.css` | Right-aligns RTL blocks; keeps code (blocks and inline) LTR |

A few deliberate design choices:

- **Resilient to obfuscated CSS.** Selectors are generic block-level tags (`p`, `li`, `h1`–`h6`,
  `blockquote`, `td`…), `[contenteditable]` and `textarea`, never hashed class names that change on every
  deploy. That's also why one script covers all three sites.
- **No feedback loop.** The observer watches `childList`/`characterData`/`subtree` but *not* attributes,
  so writing `dir` never retriggers it.
- **Cheap under heavy streaming.** Work is batched with `requestAnimationFrame` and scoped to the changed
  region, not the whole page.
- **`dir` only when needed.** Pure-LTR UI (buttons, English text) is left completely alone, and a `dir`
  the site set itself is never removed.
- **Hands off the input box's insides.** Claude's and Grok's input boxes are ProseMirror editors, which
  redraw any inner node whose attributes change. Only the editor root gets `dir`.

## 🚧 Known limits

- **One direction per draft.** Because only the input box's root can be touched, the whole draft takes one
  direction: a Persian question followed by a pasted English log is all right-to-left.
- **A heuristic, not a language detector.** A Persian sentence made mostly of English words can still come
  out left-to-right.
- **Tables** keep their left-to-right column order; only the text inside each cell is fixed.
- **Your own messages on ChatGPT and Grok** are only fixed if the site renders them as paragraphs. Not yet
  confirmed in a logged-in session.
- **Grok inside x.com** isn't covered (the script would have to run on all of X); use grok.com.

## 🧪 Develop & test

No build step: edit the files and reload the extension.

For a quick offline check, open `test.html` directly in a browser. It reproduces a message DOM (Persian,
mixed, English, lists, code, streaming text, a ProseMirror-like editor, a textarea) and checks the rendered
direction and character order. Every line should read **PASS** in green. `test.html` isn't part of the
shipped extension (the manifest doesn't reference it).

## 📄 License

[MIT](LICENSE). Do whatever you want. Unofficial; not affiliated with Anthropic, OpenAI or xAI.
