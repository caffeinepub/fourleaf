import { Play, Pause, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Song } from '../../backend';
import { useRef } from 'react';
import { useAudioQueue } from '../../hooks/useAudioQueue';
import { useUISounds } from '../../hooks/useUISounds';

interface StreamingCardProps {
  song: Song;
  onPlay: () => void;
  isPlaying?: boolean;
}

export default function StreamingCard({ song, onPlay, isPlaying }: StreamingCardProps) {
  const coverUrl = song.coverImage?.getDirectURL();
  const cardRef = useRef<HTMLDivElement>(null);
  const { setTransitionContext } = useAudioQueue();
  const { playClick } = useUISounds();

  const handleClick = () => {
    playClick();
    // Capture card geometry for transition
    if (cardRef.current) {
      const rect = cardRef.current.querySelector('img, .cover-placeholder')?.getBoundingClientRect();
      if (rect) {
        setTransitionContext({
          sourceRect: rect,
          sourceImageUrl: coverUrl,
        });
      }
    }
    onPlay();
  };

  const handlePlayButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClick();
  };

  return (
    <div
      ref={cardRef}
      className="group relative flex-shrink-0 w-48 cursor-pointer transition-transform hover:scale-105"
      onClick={handleClick}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3 shadow-md">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="cover-placeholder w-full h-full flex items-center justify-center bg-muted">
            <Music className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <Button
          size="icon"
          variant="default"
          className="absolute bottom-2 right-2 h-12 w-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
          onClick={handlePlayButtonClick}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
      </div>

      <div className="px-1">
        <h3 className="font-semibold text-sm truncate mb-1">{song.title}</h3>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>
    </div>
  );
}
