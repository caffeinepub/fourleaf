import { useState, useMemo } from 'react';
import { useGetPersonalSongMetadata, useRemovePersonalSong } from '../hooks/useQueries';
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
import type { SongMetadata } from '../backend';

export default function MyLibraryPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: personalSongs, isLoading } = useGetPersonalSongMetadata();
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

    const lowerQuery = query.toLowerCase();
    return personalSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery) ||
        song.album.toLowerCase().includes(lowerQuery)
    );
  }, [personalSongs, query]);

  const handlePlaySong = (song: SongMetadata, index: number) => {
    if (filteredSongs) {
      const queueItems = filteredSongs.map(s => ({ source: 'personal' as const, song: s }));
      setQueue(queueItems, index);
      play();
    }
  };

  const handleRemoveSong = async (songId: bigint) => {
    try {
      await removePersonalSong.mutateAsync(songId);
      toast.success('Song removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove song');
    }
  };

  const formatDuration = (seconds: bigint) => {
    const totalSeconds = Number(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card>
          <CardContent className="py-16 text-center">
            <LogIn className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to access your personal music library and upload your own songs.
            </p>
            <Button onClick={login} disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Login with Internet Identity'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!personalSongs || personalSongs.length === 0) {
    return (
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">My Library</h1>
            <p className="text-muted-foreground">Your personal music collection</p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Song
          </Button>
        </div>

        <Card>
          <CardContent className="py-16 text-center">
            <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">You have no personal songs yet</h2>
            <p className="text-muted-foreground mb-6">
              Upload your own music files to build your personal library and enjoy them anytime.
            </p>
            <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Your First Song
            </Button>
          </CardContent>
        </Card>

        <PersonalSongUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">My Library</h1>
          <p className="text-muted-foreground">
            {query.trim() ? (
              <>
                {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'} found
                {' • '}
                {personalSongs.length} total
              </>
            ) : (
              <>
                {personalSongs.length} {personalSongs.length === 1 ? 'song' : 'songs'} in your collection
              </>
            )}
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Song
        </Button>
      </div>

      <Alert className="mb-6 border-primary/50 bg-primary/5">
        <Music className="h-4 w-4 text-primary" />
        <AlertDescription>
          Your personal songs are private and only accessible to you. They won't appear in the public Music Library.
        </AlertDescription>
      </Alert>

      {filteredSongs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No songs found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search query to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredSongs.map((song, index) => {
            const isCurrentSong = currentItem?.source === 'personal' && currentItem.song.id === song.id;
            const coverUrl = song.coverImage?.getDirectURL();

            return (
              <Card
                key={song.id.toString()}
                className={`transition-all hover:shadow-md ${
                  isCurrentSong ? 'ring-2 ring-primary shadow-glow-sm' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      size="icon"
                      variant={isCurrentSong ? 'default' : 'outline'}
                      onClick={() => handlePlaySong(song, index)}
                      className="shrink-0"
                    >
                      <Play className="h-4 w-4" />
                    </Button>

                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={song.title}
                        className="h-14 w-14 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded bg-muted flex items-center justify-center shrink-0">
                        <Music className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{song.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.artist} • {song.album}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm text-muted-foreground hidden sm:block">
                        {formatDuration(song.duration)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveSong(song.id)}
                        disabled={removePersonalSong.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <PersonalSongUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
    </div>
  );
}
