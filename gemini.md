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

* Show medium header in a table: Name, ID, Source, pH, external PDF link if present.
* **Related Strains** table is displayed if there are any.
* **Ingredients table** with columns: Ingredient, g/L, mmol/L, Optional.
* Ingredient names are linked to the ingredient's detail page (`#/ingredients/:id`).
* If missing composition: show an alert explaining “No composition data found for this medium”.
* If this medium is an **alias** (due to duplicate description), show a notice: “This entry duplicates **<canonical name>**; redirecting link in list view.”
* Optionally list **related media** sharing the same description.

### C) Solutions table (`#/solutions`)

* Columns: ID, Name, Volume.
* Each searchable column has a search input.

### D) Ingredients table (`#/ingredients`)

* Columns: ID, Name, CAS-RN, Formula, Mass.
* Each searchable column has a search input.
* Ingredient names are linked to the ingredient's detail page (`#/ingredients/:id`).

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

---

## 5) Future Development Plan

This section outlines the plan to evolve the prototype into a full-featured, secure data management application.

### Phase 1: Backend Foundation (FastAPI & PostgreSQL)
1.  **Project Scaffolding:** Set up a new `backend` directory for a FastAPI application.
2.  **Database Schema:** Design and create the PostgreSQL database schema for all data, including a `users` table and a `published` flag for media.
3.  **Authentication & Authorization:** Implement JWT-based user authentication to secure data modification endpoints.
4.  **Core API Endpoints:** Develop public (read-only, published data) and admin (read/write) API endpoints for media, ingredients, and solutions.

### Phase 2: Straightforward Frontend UI for Data Stewards
1.  **Login Page:** Create a simple login page.
2.  **Admin Dashboard:** A secure section (`#/admin`) for data management, showing all data (drafts and published) with edit/publish/delete controls.
3.  **Unified "Add/Edit" Interface:** A single, intuitive UI for adding and editing all data types.

### Phase 3: Full Integration
1.  **Connect Frontend to Backend:** Update the frontend to fetch all data from the backend API.
2.  **Authenticated Operations:** The admin UI will send the authentication token with all secure requests.

---

## 6) Changelog

### 2025-08-31
*   **Medium Composition View (`/media/:id`):**
    *   The medium's descriptive information (ID, Source, pH) is now displayed in a table for better readability.
    *   Fixed a bug where the composition table was being overwritten by the "Related Strains" table.
    *   The "Related Strains" are now displayed in a table directly on the page instead of in a modal.
    *   Ingredient names in the composition table now link to their respective detail pages (`#/ingredients/:id`) instead of a modal.
*   **Ingredients List View (`/ingredients`):**
    *   Ingredient names in the main list now also link to their detail pages, consistent with the composition view.gelog

### 2025-08-31
*   **Medium Composition View (`/media/:id`):**
    *   The medium's descriptive information (ID, Source, pH) is now displayed in a table for better readability.
    *   Fixed a bug where the composition table was being overwritten by the "Related Strains" table.
    *   The "Related Strains" are now displayed in a table directly on the page instead of in a modal.
    *   Ingredient names in the composition table now link to their respective detail pages (`#/ingredients/:id`) instead of a modal.
*   **Ingredients List View (`/ingredients`):**
    *   Ingredient names in the main list now also link to their detail pages, consistent with the composition view.