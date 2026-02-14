# Specification

## Summary
**Goal:** Keep the left sidebar always visible and pinned on mobile while maintaining a side-by-side (two-column) layout across all screen sizes.

**Planned changes:**
- Update the main layout container to consistently render the left sidebar and main content side-by-side using a single flexbox/grid structure at all breakpoints, with a fixed sidebar width (~250px) and main content filling remaining space.
- Remove any responsive CSS/Tailwind behavior that hides the left sidebar on mobile, and apply sticky/fixed positioning on mobile so the sidebar stays pinned while the main content scrolls.
- Ensure the main content area is offset/sized so it never renders underneath or is covered by the pinned sidebar, including header areas.
- Increase mobile touch target sizing within the sidebar (nav items like “Home” and “My Library”, plus UI Sound Effects controls) by adjusting padding, font sizes, and icon spacing for comfortable thumb use.
- Match mobile sidebar background styling to the existing desktop dark sidebar styling by reusing the same existing theme variables/classes.
- Handle very narrow screens by preventing sidebar shrink/collapse; allow main content horizontal scrolling (only when needed) so the sidebar remains pinned and consistent.
- Keep header actions (e.g., Sign Out/Sign In and Upload Track) right-aligned within the main content region and ensure they never overlap or sit under the sidebar at any breakpoint.

**User-visible outcome:** On mobile and desktop, users always see a fixed-width left sidebar pinned to the left while browsing; the main content and header actions remain visible to the right without overlap, and sidebar controls are easier to tap on small screens.
