"use strict";

(() => {
  // Any character in the Hebrew / Arabic / Syriac / Thaana / Arabic-supplement /
  // Arabic presentation-forms ranges. One match is enough to call a block RTL.
  const RTL_RE = /[֐-׿؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

  // Block-level text containers. Tag names only — never Claude's hashed classes.
  const BLOCK_SEL = "p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, dt, dd";
  const EDITOR_SEL = '[contenteditable="true"]';

  function tagBlock(el) {
    if (el.dir === "auto") return;          // idempotent — already handled
    if (el.closest("pre, code")) return;    // never touch code; keep it LTR
    if (RTL_RE.test(el.textContent)) el.dir = "auto";
  }

  // Tag every relevant element inside (and including) `root`.
  // ponytail: rescans root's whole subtree, not just the exact added nodes —
  // bounded by the changed region, which during streaming is tiny.
  function applyDir(root) {
    if (!root || root.nodeType !== 1) return;

    // Input editors get dir=auto unconditionally so empty/LTR input still
    // flips to RTL from the first strong character the user types.
    if (root.matches(EDITOR_SEL)) root.dir = "auto";
    root.querySelectorAll(EDITOR_SEL).forEach((el) => { el.dir = "auto"; });

    // Text blocks get dir=auto only when they actually contain an RTL char,
    // so buttons and other pure-LTR UI are left alone.
    if (root.matches(BLOCK_SEL)) tagBlock(root);
    root.querySelectorAll(BLOCK_SEL).forEach(tagBlock);
  }

  // One full pass for whatever is already on the page.
  applyDir(document.body);

  // Streaming responses + SPA navigation: collect changed regions and process
  // them once per animation frame so heavy character-by-character updates stay cheap.
  const pending = new Set();
  let scheduled = false;

  function flush() {
    scheduled = false;
    const nodes = [...pending];
    pending.clear();
    for (const node of nodes) applyDir(node);
  }

  // We observe childList/characterData/subtree but NOT attributes, so writing
  // `dir` can never retrigger this observer — no feedback loop.
  const observer = new MutationObserver((records) => {
    for (const r of records) {
      const node = r.type === "characterData" ? r.target.parentElement : r.target;
      if (node && node.nodeType === 1) pending.add(node);
    }
    if (pending.size && !scheduled) {
      scheduled = true;
      requestAnimationFrame(flush);
    }
  });

  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
})();
