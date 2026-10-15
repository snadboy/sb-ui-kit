/* SB UI Kit — the ONE copy of the row style shared by the SB cards (sb-scheduler-card,
 * sb-watch-card, sb-background) and their sidebar pages.
 *
 * Served by the sb_ui_kit integration and loaded on EVERY page (add_extra_js_url), so it is
 * there on dashboards and on the SB Watch / SB Background sidebar pages alike. sb_scheduler,
 * sb_watch and sb_background list sb_ui_kit as a manifest dependency, so HA always loads it.
 *
 * API (window.SBKit, api 1 — only ADD to it; a card checks `api >= 1`):
 *   sheet        CSSStyleSheet — adopt it: shadowRoot.adoptedStyleSheets = [SBKit.sheet, …]
 *   cssText      the same CSS as text (for a <style> where adopting is not possible)
 *   kbIcon       the ⋮ icon markup
 *   menu(label, items)  → a ⋮ menu's HTML; items: {act, icon, label, danger?, disabled?} | "-"
 *   away(close)  → unsubscribe; calls close() on the next outside click or Escape
 *   esc(s)       HTML-escape
 * A card that loads first waits for the window event "sb-ui-kit-ready".
 * 0.2.0 (api 1, additive): .sbk-row.dense (compact rows), .sbk-ico.sm (32 px icon),
 *   .sbk-ico.hit (an icon that is its own control: pointer + ring on hover),
 *   .sbk-kb.dim / [disabled], .sbk-kb.on-state (a toggled-on header button).
 *
 * The style (agreed 2026-10-14 from a canvas mockup): header = title · count · + Add · ⋮;
 * row = status icon (tint armed/run/idle/warn/bad; switched-off rows dimmed) · name · one
 * summary line (chip + what it is doing now) · third line only for a warning/problem ·
 * Enabled toggle · ⋮ (Edit, Duplicate, Run now|Restart|Details, Delete… → inline confirm).
 * Tap the row = edit. Theme variables + color-mix, so light themes work.
 */
