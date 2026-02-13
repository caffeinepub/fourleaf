import { Play, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Song } from '../../backend';

interface StreamingCardProps {
  song: Song;
  isPlaying?: boolean;
  onPlay: () => void;
}

export default function StreamingCard({ song, isPlaying, onPlay }: StreamingCardProps) {
  const coverUrl = song.coverImage?.getDirectURL();
  const durationMinutes = Math.floor(Number(song.duration) / 60);
  const durationSeconds = Number(song.duration) % 60;
  const formattedDuration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

  return (
    <div className="group relative flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] cursor-pointer">
      <div
        className="relative aspect-square rounded-lg overflow-hidden bg-card mb-3 shadow-md hover:shadow-lg transition-all duration-300"
        onClick={onPlay}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Music className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-glow-md"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            <Play className="h-6 w-6 fill-current" />
          </Button>
        </div>

        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
            Playing
          </div>
        )}
      </div>

      {/* Song info */}
      <div className="px-1">
        <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-primary transition-colors">
          {song.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate mb-1">
          {song.artist}
        </p>
        <p className="text-xs text-muted-foreground/70">
          {formattedDuration}
        </p>
      </div>
    </div>
  );
}
