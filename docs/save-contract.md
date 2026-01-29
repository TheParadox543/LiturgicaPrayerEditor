# Save Contract

This document defines the rules under which prayer content may be saved by the Liturgica Prayer Editor.

The save contract exists to ensure that all prayer data stored by the system is:

- structurally valid,
- semantically meaningful,
- and safe to consume by the Liturgica app without manual intervention.

These rules are intentionally simple and explicit.

---

## Core principles

1. **Prayer content is stored as structured JSON**
2. **The editor enforces correctness before publishing**
3. **Invalid content must never enter the published source**
4. **Nothing is permanently immutable — content can always be edited**

---

## Save states

Prayer content exists in one of two states:

### 1. Draft

- A draft represents work in progress
- Drafts may be saved at any time
- Drafts may contain validation errors
- Drafts are not consumed by the Liturgica app
- Drafts are expected to be edited over time

Saving a draft must **never be blocked**.

---

### 2. Complete / Published

- A prayer marked as complete is considered ready for use
- Published prayers are consumed by the Liturgica app
- A prayer may only be published if **all validation rules pass**
- Publishing is an explicit user action

Publishing **must be blocked** if validation fails.

---

## Validation rules (high level)

Validation ensures that prayer structure is meaningful and safe.

Examples include:

- Required fields must be present
- Blocks must appear in a valid order
- Certain block types may not repeat consecutively
- Block content must not be empty

Validation rules are defined in code and evolve over time.

The editor must

- clearly indicate validation errors
- associate errors with specific blocks where possible

---

## What happens on validation failure

- Draft saves continue to work
- Publish attempts are rejected
- No partial or invalid data is written to the published source
- Users must correct errors before retrying

There is **no override or force-publish mechanism**.

---

## Storage guarantees

- Draft prayers are stored separately from published prayers
- Published prayers always represent valid, complete JSON
- The Liturgica app may assume published content is correct
- Storage location or backend implementation may change, but these guarantees must not

---

## Editability

- Any prayer (draft or published) may be reopened for editing
- Editing a published prayer moves it back into a draft state until republished
- No prayer becomes permanently locked by default

---

## Schema versioning

- Each prayer JSON includes a `schemaVersion`
- Schema versions may evolve over time
- Older prayers remain valid under their original schema
- Migration, if required, is an explicit process

---

## Scope of this contract

This save contract applies to:

- the Prayer Editor UI
- validation logic
- any backend or storage mechanism used by the editor

Any future system that writes prayer content **must obey this contract**.

---

## Summary

In short:

- Drafts are flexible
- Published content is strict
- Validation is mandatory for publishing
- JSON is the source of truth
- Correctness is enforced by design, not by convention

This contract protects both contributors and users of Liturgica.
