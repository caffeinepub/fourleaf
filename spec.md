# Specification

## Summary
**Goal:** Add a voice search microphone icon with listening animation to the main search bar.

**Planned changes:**
- Add microphone icon as an input adornment inside the search bar on the right side
- Style the icon with Fourleaf pink/magenta theme (#FF2D78) with hover state transition from white/grey to pink
- Implement pulsing glow animation when the microphone is active to indicate listening state
- Connect microphone click to existing useVoiceSearch hook to populate search field and execute search automatically

**User-visible outcome:** Users can click a microphone icon inside the search bar to perform voice searches. When active, the microphone displays a pulsing glow effect, and the voice transcript automatically populates and executes the search.
