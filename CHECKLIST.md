# Liturgica v1 – Firebase Publish Checklist

> **Goal:**  
> Publish Liturgica v1 using Firebase Hosting + CDN with a React-based authoring app, Node-based build pipeline, and static JSON delivery for the Kotlin consumer app.
>
> **Scope:** Migration + parity only. No new semantics.

---

## Phase 0 — Architectural Decisions (LOCKED)

- [x] v1 scope = migration + parity (no new semantics)
- [x] React app is **authoring-only** (trusted editors)
- [x] Kotlin app is **read-only consumer**
- [x] Prayer IDs are **semantic, stable, snake_case**
- [x] Tree config is **authoritative input**
- [x] Navigation tree is **derived**
- [x] React app does **not scan filesystem**
- [x] Prayer delivery via **static JSON over CDN**
- [x] No database as source of truth in v1

---

## Phase 1 — Authoring & Local Build Pipeline

### Tree & Content Logic

- [x] Legacy tree config frozen (no rewrites)
- [x] Python tree logic ported to TypeScript
- [x] Base prayer tree builder implemented (TS)
- [x] Language-specific navigation tree resolution logic
- [x] Navigation tree model defined (id, children, availability)

### React Authoring UI

- [x] Read-only Tree Navigator UI
- [x] Language availability shown per tree node
- [x] “Create prayer in {language}” buttons implemented
- [x] Tree → Editor navigation wired
- [x] Editor supports **new vs existing prayer**
- [x] Autosave via localStorage
- [x] Save-time normalization (trim edges, preserve internal newlines/tabs)

#### Still Pending

- [ ] Finalize editor → save handler contract
- [ ] Enforce prayer schema validation on Save
- [ ] Finalize local filesystem output structure (per-language folders)

---

## Phase 2 — Node Build Step (CRITICAL)

> This replaces the Python workflow for v1 delivery.

- [ ] Create Node script: `scripts/build-nav-tree.ts`
- [ ] Script reads:
    - tree config
    - prayer JSON files (per language)
- [ ] Script outputs:
    - generated navigation tree JSON (per language or combined)
- [ ] Script validates:
    - duplicate prayer IDs
    - missing referenced prayers
    - tree consistency
- [ ] Script fails loudly on error
- [ ] Script output is deterministic from clean checkout

---

## Phase 3 — Firebase Setup (One-Time)

### Firebase Project

- [ ] Create Firebase project
- [ ] Enable **Firebase Hosting**
- [ ] Disable unused services (Firestore, Functions for v1)

### Hosting Configuration

- [ ] Configure `firebase.json`
- [ ] Set build output directory (`dist/` or equivalent)
- [ ] Enable SPA fallback for React authoring app
- [ ] Configure rewrite rules for:
    - authoring UI
    - static JSON delivery

---

## Phase 4 — CDN Content Layout (LOCK THIS)

### Decide and freeze layout

```text
/prayers/
  /en/
    sleeba_vespers.json
  /ml/
    sleeba_vespers.json
  /manglish/
    sleeba_vespers.json

/tree/
  en.json
  ml.json
  manglish.json
```

Tasks:

- [ ] Finalize CDN folder layout
- [ ] Ensure Node build script outputs this layout
- [ ] Ensure Kotlin app consumes this layout
- [ ] Ensure React editor never depends on CDN paths

---

## Phase 5 — React Build & Firebase Publish

### Build

- [ ] React authoring app builds cleanly
- [ ] No Node / filesystem imports in browser code
- [ ] React app consumes generated nav tree JSON only
- [ ] Dev-only tooling stripped from production build

### Deploy

- [ ] `npm run build`
- [ ] `firebase deploy --only hosting`

- Verify

- [ ] authoring UI loads correctly
- [ ] static JSON accessible via CDN URLs
- [ ] caching headers are correct

---

## Phase 6 — Kotlin App Integration (Read-Only)

### Verify

- [ ] Kotlin app fetches navigation tree JSON from CDN
- [ ] Kotlin app fetches prayer JSON by ID + language
- [ ] Offline caching verified
- [ ] Missing prayer handling verified
- [ ] No hardcoded file-path assumptions

---

## Phase 7 — v1 Hardening Checklist

Before declaring v1 complete:

- [ ] Broken tree detection clearly surfaced
- [ ] Missing prayer detection visible in UI
- [ ] Editor prevents invalid saves
- [ ] Build pipeline reproducible from clean checkout
- [ ] Firebase deploy reproducible
- [ ] No manual CDN edits required

## Explicitly Out of Scope for v1

- ❌ Firestore as authoritative database
- ❌ React writing directly to Firebase Storage
- ❌ Tree editing UI
- ❌ Pattern-based tree schema
- ❌ Permissions / roles
- ❌ Version history UI
- ❌ Multi-user editing
