import { useEffect, useRef, useState } from 'react';
import { useAudioQueue } from '../../hooks/useAudioQueue';
import { useStreamSongAudio, useStreamPersonalSongAudio } from '../../hooks/useQueries';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';

export default function AudioPlayerBar() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const {
    getCurrentItem,
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlayPause,
    next,
    previous,
    setVolume,
    setCurrentTime,
    setDuration,
    pause,
    queue,
    currentIndex,
    removeCurrent,
    closePlayer,
    openNowPlaying,
    seekRequest,
    clearSeekRequest,
    setTransitionContext,
  } = useAudioQueue();

  const navigate = useNavigate();
  const currentItem = getCurrentItem();
  const currentSong = currentItem?.song;
  
  const { data: catalogAudioBlob, isError: catalogError } = useStreamSongAudio(
    currentItem?.source === 'catalog' ? currentSong?.id ?? null : null
  );
  const { data: personalAudioBlob, isError: personalError } = useStreamPersonalSongAudio(
    currentItem?.source === 'personal' ? currentSong?.id ?? null : null
  );

  const audioBlob = currentItem?.source === 'catalog' ? catalogAudioBlob : personalAudioBlob;
  const hasStreamError = currentItem?.source === 'catalog' ? catalogError : personalError;
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Handle seek requests from Now Playing
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && seekRequest !== null && audioUrl) {
      audio.currentTime = seekRequest;
      setCurrentTime(seekRequest);
      clearSeekRequest();
    }
  }, [seekRequest, audioUrl]);

  // Reset timing state when song changes
  useEffect(() => {
    if (currentSong) {
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentSong?.id]);

  useEffect(() => {
    if (audioBlob) {
      try {
        const url = audioBlob.getDirectURL();
        setAudioUrl(url);
      } catch (error) {
        console.error('Failed to get audio URL:', error);
        setAudioUrl(null);
      }
    } else {
      setAudioUrl(null);
    }
  }, [audioBlob]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    // Pause and reset before switching tracks
    audio.pause();
    audio.currentTime = 0;
    audio.src = audioUrl;
    audio.preload = 'auto';
    audio.load();

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        pause();
      });
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        pause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && !isNaN(audio.currentTime)) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const handleEnded = () => {
    if (currentIndex < queue.length - 1) {
      next();
    } else {
      pause();
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && audioUrl) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleRemove = () => {
    removeCurrent();
  };

  const handleClose = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    closePlayer();
  };

  const handleOpenNowPlaying = () => {
    // Capture artwork geometry for transition
    if (artworkRef.current) {
      const rect = artworkRef.current.getBoundingClientRect();
      const coverUrl = currentSong?.coverImage?.getDirectURL();
      setTransitionContext({
        sourceRect: rect,
        sourceImageUrl: coverUrl,
      });
    }
    openNowPlaying();
    navigate({ to: '/now-playing' });
  };

  if (!currentSong) {
    return null;
  }

  const coverUrl = currentSong.coverImage?.getDirectURL();
  const isStreamAvailable = !!audioUrl && !hasStreamError;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      <Card className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container py-3 relative">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClose}
            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground z-50"
            aria-label="Close player"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-4">
            <div 
              ref={artworkRef}
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleOpenNowPlaying}
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={currentSong.title}
                  className="h-12 w-12 rounded object-cover shrink-0"
                />
              ) : (
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">
                  <Music className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm truncate">{currentSong.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
              </div>
              <Maximize2 className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>

            <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={previous}
                  disabled={currentIndex <= 0 || !isStreamAvailable}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="default"
                  onClick={togglePlayPause}
                  className="h-10 w-10"
                  disabled={!isStreamAvailable}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={next}
                  disabled={currentIndex >= queue.length - 1 || !isStreamAvailable}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleRemove}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove from queue"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="flex-1"
                  disabled={!isStreamAvailable}
                />
                <span className="text-xs text-muted-foreground w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-end">
              <Button size="icon" variant="ghost" onClick={toggleMute}>
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={(value) => {
                  setVolume(value[0]);
                  if (isMuted) setIsMuted(false);
                }}
                className="w-24 hidden sm:block"
              />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