(() => {
  const VERSION = "0.2.0";
  if (window.SBKit && window.SBKit.version === VERSION) return;
  const CSS = `
ha-card { overflow: visible; }
.sbk-head { display: flex; align-items: center; gap: 8px; padding: 12px 4px 8px 16px; }
.sbk-head h2 { margin: 0; font-size: 20px; font-weight: 500; line-height: 1.2; }
.sbk-count { flex: 1; font-size: 13px; color: var(--secondary-text-color); white-space: nowrap; }
.sbk-add { display: inline-flex; align-items: center; gap: 4px; height: 36px; padding: 0 14px 0 10px; border-radius: 18px; border: none;
           background: color-mix(in srgb, var(--primary-color) 16%, transparent); color: var(--primary-color);
           font: inherit; font-size: 14px; font-weight: 500; cursor: pointer; --mdc-icon-size: 18px; }
.sbk-kb { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; border: none; background: none; padding: 0;
          color: var(--secondary-text-color); border-radius: 22px; cursor: pointer; flex: 0 0 44px; --mdc-icon-size: 20px; }
.sbk-kb:hover, .sbk-kb.on { background: color-mix(in srgb, var(--primary-text-color) 10%, transparent); }
.sbk-row { position: relative; display: flex; align-items: center; gap: 4px; padding: 0 4px 0 12px; border-top: 1px solid var(--divider-color); min-height: 68px; }
.sbk-row.off .sbk-open { opacity: .5; }
.sbk-open { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; padding: 10px 0; border: none; background: none;
            text-align: left; color: inherit; font: inherit; cursor: pointer; border-radius: 8px; }
.sbk-ico { width: 40px; height: 40px; border-radius: 20px; display: flex; align-items: center; justify-content: center; flex: 0 0 40px; --mdc-icon-size: 22px; }
.sbk-ico.armed { background: color-mix(in srgb, var(--primary-color) 16%, transparent); color: var(--primary-color); }
.sbk-ico.run { background: color-mix(in srgb, var(--success-color, #43a047) 20%, transparent); color: var(--success-color, #43a047); }
.sbk-ico.idle { background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); color: var(--secondary-text-color); }
.sbk-ico.warn { background: color-mix(in srgb, var(--warning-color, #ffa600) 18%, transparent); color: var(--warning-color, #ffa600); }
.sbk-ico.bad { background: color-mix(in srgb, var(--error-color, #db4437) 20%, transparent); color: var(--error-color, #db4437); }
.sbk-txt { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.sbk-t { font-size: 15px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--primary-text-color); }
.sbk-s { display: flex; align-items: center; flex-wrap: wrap; gap: 2px 6px; font-size: 13px; line-height: 1.35; color: var(--secondary-text-color); }
.sbk-chip { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 10px; flex: 0 0 auto;
            background: color-mix(in srgb, var(--primary-color) 16%, transparent); color: var(--primary-color); }
.sbk-dot { width: 3px; height: 3px; border-radius: 2px; background: var(--secondary-text-color); opacity: .7; flex: 0 0 3px; }
.sbk-m { font-size: 12.5px; line-height: 1.35; white-space: normal; }
.sbk-m.bad { color: var(--error-color, #db4437); }
.sbk-m.warn { color: var(--warning-color, #ffa600); }
.sbk-sw { position: relative; width: 40px; height: 24px; flex: 0 0 40px; margin: 0 4px; }
.sbk-sw input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: pointer; z-index: 1; }
.sbk-sw span { position: absolute; inset: 0; border-radius: 12px; background: var(--disabled-color, #9e9e9e); pointer-events: none; transition: background .15s; }
.sbk-sw span::after { content: ""; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; border-radius: 9px; background: #fff; transition: left .15s; }
.sbk-sw input:checked + span { background: var(--primary-color); }
.sbk-sw input:checked + span::after { left: 19px; }
.sbk-sw input:focus-visible + span { outline: 2px solid var(--primary-color); outline-offset: 2px; }
.sbk-menu { position: absolute; right: 8px; top: 52px; z-index: 5; min-width: 196px; padding: 6px 0; display: flex; flex-direction: column;
            background: var(--card-background-color, #fff); border: 1px solid var(--divider-color); border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
.sbk-menu button { display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 16px; border: none; border-radius: 0; background: none;
                   color: var(--primary-text-color); font: inherit; font-size: 14px; text-align: left; cursor: pointer; --mdc-icon-size: 18px; }
.sbk-menu button:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
.sbk-menu button:disabled { opacity: .45; cursor: default; }
.sbk-menu .del { color: var(--error-color, #db4437); }
.sbk-menu hr { border: none; border-top: 1px solid var(--divider-color); margin: 4px 0; }
.sbk-head .sbk-menu { top: 50px; }
.sbk-hwrap { position: relative; }
.sbk-confirm { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 12px 12px 12px 16px; min-height: 68px; box-sizing: border-box;
               border-top: 1px solid var(--divider-color); background: color-mix(in srgb, var(--error-color, #db4437) 10%, transparent); }
.sbk-confirm p { margin: 0; flex: 1 1 180px; font-size: 14px; }
.sbk-btn { height: 36px; padding: 0 16px; border-radius: 18px; border: 1px solid var(--divider-color); background: none;
           color: var(--primary-text-color); font: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }
.sbk-btn.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
.sbk-empty { color: var(--secondary-text-color); padding: 12px 16px 16px; border-top: 1px solid var(--divider-color); }
.sbk-chip.neg { background: none; border: 1px solid var(--primary-color); padding: 1px 7px; }
.sbk-step { display: flex; align-items: center; gap: 4px; padding: 0 4px 0 64px; min-height: 52px; border-top: 1px solid var(--divider-color);
            background: color-mix(in srgb, var(--primary-text-color) 2.5%, transparent); }
.sbk-step.off .sbk-txt { opacity: .5; }
.sbk-step .sbk-t { font-size: 14px; }
.sbk-row.dense { min-height: 48px; }
.sbk-ico.sm { width: 32px; height: 32px; flex-basis: 32px; border-radius: 16px; --mdc-icon-size: 18px; }
.sbk-ico.hit { cursor: pointer; transition: box-shadow .12s; }
.sbk-ico.hit:hover { box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 30%, transparent); }
.sbk-head .sbk-kb[disabled], .sbk-kb.dim { opacity: .4; cursor: default; }
.sbk-kb.on-state { color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 12%, transparent); }
.sbk-wait { color: var(--secondary-text-color); padding: 16px; }
.sbk-note { color: var(--secondary-text-color); font-size: 13px; padding: 8px 16px 12px; border-top: 1px solid var(--divider-color); }
`;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let sheet = null;
  try { sheet = new CSSStyleSheet(); sheet.replaceSync(CSS); } catch (e) { sheet = null; }
  const kbIcon = `<ha-icon icon="mdi:dots-vertical"></ha-icon>`;
  const menu = (label, items) => `<div class="sbk-menu" role="menu" aria-label="${esc(label)}">${items.map((it) => it === "-" ? "<hr>"
    : `<button role="menuitem" data-act="${esc(it.act)}" class="${it.danger ? "del" : ""}" ${it.disabled ? "disabled" : ""}><ha-icon icon="${esc(it.icon)}"></ha-icon>${esc(it.label)}</button>`).join("")}</div>`;
  // One outside click (anywhere but a menu or a ⋮) or Escape closes the open menu.
  const away = (close) => {
    const click = (e) => { if (!e.composedPath().some((n) => n.classList?.contains("sbk-menu") || n.classList?.contains("sbk-kb"))) close(); };
    const key = (e) => { if (e.key === "Escape") close(); };
    const t = setTimeout(() => { window.addEventListener("click", click, true); window.addEventListener("keydown", key, true); });
    return () => { clearTimeout(t); window.removeEventListener("click", click, true); window.removeEventListener("keydown", key, true); };
  };
  window.SBKit = { api: 1, version: VERSION, sheet, cssText: CSS, kbIcon, menu, away, esc };
  window.dispatchEvent(new CustomEvent("sb-ui-kit-ready"));
  console.info(`%c SB-UI-KIT %c v${VERSION} `, "background:#37474f;color:#fff", "background:#90a4ae;color:#000");
})();
