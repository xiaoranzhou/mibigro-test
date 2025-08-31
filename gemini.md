# gemini.md — Build Spec for “Mediadive Clone” (Vanilla JS + Bootstrap 5.3)

> Scope: a single-page prototype that lists media from local JSON files, supports search + one-click sort, and renders a per-media composition view. Visual style follows Bootstrap 5.3 **Dashboard** layout and color cues similar to **SFB1535** website.

---

## 1) Project goals

* SPA with two hash routes:

  * `#/media` (default): searchable/sortable table of all media.
  * `#/media/:id` (composition): details table for one medium.
* Data sources (local JSON):

  * `mediaList.json` — array of media.
  * `medium-Composition.json` — dict keyed by media ID (string keys, e.g., `"1"`, `"1a"`).
  * `solutions.json` — array of stock solutions.
* UX constraints

  * Use **Bootstrap 5.3 Dashboard** shell (top navbar + left sidebar), mobile-friendly. ([Bootstrap][1])
  * Color/feel “similar to” **SFB1535**: white base, dark navy, light blue accents, orange CTA; primary font Roboto/Helvetica/Arial per their site. Suggested palette below. ([sfb1535.de][2], [Color Hex][3])
  * No frameworks; **vanilla JS** only.
  * One-click column sort; instant search (client-side, debounced).
  * If one medium’s **description text duplicates** another medium’s description, the **Name** link should point to the **canonical** medium’s composition page (not its own ID).

---

## 2) Visual system

### Layout

* Base the shell on **Bootstrap 5.3 → Examples → Dashboard** (header with brand, collapsible sidebar). Reuse its classes and responsive behavior. ([Bootstrap][1])

### Palette (inspired by SFB1535) - **Theme changed to Orange**

Use CSS vars in `:root`:

```css
:root{
  --brand-white:#ffffff;
  --brand-navy:#042f64;     /* SFB-like dark blue */
  --brand-ltblue:#7ac6f6;   /* light accent */
  --brand-grayblue:#bdd0db; /* soft neutral */
  --brand-orange:#ff8400;   /* call-to-action */
}
```

Rationale:

* SFB1535 site shows white base, orange CTA chips, Roboto font. ([sfb1535.de][2])
* Complementary community palette reference with the exact hexes above. ([Color Hex][3])

Typography

* Font stack from SFB1535 DOM/CSS: `"Roboto","Helvetica","Arial",sans-serif`. ([sfb1535.de][2])

---

## 3) Data model (Type-ish)

```ts
type Medium = {
  id: string|number;        // e.g., 1 or "1a"; treat as string internally
  name: string;
  complex_medium: 0|1;
  source: string;           // e.g., "DSMZ"
  link: string|null;        // PDF link (external)
  min_pH: number|null;
  max_pH: number|null;
  reference: string|null;
  description: string|null; // may be null or duplicated across items
};

type CompositionIngredient = {
  name: string;
  id: number;               // ingredient ID (not medium ID)
  g_l: number|null;
  mmol_l: number|null;
  optional: 0|1;
};

type CompositionDict = {
  [mediumId: string]: CompositionIngredient[]; // keys can be "1", "1a", etc.
};

type Solution = { id:number; name:string; volume:number|null };
```

Canonicalization rule

* Build a map `desc → firstSeenMediumId` using **trimmed, lower-cased** description; on `#/media`, the **Name** link resolves to that canonical ID.

Edge cases

* `description` may be `null`: skip canonicalization.
* `medium-Composition.json` may lack a key for some `id`: show an inline warning in the detail page.

---

## 4) Routing

* Hash router (no dependencies). Routes:

  * `#/media` → render table view.
  * `#/media/:id` → render composition view.
  * Unknown hash → redirect to `#/media`.
* Keep scroll position per route if simple (or just reset to top).

---

## 5) Pages

### A) Media table (`#/media`)

Columns:

1. **ID** (sortable; alphanumeric sort: numbers first by numeric value, then lexicographic).
2. **Name** (link to composition; link target is **canonical** ID if description duplicates).
3. **Source** (text).
4. **pH** (compact “min–max”, or single value when equal; handle nulls).
5. **Complex** (badge: Yes/No).

Interactions:

* **Search**: Each searchable column has a search input that filters the table results instantly (debounced).
* **One-click sort**: clicking a header toggles asc/desc; only one active sort at a time.
* **Row hover** and **focus** styles use `--brand-ltblue` background tint for accessibility.

### B) Composition (`#/media/:id`)

* Show medium header: Name, ID, Source, pH, external PDF link if present.
* **Ingredients table** with columns: Ingredient, g/L, mmol/L, Optional.
* If missing composition: show an alert explaining “No composition data found for this medium”.
* If this medium is an **alias** (due to duplicate description), show a notice: “This entry duplicates **<canonical name>**; redirecting link in list view.”
* Optionally list **related media** sharing the same description.

---

## 6) File structure (prototype)

```
/public
  index.html
  /data
    mediaList.json
    medium-Composition.json
    solutions.json
  /assets
    favicon.svg
    logo.svg
/src
  app.js         // boot + router + data load
  state.js       // data store + selectors + canonicalization
  views.js       // render functions for list & detail
  ui.js          // table builder, sort utils, search debounce
  styles.css     // Bootstrap overrides + palette
```

---

## 7) Implementation notes

Bootstrap & shell

