# gemini.md — Build Spec for “Mediadive Clone” (Vanilla JS + Bootstrap 5.3)

> Scope: a single-page prototype that lists media from local JSON files, supports search + one-click sort, and renders a per-media composition view. Visual style follows Bootstrap 5.3 **Dashboard** layout and color cues similar to **SFB1535** website.

---

## 1) Project goals

* SPA with multiple hash routes:

  * `#/media` (default): searchable/sortable table of all media.
  * `#/media/:id` (composition): details table for one medium.
  * `#/solutions`: searchable table of all solutions.
  * `#/ingredients`: searchable table of all ingredients.
  * `#/strains`: searchable table of all strains.
  * `#/about`: about page.
  * `#/links`: links page.
* Data sources (local JSON):

  * `mediaList.json` — array of media.
  * `medium-Composition.json` — dict keyed by media ID (string keys, e.g., `"1"`, `"1a"`).
  * `solutions.json` — array of stock solutions.
  * `solutions-composition.json` — dict keyed by solution ID.
  * `ingredients.json` — array of ingredients.
  * `ingredients_detail.json` — dict keyed by ingredient ID.
  * `mediumStrain.json` — dict keyed by medium ID.
* UX constraints

  * Use **Bootstrap 5.3 Dashboard** shell (top navbar + left sidebar), mobile-friendly. ([Bootstrap][1])
  * Color/feel “similar to” **SFB1535**: white base, dark navy, light blue accents, orange CTA; primary font Roboto/Helvetica/Arial per their site. Suggested palette below. ([sfb1535.de][2], [Color Hex][3])
  * No frameworks; **vanilla JS** only.
  * One-click column sort; instant search (client-side, debounced).
  * If one medium’s **description text duplicates** another medium’s description, the **Name** link should point to the **canonical** medium’s composition page (not its own ID).

---

## 2) Pages

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
* **Show Strains** button to open a modal with strain information.
* **Ingredients table** with columns: Ingredient, g/L, mmol/L, Optional.
* Ingredient names are linked to a modal with detailed information.
* If missing composition: show an alert explaining “No composition data found for this medium”.
* If this medium is an **alias** (due to duplicate description), show a notice: “This entry duplicates **<canonical name>**; redirecting link in list view.”
* Optionally list **related media** sharing the same description.

### C) Solutions table (`#/solutions`)

* Columns: ID, Name, Volume.
* Each searchable column has a search input.

### D) Ingredients table (`#/ingredients`)

* Columns: ID, Name, CAS-RN, Formula, Mass.
* Each searchable column has a search input.
* Ingredient names are linked to a modal with detailed information.

### E) Strains table (`#/strains`)

* Columns: ID, Species, CCNO, Growth, BacDive ID, Domain.
* Each searchable column has a search input.

---

## 3) File structure (prototype)

```
/public
  index.html
  /data
    mediaList.json
    medium-Composition.json
    solutions.json
    solutions-composition.json
    ingredients.json
    ingredients_detail.json
    mediumStrain.json
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

## 4) References captured from the web

* Bootstrap 5.3 **Dashboard** example (layout & structure). ([Bootstrap][1])
* SFB1535 **MibiNet DB** site (font stack evidence; orange CTA chips). ([sfb1535.de][2])
* SFB-like color palette hexes (#ff8400, #042f64, #7ac6f6, #bdd0db, #ffffff). ([Color Hex][3])

[1]: https://getbootstrap.com/docs/5.3/examples/dashboard/ "Dashboard Template · Bootstrap v5.3"
[2]: https://www.sfb1535.de/ "MibiNet DB"
[3]: https://www.color-hex.com/color-palette/107002?utm_source=chatgpt.com "SFB Color Palette"