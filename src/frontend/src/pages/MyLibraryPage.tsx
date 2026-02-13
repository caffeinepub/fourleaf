import { useState, useMemo } from 'react';
import { useGetPersonalSongs, useRemovePersonalSong } from '../hooks/useQueries';
import { useAudioQueue } from '../hooks/useAudioQueue';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useHeaderSearch } from '../hooks/useHeaderSearch';
import { Music, Play, Upload, Trash2, LogIn } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PersonalSongUploadDialog from '../components/personal/PersonalSongUploadDialog';
import { toast } from 'sonner';
import type { PersonalSong } from '../backend';

export default function MyLibraryPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: personalSongs, isLoading } = useGetPersonalSongs();
  const { setQueue, play, getCurrentItem } = useAudioQueue();
  const { query } = useHeaderSearch();
  const removePersonalSong = useRemovePersonalSong();
  const currentItem = getCurrentItem();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const filteredSongs = useMemo(() => {
    if (!personalSongs) return [];
    if (!query.trim()) return personalSongs;

    const lowerQuery = query.toLowerCase().trim();
    return personalSongs.filter((song) =>
      song.title.toLowerCase().includes(lowerQuery) ||
      song.artist.toLowerCase().includes(lowerQuery) ||
      song.album.toLowerCase().includes(lowerQuery)
    );
  }, [personalSongs, query]);

  const handlePlaySong = (song: PersonalSong, index: number) => {
    const queueItems = filteredSongs.map(s => ({ source: 'personal' as const, song: s }));
    setQueue(queueItems, index);
    play();
  };

  const handleRemoveSong = async (songId: bigint) => {
    try {
      await removePersonalSong.mutateAsync(songId);
      toast.success('Track removed from your library');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove track');
    }
  };

  const formatDuration = (seconds: bigint) => {
    const totalSeconds = Number(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!identity) {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="border-primary/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LogIn className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground text-center mb-6">
              Sign in to access your personal music library and upload your own tracks.
            </p>
            <Button
              onClick={login}
              disabled={loginStatus === 'logging-in'}
              size="lg"
              className="gap-2"
            >
              {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8 max-w-screen-2xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-screen-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">My Library</h1>
          <p className="text-muted-foreground">
            Your personal collection • {filteredSongs.length} {filteredSongs.length === 1 ? 'track' : 'tracks'}
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Track
        </Button>
      </div>

      {filteredSongs.length === 0 ? (
        <Alert>
          <Music className="h-4 w-4" />
          <AlertDescription>
            {query.trim() 
              ? 'No tracks match your search.'
              : 'Your library is empty. Upload your first track to get started!'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {filteredSongs.map((song, index) => {
            const isCurrentSong = currentItem?.song.id === song.id;
            const coverUrl = song.coverImage?.getDirectURL();

            return (
              <Card 
                key={Number(song.id)}
                className={isCurrentSong ? 'border-primary/50 bg-accent/20' : ''}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <Button
                    size="icon"
                    variant={isCurrentSong ? 'default' : 'ghost'}
                    onClick={() => handlePlaySong(song, index)}
                    className="shrink-0"
                  >
                    <Play className="h-4 w-4" />
                  </Button>

                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={song.title}
                      className="h-16 w-16 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded bg-muted flex items-center justify-center shrink-0">
                      <Music className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{song.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    <p className="text-xs text-muted-foreground">
                      {song.album} • {formatDuration(song.duration)}
                    </p>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveSong(song.id)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <PersonalSongUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  );
}
