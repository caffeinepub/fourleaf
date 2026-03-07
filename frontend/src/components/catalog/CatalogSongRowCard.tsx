import { Play, Pause, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DownloadButton from './DownloadButton';
import type { Song } from '../../backend';

interface CatalogSongRowCardProps {
  song: Song;
  index: number;
  onPlay: () => void;
  isPlaying?: boolean;
}

export default function CatalogSongRowCard({ song, index, onPlay, isPlaying }: CatalogSongRowCardProps) {
  const coverUrl = song.coverImage?.getDirectURL();
  const durationMinutes = Math.floor(Number(song.duration) / 60);
  const durationSeconds = Number(song.duration) % 60;
  const formattedDuration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

  return (
    <div className="group grid grid-cols-1 lg:grid-cols-[auto_60px_1fr_1fr_80px_auto] gap-4 px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors items-center">
      <div className="hidden lg:flex items-center justify-center w-12 text-sm text-muted-foreground group-hover:text-foreground">
        <span className="group-hover:hidden">{index + 1}</span>
        <Button
          size="icon"
          variant="ghost"
          onClick={onPlay}
          className="hidden group-hover:flex h-8 w-8"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="hidden lg:block">
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

      <div className="flex items-center gap-3 lg:block min-w-0">
        <div className="lg:hidden shrink-0">
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
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{song.title}</div>
          <div className="text-sm text-muted-foreground truncate">{song.artist}</div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onPlay}
          className="lg:hidden shrink-0 h-10 w-10"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="hidden lg:block text-sm text-muted-foreground truncate">
        {song.album}
      </div>

      <div className="hidden lg:block text-sm text-muted-foreground text-center">
        {formattedDuration}
      </div>

      <div className="hidden lg:flex items-center justify-end gap-2">
        <DownloadButton song={song} />
      </div>
    </div>
  );
}
