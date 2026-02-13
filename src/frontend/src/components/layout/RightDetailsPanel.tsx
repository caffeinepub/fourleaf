import { Music } from 'lucide-react';
import { useAudioQueue } from '../../hooks/useAudioQueue';

export default function RightDetailsPanel() {
  const { getCurrentItem } = useAudioQueue();
  const currentItem = getCurrentItem();

  if (!currentItem) {
    return (
      <aside className="w-80 shrink-0 hidden xl:flex flex-col p-2">
        <div className="bg-card/80 backdrop-blur rounded-xl p-6 border border-border/50 flex flex-col items-center justify-center min-h-[400px]">
          <Music className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-center">Nothing playing</p>
        </div>
      </aside>
    );
  }

  const song = currentItem.song;
  const coverUrl = song.coverImage?.getDirectURL();

  return (
    <aside className="w-80 shrink-0 hidden xl:flex flex-col p-2">
      <div className="bg-card/80 backdrop-blur rounded-xl p-6 border border-border/50">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Now Playing</h3>
        
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={song.title}
            className="w-full aspect-square rounded-lg object-cover mb-4 shadow-lg"
          />
        ) : (
          <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-4">
            <Music className="h-20 w-20 text-muted-foreground/50" />
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-xl font-bold truncate">{song.title}</h2>
          <p className="text-base text-muted-foreground truncate">{song.artist}</p>
          {song.album && (
            <p className="text-sm text-muted-foreground/70 truncate">
              Album: {song.album}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
