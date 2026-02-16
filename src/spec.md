# Specification

## Summary
**Goal:** Prevent the Library page search bar from floating/sticking while scrolling and avoid it overlapping page content.

**Planned changes:**
- Update `frontend/src/pages/LibraryPage.tsx` to remove sticky positioning from the search bar wrapper (replace `className="sticky ..."` with non-sticky layout classes such as `relative`/default flow) and remove the inline `style={{ top: 'var(--header-offset)' }}` used for sticky behavior.
- Add a reusable CSS snippet/class in `frontend/src/index.css` for a non-sticky page-level search bar (relative/static positioning, `top: 0`, and a safe `z-index`), and apply it (or an equivalent Tailwind class set) to the Library page search bar wrapper to make the intent explicit.

**User-visible outcome:** On the Library page, the search bar stays in the normal document flow (does not follow scroll) and content below it is no longer overlapped.
