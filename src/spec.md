# Specification

## Summary
**Goal:** Add a green hamburger icon next to the “Fourleaf” brand in the left sidebar header and use it to smoothly toggle the sidebar between expanded and collapsed states.

**Planned changes:**
- Update the LeftSidebar header row to place a prominent hamburger icon immediately to the left of the “Fourleaf” text, aligned and padded consistently within the existing header container.
- Style the hamburger icon as three thick horizontal bars with rounded ends, using the same vibrant green accent color as the Fourleaf logo elements.
- Implement expand/collapse behavior triggered by clicking the hamburger icon while keeping navigation items in the same order and preserving the existing dark sidebar aesthetic.
- Add smooth expand/collapse transitions (respecting reduced-motion preferences) and ensure the toggle is accessible (focusable, Enter/Space activation, ARIA label, and `aria-expanded` state).

**User-visible outcome:** Users see a green hamburger icon beside “Fourleaf” in the sidebar header and can click (or keyboard-activate) it to smoothly collapse or expand the sidebar without changing navigation order or routes.