* Start from **Dashboard** example markup; keep the top `navbar` and a collapsible `sidebar`. Replace its placeholder content with:

  * Brand: “Mediadive (Prototype)”.
  * Sidebar items: “Media” (active), “About”, “Links”.

Data loading

* Fetch all three JSONs in parallel (`Promise.all`) from `/public/data/*`.
* Normalize medium IDs to **strings** (e.g., `String(m.id)`).
* Build:

  * `byId` map for media.
  * `compositionById` from `medium-Composition.json`.
  * `descCanonMap` (description → canonicalId).

Search

* Each searchable column has its own search input.
* On input (debounced 150 ms), filter rows based on the input value for that column.

Sort

* “ID” column sort:

  * Parse leading integer if present; compare numerically; tie-break with full string.
* “Name” / “Source”: localeCompare with `sensitivity:"base"`.
* “pH”: compare by `(min??max??∞, max??min??∞)`.

Linking rule (duplicate descriptions)

* When building the table row for medium `m`, compute:

  * `targetId = descCanonMap[normalized(m.description)] ?? m.id`.
* Render `<a href="#/media/${targetId}">m.name</a>`.

Composition view

* Use a simple striped table.
* For `optional === 1`, show a muted “(optional)” or a badge.
* If `g_l` and `mmol_l` are both `null`, leave cells blank.

Accessibility

* Ensure **color contrast**: brand navy on white, orange for accents (buttons and badges) with dark text where needed. (Palette anchored by #042f64 / #ff8400 / #ffffff per SFB-like scheme.) ([Color Hex][3])
* Keyboard:

  * Header cells are `button` elements (or have `tabindex="0"` + key handlers) for sorting.
  * Focus outlines preserved.

Performance

* Render table rows with `DocumentFragment`.
* For large lists, consider paging (client-side) but **not required** for prototype.

Empty/error states

* If a fetch fails, show a dismissible `alert-danger` with a retry button.
* If search yields zero rows, show an `alert-warning` inside the table container.

---

## 8) Styling hooks (Bootstrap 5.3 overrides)

```css
body{ font-family: "Roboto","Helvetica","Arial",sans-serif; }
.navbar, .sidebar { background: var(--brand-orange); }
.navbar .navbar-brand, .navbar .nav-link, .sidebar .nav-link { color: var(--brand-white); }
.btn-primary, .badge-primary { background: var(--brand-navy); border-color: var(--brand-navy); color:var(--brand-white); }
.table-hover tbody tr:hover { background: color-mix(in oklab, var(--brand-ltblue) 20%, white); }
a { color: var(--brand-orange); }
a:hover { color: var(--brand-navy); }
```

(Use the Dashboard example’s structure; only minimal overrides like above.) ([Bootstrap][1])

---

## 9) Deliverables checklist (for the agent)

* [x] **Scaffold**: copy Bootstrap 5.3 **Dashboard** HTML into `index.html`; include Bootstrap CSS/JS via CDN. ([Bootstrap][1])
* [x] **Palette** + font stack injected via `styles.css` (as in §8).
* [x] **Router**: hashchange listener; default route.
* [x] **Data loader**: fetch three JSONs; build indexes + `descCanonMap`.
* [x] **Media table**:

  * [x] Render rows; link to `#/media/{canonicalId}`.
  * [x] Search input wired (debounce 150 ms).
  * [ ] One-click sort with indicators (▲/▼).
* [x] **Composition view**:

  * [x] Header metadata + external PDF link if `link`.
  * [x] Composition table from `compositionById[id]`.
  * [x] Missing data notice.
  * [ ] Related media (same normalized description).
* [ ] **States**: loading spinners, empty states, error alerts.
* [ ] **A11y**: keyboard sorting; focus outline; table captions.
* [ ] **QA**:

  * [ ] IDs with letters (e.g., `"1a"`) route and sort correctly.
  * [ ] Duplicate description linking works.
  * [ ] PDFs open in new tab with `rel="noopener"`.
* [x] **Packaging**: everything runs from a static server (no build step).

---

## 10) References captured from the web

* Bootstrap 5.3 **Dashboard** example (layout & structure). ([Bootstrap][1])
* SFB1535 **MibiNet DB** site (font stack evidence; orange CTA chips). ([sfb1535.de][2])
* SFB-like color palette hexes (#ff8400, #042f64, #7ac6f6, #bdd0db, #ffffff). ([Color Hex][3])

---

## 11) Nice-to-have (optional)

* Sticky table header on scroll (Bootstrap utility + small CSS).
* Client-side CSV export of current filtered/sorted view.
* Quick filters: source = DSMZ; complex = Yes/No.
* Small “Solutions” drawer listing `solutions.json` entries; link any ingredient names that match a solution name.

---

**Notes**

* Treat *all* medium IDs as strings to avoid key mismatches between `mediaList.json` and `medium-Composition.json` (e.g., `"1a"`).
* Where `min_pH === max_pH`, render a single value (e.g., “7.0”) to match user data examples.
* Avoid external libraries beyond Bootstrap; keep JS modular and readable.

[1]: https://getbootstrap.com/docs/5.3/examples/dashboard/ "Dashboard Template · Bootstrap v5.3"
[2]: https://www.sfb1535.de/ "MibiNet DB"
[3]: https://www.color-hex.com/color-palette/107002?utm_source=chatgpt.com "SFB Color Palette"