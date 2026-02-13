# Specification

## Summary
**Goal:** Enable authenticated users to upload audio tracks end-to-end and update the header branding to a minimal, circular four-leaf clover mark.

**Planned changes:**
- Verify/complete the full upload flow from both the Public Library and My Library upload dialogs so an authenticated user can upload an audio file (optionally with cover image) and see the new track appear in the correct library lists and counts.
- Ensure unauthenticated users see a login-required upload state and no upload attempt is made.
- Ensure upload progress is shown and the upload dialog cannot be dismissed via outside click/escape while uploading; surface backend authorization errors as readable English UI errors.
- Replace the current header logo rendering in `frontend/src/components/branding/FourleafBrand.tsx` with a perfectly circular black container and a crisp, scalable clover mark composed of four identical rounded green leaves meeting seamlessly at center (no text, shadows, gradients, or extra effects), and keep it centered across breakpoints including mobile AppLayout.

**User-visible outcome:** Logged-in users can upload a track from either library view and immediately see it listed in the appropriate catalogs, and the app header shows a centered, minimal circular clover logo that stays crisp on desktop and mobile.
