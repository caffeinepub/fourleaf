# Specification

## Summary
**Goal:** Update the frontend to use a Spotify-style, dark three-panel layout with a left navigation sidebar, center routed content, and a right “now playing” details panel.

**Planned changes:**
- Replace the current top-header-centric chrome with a full-height (min-h-screen) three-column shell (left sidebar, center main content with TanStack Router `<Outlet />`, right details panel) on a deep dark background using Tailwind.
- Build the left sidebar as multiple rounded, card-like sections with a slightly lighter surface and nav items to existing routes: `/`, `/my-library`, `/pricing`, and conditionally `/admin`, using the project’s existing icon approach.
- Add a prominent playlist-style header in the center area with a red-to-black gradient background and a large, bold title above the list content.
- Render the tracklist in a structured, table-like row layout showing thumbnail, title, album, and duration (responsive on small screens by collapsing/hiding less important columns), while preserving existing play and download actions.
- Implement the right details panel as a distinct rounded surface that shows current track cover art and text (title/artist, album when available) when something is playing; otherwise show an English empty state message (e.g., “Nothing playing”).
- Make the layout responsive: hide/move the right details panel on small screens and adapt the left sidebar (collapsed or stacked) while avoiding horizontal scrolling.

**User-visible outcome:** On desktop, users see a Spotify-like three-panel interface with sidebar navigation, a gradient-titled main library area with a structured tracklist, and a right panel showing what’s currently playing; on mobile, the layout remains usable without horizontal scrolling and the details panel is hidden or moved.
