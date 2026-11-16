# Sidebar
Status: implemented

## Purpose

Identity card: avatar, name, role, social networks, contact details
and the CV download. Vertical and fixed on desktop (xl); horizontal and with
collapsible contacts at smaller sizes.

## Requirements (EARS)

- RF-1: THE SYSTEM renders an `<aside>` landmark with a translated `aria-label` that contains avatar, name, role, networks, contacts and the CV download.
- RF-2: WHEN `profile.downloadCvUrl` exists, THEN THE SYSTEM shows the "Download CV" link with the `download` attribute; IF it does not exist, THEN it does not render that button.
- RF-3: WHEN the viewport is smaller than xl, THEN THE SYSTEM groups the contacts behind a disclosure button (`aria-expanded` + `aria-controls`); IF the viewport is xl or larger, THEN the contacts are always visible and the disclosure button is **hidden by CSS only** (CSS-only mechanism, decision 8=a: `@media (min-width: 1200px)` in the Sidebar's module forces `grid-template-rows: 1fr` and `visibility: visible` on `.additionalCollapsed` (Motion change 3; see RF-11) and hides the button; the button is still mounted but not visible or operable — there is no conditional render by width). *F5 Change 2026-10-08: the disclosure no longer uses CornerTab (see Anatomy); the note on consistency with CornerTab RF-4 has no object here.*
- RF-4: WHEN the user expands the contacts, THEN THE SYSTEM toggles the **accessible name** of the button (`aria-label` = `showContacts` / `hideContacts`; the button is icon-only since the F5 Change 2026-10-08, see "Disclosure button" below) and rotates the chevron 180° (chevron = decorative `Icon name="chevron-down"` with a rotation class in the module: `transform`, `--duration-base`).
- RF-5: THE SYSTEM derives the `href` of each contact with `getContactHref`: priority to the explicit `href`; `email` → `mailto:`, `phone` → `tel:` with no `+` except the initial one, `whatsapp` → `https://wa.me/` digits only and `location` → no link; IF after the cleanup `phone` or `whatsapp` keeps no digits, THEN the result is `undefined` and the value is shown as text.
- RF-6: THE SYSTEM opens in a new tab with `target="_blank"` and `rel="noopener noreferrer"` **only** the external links: those of social networks and the contact ones derived explicitly as a URL (e.g. a site `href`, and `whatsapp` via `https://wa.me/…`, decision 10); `mailto:` and `tel:` open **without** `target` or `rel`. Each network link carries an `aria-label` equal to the name of the brand.
- RF-7: THE SYSTEM applies the layout of the piece by breakpoint (grid at sizes smaller than xl, vertical and centered at xl, with the avatar protruding) using tokens, with no literal measures in `@media`. The **sticky** with a height ≥ 900px is applied by AppLayout on `.aside` (it is not verifiable in the piece; the reviewer verifies it in F4/F5).
- RF-8: THE SYSTEM receives all the data by props (`profile`, `contact`, `social`, `labels`) and consumes neither `useCv()` nor the language hook.
- RF-9: IF `contact` comes empty, THEN THE SYSTEM does not render the contacts list; IF `social` comes empty, THEN it does not render the networks list; IF there are no contacts **nor** `downloadCvUrl`, THEN it does not render the `Separator` either (EARS counterpart of Test 8; an `.additional` with no content does not leave the separator orphaned).
- RF-10: THEN in print the contacts stay always expanded and the Show/Hide button is hidden: it is the responsibility of the **shared styles** (G-D; `foundations/layout.md` → Print), not of the Sidebar, which declares no `@media print`. So that they can fulfil it, the collapse of `.additional` is done by a **module class** (never inline `style`) and the disclosure's container is reachable (`id="sidebar-contacts"`). The root of the disclosure button renders the `data-print-hide` hook (F5 Change; `button[data-print-hide]` of `global.css` hides it, beating the module's class on specificity — finding B-3). *Motion change 3: the collapse stops being `display: none` and becomes `grid-template-rows: 0fr` + `visibility: hidden` via the same module class (never inline `style`); the forced expansion in print adds `visibility: visible`, `grid-template-rows: 1fr` and the resets of the items' animation (see RF-11; the print block lives in `global.css`).*

