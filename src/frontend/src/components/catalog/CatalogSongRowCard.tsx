import { Music, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DownloadButton from './DownloadButton';
import type { Song } from '../../backend';

interface CatalogSongRowCardProps {
  song: Song;
  index: number;
  isCurrentSong: boolean;
  onPlay: (song: Song, index: number) => void;
}

export default function CatalogSongRowCard({
  song,
  index,
  isCurrentSong,
  onPlay,
}: CatalogSongRowCardProps) {
  const coverUrl = song.coverImage?.getDirectURL();

  const formatDuration = (seconds: bigint) => {
    const totalSeconds = Number(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`group grid grid-cols-[auto_1fr_auto] lg:grid-cols-[auto_80px_1fr_200px_120px_80px] gap-4 items-center px-4 py-3 rounded-lg transition-all hover:bg-accent/30 ${
        isCurrentSong ? 'bg-accent/50' : ''
      }`}
    >
      {/* Play Button */}
      <Button
        size="icon"
        variant={isCurrentSong ? 'default' : 'ghost'}
        onClick={() => onPlay(song, index)}
        className="shrink-0 w-10 h-10"
      >
        <Play className="h-4 w-4" />
      </Button>

      {/* Cover Image - Hidden on mobile */}
      <div className="hidden lg:block shrink-0">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={song.title}
            className="h-14 w-14 rounded object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded bg-muted flex items-center justify-center">
            <Music className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Title & Artist - Mobile: Full width, Desktop: Column */}
      <div className="min-w-0 lg:col-span-1">
        <h3 className="font-semibold truncate">{song.title}</h3>
        <p className="text-sm text-muted-foreground truncate lg:hidden">
          {song.artist}
        </p>
        <p className="text-sm text-muted-foreground truncate hidden lg:block">
          {song.artist}
        </p>
      </div>

      {/* Album - Desktop Only */}
      <div className="hidden lg:block min-w-0">
        <p className="text-sm text-muted-foreground truncate">{song.album}</p>
      </div>

      {/* Duration - Desktop Only */}
      <div className="hidden lg:block">
        <span className="text-sm text-muted-foreground">
          {formatDuration(song.duration)}
        </span>
      </div>

      {/* Download Button */}
      <div className="shrink-0">
        <DownloadButton song={song} />
      </div>
    </div>
  );
}
