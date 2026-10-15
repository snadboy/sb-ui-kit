# sb-ui-kit — session notes

| | |
|---|---|
| Repo | github.com/snadboy/sb-ui-kit (public) — local `~/projects/git/sb-ui-kit`, branch `main` |
| Domain | `sb_ui_kit` (MIT) — integration, no config entry, no entities |
| File | `custom_components/sb_ui_kit/frontend/sb-ui-kit.js` — THE row style (window.SBKit) |
| Release | bump `manifest.json` version (it is the `?v=` cache-buster) AND `VERSION` in the JS → commit, push → `gh release create` → HACS update_information + download → HA restart |

## Why (2026-10-14)

The three SB cards (sb-scheduler-card, sb-watch-card, sb-background) shared one row style
as three verbatim copies. Offered: (A) share it at run time, or (B) one source + a sync
script generating the copies. **User chose A.** HACS cannot make a plugin depend on another,
but integrations can (manifest `dependencies`) — so the kit is an INTEGRATION: it serves the
module and `add_extra_js_url`s it onto every page (a Lovelace resource would miss the SB
Watch / SB Background sidebar pages). sb_scheduler, sb_watch and sb_background depend on it.

## Rules

- **api 1 is additive only.** Cards check `SBKit.api >= 1`. Renaming or removing a class or
  helper breaks every installed card — add new ones instead, or bump api and update the cards.
- Cards adopt `SBKit.sheet` (constructable stylesheet) into their shadow roots; adopted sheets
  survive their `innerHTML` re-renders and come after the card's own `<style>`.
- A card that loads first shows "Loading…" and re-renders on `sb-ui-kit-ready`; after 15 s
  with no kit it shows "SB UI Kit is not loaded".
- Test cards INSIDE `hui-view` (HA's Lit contexts) — see the memory note on card testing.

Verified 2026-10-14 headless, cards mounted in hui-view: kit injected 3 s late → all three
cards went Loading… → rendered (6 / 5 / 3 rows), sheets adopted, menus via SBKit; no kit →
the "not loaded" message after 15 s; no page errors.

## 0.2.0 (2026-10-14) — for SB Entity Browser

Additive (api 1): `.sbk-row.dense`, `.sbk-ico.sm`, `.sbk-ico.hit`, `.sbk-kb.dim`/`[disabled]`, `.sbk-kb.on-state`; `.sbk-count` no longer wraps. sb_filter 0.8.1 depends on sb_ui_kit so the browser always has it.
