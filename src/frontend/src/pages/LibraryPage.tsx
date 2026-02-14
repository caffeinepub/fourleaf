import { useMemo, useRef, useEffect, useState } from 'react';
import { useGetAllSongs, useGetTotalSongs, usePrefetchSongAudio } from '../hooks/useQueries';
import { useAudioQueue } from '../hooks/useAudioQueue';
import { useHeaderSearch } from '../hooks/useHeaderSearch';
import { useHomeBrowsing } from '../hooks/useHomeBrowsing';
import { Music, Sparkles, TrendingUp, Upload, Flame, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CatalogSongRowCard from '../components/catalog/CatalogSongRowCard';
import PublicSongUploadDialog from '../components/catalog/PublicSongUploadDialog';
import StreamingSection from '../components/home/StreamingSection';
import StreamingCard from '../components/home/StreamingCard';
import HorizontalSnapRow from '../components/home/HorizontalSnapRow';
import { useNavigate } from '@tanstack/react-router';
import type { Song } from '../backend';

export default function LibraryPage() {
  const { data: songs, isLoading } = useGetAllSongs();
  const { data: totalSongs } = useGetTotalSongs();
  const { setQueue, play, getCurrentItem, isPlaying } = useAudioQueue();
  const { query, setQuery } = useHeaderSearch();
  const { activeTab, requestScrollToBrowsing, setActiveTab } = useHomeBrowsing();
  const { prefetchCatalogSong } = usePrefetchSongAudio();
  const currentItem = getCurrentItem();
  const navigate = useNavigate();
  const browsingRef = useRef<HTMLDivElement>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    if (useHomeBrowsing.getState().scrollToBrowsingRequested > 0 && browsingRef.current) {
      browsingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      browsingRef.current.focus({ preventScroll: true });
    }
  }, [useHomeBrowsing.getState().scrollToBrowsingRequested]);

  const filteredSongs = useMemo(() => {
    if (!songs) return [];
    if (!query.trim()) return songs;

    const lowerQuery = query.toLowerCase().trim();
    return songs.filter((song) =>
      song.title.toLowerCase().includes(lowerQuery) ||
      song.artist.toLowerCase().includes(lowerQuery) ||
      song.album.toLowerCase().includes(lowerQuery)
    );
  }, [songs, query]);

  const displayedSongs = useMemo(() => {
    if (activeTab === 'Podcast') {
      return [];
    }
    return filteredSongs;
  }, [filteredSongs, activeTab]);

  const recommendedSongs = useMemo(() => {
    if (!songs || songs.length === 0) return [];
    const sorted = [...songs].sort((a, b) => Number(b.id - a.id));
    return sorted.slice(0, 8);
  }, [songs]);

  const latestUploads = useMemo(() => {
    if (!songs || songs.length === 0) return [];
    const sorted = [...songs].sort((a, b) => Number(b.id - a.id));
    return sorted.slice(0, 10);
  }, [songs]);

  const handlePlaySong = async (song: Song, index: number, sourceList: Song[]) => {
    const queueItems = sourceList.map(s => ({ source: 'catalog' as const, song: s }));
    
    await prefetchCatalogSong(song.id);
    
    setQueue(queueItems, index);
    play();
  };

  const handlePlayFromCard = async (song: Song, sourceList: Song[]) => {
    const index = sourceList.findIndex(s => s.id === song.id);
    await handlePlaySong(song, index, sourceList);
  };

  const handleShowAll = () => {
    requestScrollToBrowsing();
    setActiveTab('All');
  };

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

  const showHomepageView = !query.trim();

  return (
    <div className="w-full">
      <div 
        className="hero-bg-animated relative px-6 py-12 lg:py-16 overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/75 to-background"
          aria-hidden="true"
        />
        <div className="container max-w-screen-2xl relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold font-display mb-2 drop-shadow-lg text-primary">
                Discover Music
              </h1>
              <p className="text-base sm:text-lg text-foreground/90 drop-shadow">
                {totalSongs ? `${totalSongs.toString()} tracks available` : 'Explore the collection'}
              </p>
            </div>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              size="lg"
              className="gap-2 shadow-lg shrink-0"
            >
              <Upload className="h-5 w-5" />
              Upload Track
            </Button>
          </div>
        </div>
      </div>

      <div className="sticky top-[57px] lg:top-[57px] z-40 bg-background/95 backdrop-blur border-b border-border/40 px-6 py-4">
        <div className="container max-w-screen-2xl">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tracks, artists, albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-screen-2xl px-6">
        {showHomepageView ? (
          <>
            {recommendedSongs.length > 0 && (
              <StreamingSection
                title="Featured Today"
                icon={<Sparkles className="h-6 w-6" />}
                onShowAll={handleShowAll}
              >
                <HorizontalSnapRow>
                  {recommendedSongs.map((song) => (
                    <StreamingCard
                      key={Number(song.id)}
                      song={song}
                      onPlay={() => handlePlayFromCard(song, recommendedSongs)}
                    />
                  ))}
                </HorizontalSnapRow>
              </StreamingSection>
            )}

            {latestUploads.length > 0 && (
              <StreamingSection
                title="Latest Uploads"
                icon={<TrendingUp className="h-6 w-6" />}
                onShowAll={handleShowAll}
              >
                <HorizontalSnapRow>
                  {latestUploads.map((song) => (
                    <StreamingCard
                      key={Number(song.id)}
                      song={song}
                      onPlay={() => handlePlayFromCard(song, latestUploads)}
                    />
                  ))}
                </HorizontalSnapRow>
              </StreamingSection>
            )}

            {songs && songs.length > 0 && (
              <StreamingSection
                title="Popular This Week"
                icon={<Flame className="h-6 w-6" />}
                onShowAll={handleShowAll}
              >
                <HorizontalSnapRow>
                  {songs.slice(0, 8).map((song) => (
                    <StreamingCard
                      key={Number(song.id)}
                      song={song}
                      onPlay={() => handlePlayFromCard(song, songs)}
                    />
                  ))}
                </HorizontalSnapRow>
              </StreamingSection>
            )}
          </>
        ) : null}

        <div ref={browsingRef} tabIndex={-1} className="outline-none">
          {displayedSongs.length === 0 ? (
            <Alert>
              <Music className="h-4 w-4" />
              <AlertDescription>
                {activeTab === 'Podcast' 
                  ? 'No podcasts available yet.'
                  : query.trim()
                  ? 'No tracks match your search.'
                  : 'No tracks available yet.'}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {displayedSongs.map((song, index) => (
                <CatalogSongRowCard
                  key={Number(song.id)}
                  song={song}
                  index={index}
                  onPlay={() => handlePlaySong(song, index, displayedSongs)}
                  isPlaying={isPlaying && currentItem?.song.id === song.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <PublicSongUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  );
}
