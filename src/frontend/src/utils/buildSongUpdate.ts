import { ExternalBlob } from '../backend';
import type { Update } from '../backend';

/**
 * Builds a properly typed Update payload for song uploads.
 * Conditionally omits optional fields (coverImage) when not provided,
 * ensuring Candid encoding matches the generated TypeScript type expectations.
 */
export function buildSongUpdate(params: {
  title: string;
  artist: string;
  album: string;
  duration: bigint;
  audioFile: ExternalBlob;
  coverImage?: ExternalBlob;
}): Update {
  const update: Update = {
    title: params.title,
    artist: params.artist,
    album: params.album,
    duration: params.duration,
    audioFile: params.audioFile,
  };

  // Only include coverImage if it's actually provided
  if (params.coverImage) {
    update.coverImage = params.coverImage;
  }

  return update;
}
