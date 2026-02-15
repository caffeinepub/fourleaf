# Specification

## Summary
**Goal:** Place the hamburger menu icon button directly next to the Fourleaf brand in the header while keeping the Login button right-aligned.

**Planned changes:**
- Update the header layout so the hamburger icon button and Fourleaf logo/text are grouped as a single left-aligned cluster with consistent spacing and vertical alignment on mobile breakpoints.
- Reuse the existing hamburger icon asset at `/assets/generated/hamburger-menu.dim_24x24.svg` and keep the current click behavior that opens the mobile LeftSidebar drawer.
- Preserve the existing responsive behavior for the hamburger button (hidden on desktop if currently hidden) and add an accessible aria-label (e.g., "Open menu").

**User-visible outcome:** On mobile, the hamburger menu icon appears immediately beside the Fourleaf brand in the header, still opens the left sidebar when tapped, and the Login button stays right-aligned.
