import { Play, Shuffle, SkipBack, SkipForward, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import HorizontalSnapRow from '@/components/home/HorizontalSnapRow';
import { useAudioQueue } from '@/hooks/useAudioQueue';
import { useGetAllSongs } from '@/hooks/useQueries';

export default function PlayerLayoutPage() {
  const currentItem = useAudioQueue((state) => state.getCurrentItem());
  const { data: allSongs = [] } = useGetAllSongs();
  const { play, togglePlayPause, isPlaying } = useAudioQueue();

  const currentSong = currentItem?.song;
  const songTitle = currentSong?.title || 'No Track Playing';
  const artistName = currentSong?.artist || 'Unknown Artist';
  const albumName = currentSong?.album || 'Unknown Album';

  const trackList = [
    { title: 'Track One', duration: '3:45' },
    { title: 'Track Two', duration: '4:12' },
    { title: 'Track Three', duration: '3:28' },
    { title: 'Track Four', duration: '5:01' },
  ];

  const albumArtTiles = allSongs.slice(0, 8);

  const handlePlayClick = () => {
    if (currentItem) {
      togglePlayPause();
    } else if (allSongs.length > 0) {
      const firstSong = allSongs[0];
      useAudioQueue.getState().setQueue([{ source: 'catalog', song: firstSong }], 0);
      play();
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col gap-3 p-3">
        <Card className="bg-card border-border rounded-lg p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-base font-medium hover:bg-accent"
          >
            <Music className="h-5 w-5 mr-3" />
            Library
          </Button>
        </Card>

        <Card className="bg-card border-border rounded-lg p-4 flex-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-base font-medium hover:bg-accent"
          >
            <Music className="h-5 w-5 mr-3" />
            Collection
          </Button>
        </Card>
      </aside>

      {/* Center Main Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Hero Section - using theme tokens */}
        <section
          className="h-80 flex items-end p-8 bg-gradient-to-b from-primary/40 to-background"
        >
          <h1 className="text-6xl font-bold font-display text-primary">{songTitle}</h1>
        </section>

        {/* Playback Controls Row */}
        <div className="flex items-center gap-4 px-8 py-6">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={handlePlayClick}
          >
            <Play className="h-6 w-6 fill-current" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10"
          >
            <Shuffle className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Track List */}
        <div className="px-8 py-4">
          <div className="space-y-2">
            {trackList.map((track, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground w-6">{index + 1}</span>
                  <span className="font-medium">{track.title}</span>
                </div>
                <span className="text-muted-foreground">{track.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* More by Artist Section */}
        <div className="px-8 py-6">
          <h2 className="text-2xl font-bold font-display mb-4">More by {artistName}</h2>
          <HorizontalSnapRow className="gap-4">
            {albumArtTiles.map((song) => (
              <div
                key={song.id.toString()}
                className="shrink-0 w-40 h-40 rounded-lg overflow-hidden bg-card snap-start border border-border/40"
              >
                {song.coverImage ? (
                  <img
                    src={song.coverImage.getDirectURL()}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Music className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {albumArtTiles.length === 0 && (
              <div className="text-muted-foreground py-8">No albums available</div>
            )}
          </HorizontalSnapRow>
        </div>
      </main>

      {/* Right Panel */}
      <aside className="w-80 shrink-0 flex flex-col gap-4 p-4 bg-card/50 border-l border-border/40">
        <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted">
          {currentSong?.coverImage ? (
            <img
              src={currentSong.coverImage.getDirectURL()}
              alt={songTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>

        <Card className="bg-card border-border rounded-lg p-6">
          <h3 className="text-xl font-bold font-display mb-2">{artistName}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {currentSong
              ? `Currently playing "${songTitle}" from the album "${albumName}". Enjoy the music and explore more tracks from this artist.`
              : 'Select a track to see artist information and details here.'}
          </p>
        </Card>
      </aside>
    </div>
  );
}
