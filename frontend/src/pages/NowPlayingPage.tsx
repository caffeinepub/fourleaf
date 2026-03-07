import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAudioQueue } from '../hooks/useAudioQueue';
import { Play, Pause, SkipBack, SkipForward, Volume2, ChevronDown, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function NowPlayingPage() {
  const navigate = useNavigate();
  const {
    getCurrentItem,
    isPlaying,
    togglePlayPause,
    next,
    previous,
    currentTime,
    duration,
    volume,
    setVolume,
    requestSeek,
    transitionContext,
    closeNowPlaying,
  } = useAudioQueue();

  const currentItem = getCurrentItem();
  const song = currentItem?.song;
  const artworkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!song) {
      navigate({ to: '/' });
    }
  }, [song, navigate]);

  const handleClose = () => {
    closeNowPlaying();
    navigate({ to: '/' });
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    requestSeek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  if (!song) {
    return null;
  }

  const coverUrl = song.coverImage?.getDirectURL();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="now-playing-page fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border/40">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="rounded-full"
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
        <h2 className="text-sm font-medium text-muted-foreground">Now Playing</h2>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-2xl mx-auto w-full">
        {/* Album Artwork */}
        <div
          ref={artworkRef}
          className="w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-2xl mb-8"
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-card flex items-center justify-center">
              <Music className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-display font-bold mb-2 truncate">{song.title}</h1>
          <p className="text-lg text-muted-foreground truncate">{song.artist}</p>
          <p className="text-sm text-muted-foreground/80 truncate">{song.album}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>
        <div className="flex justify-between w-full text-xs text-muted-foreground mb-8">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={previous}
            className="h-12 w-12"
          >
            <SkipBack className="h-6 w-6" />
          </Button>

          <Button
            size="icon"
            onClick={togglePlayPause}
            className="h-16 w-16 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 fill-current" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="h-12 w-12"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <Volume2 className="h-5 w-5 text-muted-foreground shrink-0" />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
