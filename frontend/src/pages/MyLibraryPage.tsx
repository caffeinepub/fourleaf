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
  const { data: personalSongs, isLoading, refetch } = useGetPersonalSongs();
  const { setQueue, play, getCurrentItem } = useAudioQueue();
  const { query } = useHeaderSearch();
  const removePersonalSong = useRemovePersonalSong();
  const currentItem = getCurrentItem();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

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
      toast.success('Song removed from your library');
    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error(error.message || 'Failed to remove song');
    }
  };

  const handleUploadDialogClose = (open: boolean) => {
    setUploadDialogOpen(open);
    if (!open && isAuthenticated) {
      refetch();
    }
  };

  // Show sign-in prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="container py-8 max-w-screen-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display mb-2">My Library</h1>
            <p className="text-muted-foreground">Your personal music collection</p>
          </div>
          <Button
            onClick={() => setUploadDialogOpen(true)}
            size="lg"
            className="gap-2 shrink-0"
          >
            <Upload className="h-5 w-5" />
            Upload Track
          </Button>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Sign in to access your library</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Log in with Internet Identity to upload and manage your personal music collection.
              </p>
            </div>
            <Button onClick={login} disabled={isLoggingIn} size="lg">
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </Button>
          </CardContent>
        </Card>

        <PersonalSongUploadDialog
          open={uploadDialogOpen}
          onOpenChange={handleUploadDialogClose}
        />
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
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-screen-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-2">My Library</h1>
          <p className="text-muted-foreground">
            {filteredSongs.length === 0
              ? 'No songs yet'
              : `${filteredSongs.length} ${filteredSongs.length === 1 ? 'song' : 'songs'}`}
          </p>
        </div>
        <Button
          onClick={() => setUploadDialogOpen(true)}
          size="lg"
          className="gap-2 shrink-0"
        >
          <Upload className="h-5 w-5" />
          Upload Track
        </Button>
      </div>

      {filteredSongs.length === 0 ? (
        <Alert>
          <Music className="h-4 w-4" />
          <AlertDescription>
            {query.trim()
              ? 'No songs match your search.'
              : 'Your library is empty. Upload your first track to get started!'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {filteredSongs.map((song, index) => (
            <Card
              key={Number(song.id)}
              className="hover:bg-accent/50 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlaySong(song, index)}
                    className="shrink-0"
                  >
                    <Play className="h-5 w-5" />
                  </Button>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{song.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {song.artist} • {song.album}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(Number(song.duration) / 60)}:
                      {(Number(song.duration) % 60).toString().padStart(2, '0')}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSong(song.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PersonalSongUploadDialog
        open={uploadDialogOpen}
        onOpenChange={handleUploadDialogClose}
      />
    </div>
  );
}
