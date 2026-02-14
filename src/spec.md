# Specification

## Summary
**Goal:** Allow signed-in non-admin users with the intended role to upload songs to the public catalog, add backend introspection for diagnosing authorization, and ensure uploaded songs appear in public catalog queries.

**Planned changes:**
- Update backend authorization in `backend/main.mo` for `uploadPublicSong` (and any delegated upload method such as `uploadSong`) to allow the intended non-admin role(s) while still rejecting anonymous callers.
- Add a backend query method to return the caller Principal plus the effective role/permission information used by upload authorization checks (without exposing secrets).
- Verify and align the public-catalog upload data flow so successful uploads create a new public catalog record that appears in existing catalog queries (`getAllSongs`, `getTotalSongs`) and supports streaming (`streamSongAudio`) without being blocked by hidden/publication flags.
- Update the frontend public upload UX (`PublicSongUploadDialog`) to match the expanded permission model and show clear English permission errors when uploads are rejected (without changing immutable hook/UI paths).

**User-visible outcome:** Signed-in users with the allowed non-admin role can upload songs to the public catalog successfully, see them show up in the public catalog and streaming, and get clear permission errors (plus a developer-accessible way to confirm caller identity/role used during authorization).
