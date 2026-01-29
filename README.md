# Liturgica Prayer Editor

Liturgica Prayer Editor is a **block-based web editor** for authoring and editing prayer content in a **structured, semantic JSON format**, intended to replace Word document–based workflows currently used for Liturgica.

The primary goal of this project is to make prayer authoring:

- easier for contributors,
- less error-prone,
- and structurally correct by design,

while producing output that can be **directly consumed by the Liturgica mobile app** without manual cleanup or fragile conversions.

---

## Why this exists

Currently, prayer content is authored in Word documents and later converted into structured data using custom scripts. This approach has several problems:

- Word allows arbitrary formatting and structure
- Contributors need training to avoid breaking conversions
- Errors are detected late, during conversion or runtime
- Iteration is slow and stressful

This editor replaces that workflow with a **guided, block-based interface** where:

- prayer structure is explicit,
- invalid combinations are prevented or flagged,
- and the saved output is always valid JSON.

---

## Core idea

Instead of editing free-form documents, prayers are authored as an **ordered list of blocks**, such as:

- Title
- Heading
- Subheading
- Song
- Prose
- Subtext
- Collapsible-block
- Dynamic-block
- Alternative prayer block
- Rubric
- (and other liturgically meaningful sections)

Each block has a clear semantic meaning, and the editor enforces basic structural rules before allowing a prayer to be marked complete.

The editor does **not** aim to be a rich-text editor.  
It is a **structured authoring tool**, focused on correctness rather than formatting freedom.

---

## Save model (high level)

- Prayers can be saved as **drafts** at any time
- Drafts may contain validation errors
- A prayer can be marked **complete / published** only when validation passes
- Published prayers are stored as canonical JSON and consumed by the app

The exact rules are documented in `docs/save-contract.md`.

---

## Planned tech stack (initial)

This project intentionally keeps the stack simple.

### Frontend

- **TypeScript**
- **React**
- Minimal custom UI components
- Optional drag-and-drop for block reordering (planned)

### Storage

- **Firebase Storage**
- Prayers stored as JSON files
- Drafts and published content kept separate

### Validation

- Client-side validation in TypeScript
- Validation runs on save / publish
- Errors are shown clearly in the editor UI

---

## What this project is NOT

- Not a generic CMS
- Not a rich-text editor
- Not a PDF authoring tool
- Not a Word replacement in appearance

Formatting and presentation are handled by the Liturgica app, not by the editor.

---

## Scope (for now)

- Focused only on **prayer authoring**
- Calendar editing and other admin tools are out of scope initially
- Backend integration beyond Firebase is intentionally minimal

The project is designed so that backend or hosting choices can evolve later without changing the prayer data model.

---

## Status

🚧 Early development / planning phase

The current focus is:

- defining the prayer JSON schema,
- implementing a minimal block-based editor,
- and replacing the existing Word document workflow.
