# SB UI Kit

The shared look of the SB Home Assistant cards — **SB Scheduler**, **SB Watch** and
**SB Background** — kept in ONE place and loaded at run time.

It is a tiny integration with no setup and no entities. It serves one script module and adds
it to every Home Assistant page (dashboards and sidebar pages). The module defines
`window.SBKit`: the row style as a shared stylesheet, plus the ⋮ menu helpers.

You do not add it yourself: `sb_scheduler`, `sb_watch` and `sb_background` list it as a
dependency, so Home Assistant loads it whenever one of them is installed. Install it from
HACS (custom repository, category Integration) before updating those three; a card that
cannot find it says so instead of rendering.

## The style

Header: title · count · **+ Add** · ⋮. Row: status icon (tinted armed / running / idle /
warning / problem; switched-off rows dimmed) · name · one summary line (a chip, then what it
is doing now) · a third line only for a warning or problem · Enabled toggle · ⋮ (Edit,
Duplicate, Run now / Restart / Details, Delete… with an inline confirm). Tap a row to edit.
Theme variables only, so light and dark themes both work.

## API (`window.SBKit`, api 1 — only ever added to)

| | |
|---|---|
| `sheet` | `CSSStyleSheet` — `shadowRoot.adoptedStyleSheets = [SBKit.sheet, …]` |
| `cssText` | the same CSS as text |
| `kbIcon` | the ⋮ icon markup |
| `menu(label, items)` | a ⋮ menu's HTML; items `{act, icon, label, danger?, disabled?}` or `"-"` |
| `away(close)` | calls `close()` on the next outside click or Escape; returns an unsubscribe |
| `esc(s)` | HTML-escape |

A card that loads before the kit waits for the window event `sb-ui-kit-ready`.
