"use strict";

(() => {
  // Letter runs (≈ words) in RTL scripts: Hebrew, Arabic, Syriac, Thaana, NKo,
  // the Arabic supplements/extensions, and Hebrew/Arabic presentation forms.
  const RTL_RUN = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC]+/g;
  // Letter runs in every other script: any letter outside the ranges above.
  const LTR_RUN = /[^\P{L}\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC]+/gu;

  // Block-level text containers. Tag names only — never the sites' hashed
  // classes, which change on every deploy.
  const BLOCK_SEL = "p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, dt, dd";
  const EDITOR_SEL = '[contenteditable="true"], textarea';
  const SKIP_SEL = `pre, code, ${EDITOR_SEL}`;

  // Prose only: code is LTR by nature and would outvote the sentence around it.
  function proseText(el) {
    let text = "";
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode()); ) {
      if (!n.parentElement.closest("pre, code")) text += n.data;
    }
    return text;
  }

  // Base direction by word vote, not dir="auto": auto follows the first strong
  // character, so "React یک کتابخانه است" would come out LTR and scrambled.
  // Blocks with no RTL text are left alone: a dir we set earlier is removed,
  // a dir the site set itself is kept.
  // ponytail: word-count vote weighted 2:1 toward RTL, since Persian tech prose
  // borrows lots of English words; swap in a language detector if it misjudges.
  const ours = new WeakSet();
  function setDir(el) {
    const text = el.tagName === "TEXTAREA" ? el.value : proseText(el);
    const rtl = (text.match(RTL_RUN) || []).length;
    const ltr = (text.match(LTR_RUN) || []).length;
    const dir = !rtl ? "" : rtl * 2 >= ltr ? "rtl" : "ltr";
    if (el.dir === dir) return;
    if (dir) {
      el.dir = dir;
      ours.add(el);
    } else if (ours.has(el)) {
      el.removeAttribute("dir");
    }
  }

  function applyDir(root) {
    if (!root || root.nodeType !== 1) return;

    // Input box (ProseMirror on Claude and Grok): set dir on the editor root
    // only. ProseMirror redraws any inner node whose attributes change, which
    // retriggers the observer below — an endless redraw loop.
    const editor = root.closest(EDITOR_SEL);
    if (editor) {
      setDir(editor);
      return;
    }
    root.querySelectorAll(EDITOR_SEL).forEach(setDir);

    // Blocks inside the changed region, plus the blocks around it: streamed
    // text often lands in an inline <strong>/<a>, not in the block itself.
    // ponytail: rescans root's whole subtree, not just the exact added nodes —
    // bounded by the changed region, which during streaming is tiny.
    const blocks = [...root.querySelectorAll(BLOCK_SEL)];
    for (let el = root.closest(BLOCK_SEL); el; el = el.parentElement?.closest(BLOCK_SEL)) {
      blocks.push(el);
    }
    for (const el of blocks) if (!el.closest(SKIP_SEL)) setDir(el);
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

  // Typing in a <textarea> (ChatGPT's input box) changes its value, not the
  // DOM, so the observer never sees it.
  document.addEventListener("input", (e) => {
    if (e.target.tagName === "TEXTAREA") setDir(e.target);
  }, true);
})();
