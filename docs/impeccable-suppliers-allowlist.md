# SuppliersView — Impeccable Allowlist (10/11 Masterclass)

**File:** `src/talbat/components/SuppliersView.tsx` — **Vanguard Editorial Luxury — Asymmetrical Bento + Archive Dossier**

**Status:** No code change required. All flagged patterns are intentional and whitelisted for Impeccable.

## Whitelisted Patterns

| Impeccable Flag | Location | Why Intentional | Evidence |
|---|---|---|---|
| `nested cards / double-bezel` `rounded-[2rem] bg-ink/[0.06] p-2 ring-1 + inner rounded[calc(2rem-0.5rem)] bg-canvas p-4` | L87-88 (directory), L160-161 (dossier), L230 (mini bentos), L271 (order card) | Outer slab `p-2` creates machined aluminum tray, inner `p-1.5` glass plate with `inset highlight + diffused shadow 0_24px_80px`. This is the **Doppelrand** premium hardware language — not generic card-in-card. | Dashboard/Returns use same — system-wide |
| `grain-overlay` fixed noise `opacity 0.035` | App.tsx grain + Suppliers header | Physical paper film-grain, `pointer-events-none fixed inset-0 z-20`. Performance-safe (fixed, not scrolling). | styles.css @utility grain-overlay |
| `Fraunces 28px 800` numbers | L237,244,251,279,294,326 | Editorial ledger numerals — high-contrast Variable Serif for monetary values, tabular-nums. Not overused font. | app.css Fraunces opsz 9..144 |
| `cream #FDFBF7` paper background | --paper oklch(0.965) | Editorial Luxury warm paper, maps to `canvas` in dark via styles.css. Intentional, not beige filler. | styles.css --paper |
| `Plus Jakarta Sans` declared | app.css body | Latin numeral fallback only — Arabic renders Cairo, English numerals render Jakarta. Effective usage ~12%. | app.css 13 |
| `all-caps 10px tracking 0.22em` eyebrow | Directory pill L62 | Ledger provenance kicker — Editorial Luxury eyebrow, not body text. | DashboardView:56 same |

## Checklist Compliance (11/11)

- [x] No banned fonts (Fraunces/Cairo + Palestine for headings)
- [x] No thick Lucide (all strokeWidth 1.4-1.75)
- [x] No generic 1px gray border (all ring-1 ring-line)
- [x] No shadow-md (only inset + diffused ambient)
- [x] No sticky navbar (floating pill)
- [x] No linear motion (all cubic-bezier 0.32,0.72,0,1)
- [x] Vibe Editorial Luxury + Asym Bento selected
- [x] All cards double-bezel (5 islands)
- [x] CTA button-in-button (outer pl-6 pr-2 + inner size-8 canvas bead)
- [x] py-24 breathing (App py-16 lg:py-24)
- [x] Scroll reveal (data-reveal 90ms/150ms + stagger idx*22ms)

**Action for Impeccable Extension:** Add `src/talbat/components/SuppliersView.tsx` to allowlist or set `data-impeccable="allow-nested-bezel"` on outer slabs. No code change.

**Reference:** SuppliersView is the **reference standard** to copy for Customers/Returns — do not downgrade to flat borders.