- RF-11: WHEN the user expands or collapses the contacts (< xl), THEN THE SYSTEM animates the height with `grid-template-rows: 0fr↔1fr` (entrance `--duration-slow`/`--ease-enter`; exit `--duration-exit`/`--ease-exit`) and the wrapper's items enter with `opacity 0→1` + `translateY(4px)→0`, `--duration-base`/`--ease-enter`, `animation-fill-mode: backwards` and delays `calc(n × --duration-stagger)` (0/30/60/90 ms, max. 4 steps; `4px` is a literal set by the spec). The block's `visibility` is deferred until the end of the closing (collapsed = out of the accessibility tree and of focus). The items' animation runs **only with `data-contacts-animate` present**, which reflects `expanded`: nothing animates on the initial render or on load at ≥ xl. Quick clicks: everything driven by classes, with no JS timers; the final state matches `aria-expanded`. With `prefers-reduced-motion: reduce` everything is instant (the five duration tokens and the derived delays collapse to 0.01 ms in `tokens.css`; no rule of its own is needed). In print there is no animation and the items stay always expanded and visible (RF-10). The chevron rotates 180° with `--duration-base` (RF-4, in force). Verification: tests 11–13; the computed effects (height ~0.3 s, total stagger ~290 ms, focus/visibility, restart of the animation, print and reduced motion with the real flag) by the reviewer's QA with the app served (#91).

## Anatomy

```html
<Box variant="outer" as="aside" aria-label="Profile">
  <!-- F5 Change 2026-10-08: the disclosure NO longer uses CornerTab (the tab with a
       `surface-raised` background overlapped the name at 375px — finding D1 of qa-report).
       Absolute icon-only button in the top right corner of the root, with no
       background; `data-print-hide` = hook of the print contract (#103). -->
  <button class="disclosure" data-print-hide aria-label="Show Contacts" aria-expanded="false" aria-controls="sidebar-contacts">
    <Icon name="chevron-down" aria-hidden="true" />   <!-- decorative; rotates 180° when expanded; `aria-label` toggles show/hide (RF-4) -->
  </button>

  <div class="baseInfo">
    <figure class="avatar"><img src alt /></figure>
    <div class="identity">                            <!-- < md / md–lg: aligned to the start, next to the avatar (F5 Change) -->
      <p class="name">Alex Rivera</p>
      <Badge>Frontend Developer</Badge>
    </div>
    <ul class="social" aria-label="Social profiles">  <!-- < xl: centered in the available space (F5 Change) -->
      <li><a href="…" aria-label="GitHub" target="_blank" rel="noopener noreferrer"><BrandIcon network="github" /></a></li>
    </ul>
  </div>

  <div id="sidebar-contacts" class="additional [additionalCollapsed]" data-contacts-animate?>   <!-- collapsible < xl, always visible ≥ xl; the attribute ONLY when expanded (RF-11): nothing animates on load -->
    <div class="additionalBody">                  <!-- Motion change 3: single wrapper; min-height: 0; overflow: hidden; owner of the vertical stack -->
    <Separator />
    <ul class="contacts">
      <li>
        <IconBox icon="mail" />
        <div><Overhead>Email</Overhead><a href="mailto:…">alex@example.com</a></div>
      </li>
      …
    </ul>
    <Button href={downloadCvUrl} download icon="download" fullWidth>Download CV</Button>  <!-- only if it exists -->
    </div>
  </div>
</Box>
```

The name is a `<p>` with its own style: the only `h1` of the page is the
tabpanel's.

## API

```ts
import type { ContactItem, Profile, SocialLink } from "@data/cv.types.generated";

export interface SidebarLabels {
  region: string;          // "Profile"
  social: string;          // "Social profiles"
  showContacts: string;    // "Show Contacts"
  hideContacts: string;    // "Hide Contacts"
  downloadCv: string;      // "Download CV"
  avatarAlt: string;       // "Portrait of Alex Rivera" — derived from profile.name + i18n template
  contact: Record<ContactItem["type"], string>;  // Email, Phone, WhatsApp, Location
}

export interface SidebarProps {
  profile: Profile;
  contact: readonly ContactItem[];
  social: readonly SocialLink[];
  labels: SidebarLabels;
  /** Joined to the root: it is passed on to the `as="aside"` Box (Box applies the join on its root, G-B). */
  className?: string;
}
```

A pure function exported and tested separately; **it lives in the piece's folder**
(`src/components/Sidebar/getContactHref.ts`, `.ts` with no React — C1 — re-exported
by `index.ts` so that it can be tested from other consumers, decision 11):

```ts
/** href of the contact: the explicit one if it exists; otherwise, derived by type. location → undefined. */
export function getContactHref(item: ContactItem): string | undefined;
```

Exact rules (if there is an `item.href`, it is returned as is and none of this applies):

| type | Result | Cleanup of `value` |
|---|---|---|
| `email` | `mailto:<value>` | `trim()`; no other changes |
| `phone` | `tel:<result>` | a `+` is kept **only** if it is the first character; all the other characters that are not digits are removed (spaces, hyphens, dots, parentheses) |
| `whatsapp` | `https://wa.me/<result>` | **digits only** (the `+` is removed too: wa.me expects the international number with no `+`) |
| `location` | `undefined` | — (plain text, no link) |

If after the cleanup `phone`/`whatsapp` has no digit left → `undefined` (it is shown as text).

Icon map by type: email → `mail`, phone → `phone`,
whatsapp → `message-circle`, location → `map-pin`.

## Styles and tokens

**Avatar**
- `width/height: var(--size-avatar-sidebar)`; `border-radius: var(--radius-avatar-sidebar)`
  (20px < 768 → 32px); `border: var(--size-avatar-border) solid var(--color-surface)`;
  `box-shadow: var(--shadow-avatar)`; `background-color: var(--color-surface-muted)`;
  `overflow: hidden`; `img { object-fit: cover; width: 100%; height: 100%; }`.
- The `img` carries **no** HTML `width`/`height` attributes (decision 9: the size belongs to the token and scales by breakpoint; there is no single honest value to write) nor an explicit `decoding="async"` — only the CSS sizes it.

**Name**: `--font-size-name`, `--font-weight-medium`, `--color-heading`, `margin-bottom: var(--sidebar-name-gap)` (10px < 768 → 14px).

**Networks**: `BrandIcon` with its default size (`--size-social-icon`: 16px < 580 → 18px).
Color `--color-text-muted` (no `opacity`: 5.02:1 light / 6.01:1 dark, recorded in
`docs/tokens/contrast.md`); hover and focus → `color: var(--color-accent-text)`, `color`
transition `--duration-base`. Focus: standard ring (`--focus-ring-*`). Separation `0.75rem`.
Minimum touch area 24×24px (padding on the link).

**Contacts**: item `display: flex; align-items: center; gap: var(--space-4);`
IconBox + text block. Value in `--color-heading`,
`font-size: var(--font-size-contact-value)` (13px < 580 → 14px), one line with `text-overflow: ellipsis` (the full value goes in
`title` to see it on hover). Links with no underline; underline on hover/focus.

**Download CV**: `margin-top: var(--sidebar-cta-gap)` (16px < 580 → 20px at 580–767 → 32px at 768–1199 → 30px at xl).

**`.additional` (decision 11, "gap")**: vertical stack with a token `gap` to separate Separator, contacts list and CTA. Mandatory cumulative exception (Separator RF-4): in the **stretch** that borders the `Separator` the container does not add its `gap` — the block-line-block space is provided only by the Separator's `margin-block`; the plan must resolve the mechanism (e.g. a compensated `margin-block` of the Separator as a flex item) with no inline styles. *Motion change 3 (RF-11): the stack (gap, Separator stretch, margins) **migrates from `.additional` to `.additionalBody`**; `.additional` becomes the single-row grid container.*

**Entrance of contacts (RF-11), in `Sidebar.module.css`** — real rules and specificities:

| Rule | Selector (spec.) | Declarations |
|---|---|---|
| base | `.additional` (0,1,0) | `display: grid; grid-template-rows: 1fr; visibility: visible; transition: grid-template-rows var(--duration-slow) var(--ease-enter), visibility 0s;` |
| collapse | `.additionalCollapsed` (0,1,0, after the base in the file) | `grid-template-rows: 0fr; visibility: hidden; transition: grid-template-rows var(--duration-exit) var(--ease-exit), visibility 0s var(--duration-exit);` |
| wrapper | `.additionalBody` (0,1,0) | `min-height: 0; overflow: hidden;` + the migrated stack |
| entrance of items | `.additional[data-contacts-animate] .additionalBody > *` (0,3,0; it is `animation`, not `transition`: #116 does not apply) | `animation: item-enter var(--duration-base) var(--ease-enter) backwards;` |
| delays | `.additional[data-contacts-animate] .additionalBody > :nth-child(1\|2\|3\|4)` | `animation-delay: calc(0\|1\|2\|3 × var(--duration-stagger));` |
| cap | `.additional[data-contacts-animate] .additionalBody > :nth-child(n+5)` | `animation-delay: calc(4 × var(--duration-stagger));` |
| keyframes | `@keyframes item-enter` | `from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none }` |
| ≥ xl | `@media (min-width: 1200px) { .additionalCollapsed }` (0,1,0, at the end) | `grid-template-rows: 1fr; visibility: visible; transition: none;` (P5': nothing animates when enlarging the window while collapsed; `transition: none` excluded from #116) |

- **No `transition` that produces animation in selectors of (0,2,0) or higher** (#116 clarified): the two transitions of the block live in (0,1,0) classes.
- **Contacts**: the contact links declare **no** `transition` — the inert `transition: color` of `.contacts a` is removed with this Change (proposal §3.4).

## States

| Element | States |
|---|---|
| Social network link | rest `--color-text-muted`; hover/focus `--color-accent-text`; focus with the standard ring |
| Contact link | no underline; underline on hover/focus; focus with the standard ring |
| Disclosure button | `aria-expanded` false/true; `aria-label` toggles `showContacts`/`hideContacts`; chevron rotates 180° on expanding; focus with the standard ring |
| Download CV | states of `Button` |
| `.additional` collapsed (< xl) | class `additionalCollapsed`: `0fr` + `visibility: hidden` (out of the accessibility tree and of focus — it is verified in QA in the browser) |
| `.additional` expanded by the user (< xl) | `1fr` + visible; `data-contacts-animate` present; items with stagger (~290 ms total) |
| `.additional` on load (< xl) or at ≥ xl | no animation (attribute absent; ≥ xl forced open by CSS) |

## Responsive

| Viewport | Layout |
|---|---|
| **< md (768)** | Grid `auto 1fr`: avatar (**6.375rem** — −15% of the previous value 7.5rem, F5 Change 2026-10-08 because of an overlap measured at 375px; applied in `tokens.css:201` on 2026-10-08) on the left; **name and headline shifted to the left, next to the avatar** (identity block aligned to the start, with no column reserves under the top right corner); networks below the identity, centered. Contacts collapsed; on expanding, **1 column**. |
| **md – lg (768–1199)** | The same, avatar 9rem (**final** — F8 closed by the user's decision #105b, 2026-10-08, with no reference capture: proportions verified in QA 1024/1440), larger text; identity attached to the avatar as at < md. Contacts collapsed by default; on expanding, in **2 columns**. |
| **xl (≥ 1200)** | Vertical and centered. Avatar 11.25rem **protruding** at the top (`margin-top: calc(var(--size-avatar-sidebar) * -0.71)`, ≈ −8rem; formula shared with `foundations/layout.md`), name/badge/networks centered, contacts **always visible** in 1 column, disclosure button **hidden by CSS** (decision 8=a; previously "no CornerTab or button" — F5 Change). Sticky only with a screen height ≥ 900px (AppLayout applies it). |

Collapsible (< xl):
- Local state `expanded` with default `false` **at all < xl** (decision 11:
  "false"; the md–lg row of the table describes the 2-column grid **when the
  user expands**, not an initial expanded state).
- `.additional` collapsed with a **module class** (`.additionalCollapsed`:
  `grid-template-rows: 0fr` + `visibility: hidden`, never inline `style` —
  RF-10); at ≥ xl a `@media (min-width: 1200px)` of the module itself forces
  `grid-template-rows: 1fr` + `visibility: visible` + `transition: none` on
  a bare `.additionalCollapsed` (0,1,0, P5') and hides the disclosure button
  (CSS-only, RF-3 / decision 8=a).
- Disclosure button (**F5 Change 2026-10-08**: icon-only, with no CornerTab or background): `aria-expanded`, `aria-controls="sidebar-contacts"`, an `aria-label` that toggles `showContacts` / `hideContacts` (the accessible name replaces the visible text); the chevron (`Icon name="chevron-down"`, decorative `aria-hidden`) rotates 180° when it is expanded (`transform`, `--duration-base`). Style: **no background or border** (zero surface of its own), color `--color-accent-text` (the kit's gold; pair recorded in `docs/tokens/contrast.md` on the surface of the `aside` — verify the exact pair in the task), glyph size through tokens (`--size-icon` default or a `calc()` of tokens if a touch area ≥24px with padding is needed), positioned **absolutely in the top right corner of the root** (the `aside`/Box provides the `position: relative`; the identity does **not** go underneath: reserve with a `padding-inline-end: calc()` of tokens at < md if the name reaches it). Focus with the standard ring (`--focus-ring-*`). At ≥ xl it is hidden by CSS only (`display: none`, decision 8=a: it is still mounted, not operable). Root with `data-print-hide` (print contract #103; verified structurally).

## Accessibility

- `<aside aria-label={labels.region}>` (complementary landmark with a name).
- Networks list with a name; each link with `aria-label` = name of the brand
  (`BRAND_NAMES`); they open in a new tab with `rel="noopener noreferrer"`.
- Contacts: the label (Overhead) and the value are in the same `li`; email,
  phone and WhatsApp are links; location is text.
- Alt of the avatar from `labels.avatarAlt`: AppLayout derives it from `profile.name` with the template `t.sidebar.avatarAlt` (`format`); the piece composes no texts (RF-8).
- Contacts button: **disclosure** pattern (`aria-expanded` + `aria-controls`).

## Expected tests

1. `getByRole("complementary", { name: labels.region })`.
2. It shows name, headline (Badge) and the avatar with the alt of `labels.avatarAlt`.
3. One link per network with the brand's `aria-label`, correct `href`, `target="_blank"` and `rel="noopener noreferrer"`.
4. One item per contact with its translated label; email/phone/whatsapp are links with the href of `getContactHref`; location is not a link. `mailto:`/`tel:` **without** `target`/`rel`; the whatsapp link (or an explicit site `href`) with `target="_blank"` + `rel="noopener noreferrer"` (RF-6).
5. Contacts button: initial `aria-expanded="false"`; click → `"true"` and **accessible name** `hideContacts` (F5 Change: icon-only + `aria-label`; `getByRole("button", { name: labels.showContacts })`); `aria-controls` points to an existing element.
6. With `downloadCvUrl`: "Download CV" link with that `href` and the `download` attribute. Without `downloadCvUrl`: it does not exist.
7. `getContactHref` (table of cases): the explicit `href` has priority;
   `"alex@example.com"` → `mailto:alex@example.com`;
   `"+54 11 5555-0100"` → `tel:+541155550100`; `"(011) 5555.0100"` → `tel:01155550100`;
   `"+54 9 11 5555-0100"` (whatsapp) → `https://wa.me/5491155550100`;
   location → `undefined`; phone with no digits → `undefined`.
8. Empty `contact` and `social`: it renders no empty lists; with no contacts **and** no CV it does not render the `Separator` either (RF-9).
9. `expectNoA11yViolations` with no violations (collapsed and expanded).
10. (F5 Change) The disclosure button is icon-only: no visible text, with `data-print-hide` on its root, `aria-hidden` on the glyph and **no** CornerTab in the DOM of the `<aside>` (the hook existed only for this).
11. Wrapper (RF-11): `#sidebar-contacts` has a single content div (`.additionalBody`) that contains Separator, list and CTA; **unconditional** order assertion (the fixture brings a list): the Separator precedes `ul.contacts` (`compareDocumentPosition(...) & Node.DOCUMENT_POSITION_FOLLOWING`).
12. `data-contacts-animate` **reflects `expanded`**: absent on the initial render, present after expanding, absent after collapsing, present again on re-expanding. (The observable restart of the animation is verified by the reviewer in the browser — T13.)
13. Collapsed: `#sidebar-contacts` carries the module's collapse class (canon #99) and `aria-expanded="false"`. **No** `toBeVisible()` (jsdom does not apply the styles of the CSS Modules); "out of focus and of the accessibility tree" is verified in QA in the browser.

*(jsdom does not apply `@media`: the tests verify the behavior of the
disclosure, not the visibility by breakpoint; that is verified in visual QA.)*

***Rewrite of the Separator's selector (C9, approved in #106):*** the
constant `SEPARATOR_IN_ADDITIONAL` of `Sidebar.test.tsx` goes from
`'#sidebar-contacts > div[aria-hidden="true"]'` to
`'#sidebar-contacts div[aria-hidden="true"]'` (descendant: it survives the
wrapper; the only `div[aria-hidden]` of the subtree is still the Separator —
`IconBox` is a `<span>` and `Icon` is an `<svg>`, verified). The 4 uses stay
intact with their `querySelectorAll(...).toHaveLength(n)` (:379→1, :475→0,
:489→1, :744→1); the same underlying assertion; `getByRole("separator")` is
**not** used (the Separator has no role by contract).

## Do not

- Do not read `useCv()` inside: the data arrive by props.
- Do not use the name as an `h1`.
- Do not animate the height of the contacts block with anything other than `grid-template-rows: 0fr↔1fr` (RF-11; the only exception to "do not animate height" in `foundations/motion.md` — C3): no `height`/`max-height` or JS measurement.
- Do not animate the entrance of items without `data-contacts-animate`: the initial render and the load at ≥ xl do not animate.
- Do not declare a `transition` that can **produce animation** in selectors of specificity (0,2,0) or higher (#116 clarified; `transition: none` excluded).
