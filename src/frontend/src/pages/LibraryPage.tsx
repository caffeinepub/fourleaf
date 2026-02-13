import { useMemo, useRef, useEffect, useState } from 'react';
import { useGetAllSongs, useGetTotalSongs } from '../hooks/useQueries';
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
  const { setQueue, play, getCurrentItem } = useAudioQueue();
  const { query, setQuery } = useHeaderSearch();
  const { activeTab, requestScrollToBrowsing, setActiveTab } = useHomeBrowsing();
  const currentItem = getCurrentItem();
  const navigate = useNavigate();
  const browsingRef = useRef<HTMLDivElement>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Handle scroll to browsing section
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

  // Recommended Today: newest songs (by descending ID), limited to 8 for horizontal scroll
  const recommendedSongs = useMemo(() => {
    if (!songs || songs.length === 0) return [];
    const sorted = [...songs].sort((a, b) => Number(b.id - a.id));
    return sorted.slice(0, 8);
  }, [songs]);

  // Latest Uploads: similar to recommended but different slice
  const latestUploads = useMemo(() => {
    if (!songs || songs.length === 0) return [];
    const sorted = [...songs].sort((a, b) => Number(b.id - a.id));
    return sorted.slice(0, 10);
  }, [songs]);

  const handlePlaySong = (song: Song, index: number, sourceList: Song[]) => {
    const queueItems = sourceList.map(s => ({ source: 'catalog' as const, song: s }));
    setQueue(queueItems, index);
    play();
  };

  const handlePlayFromCard = (song: Song, sourceList: Song[]) => {
    const index = sourceList.findIndex(s => s.id === song.id);
    handlePlaySong(song, index, sourceList);
  };

  // "Show all" handler: scrolls to browsing section and sets appropriate tab
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
      {/* Gradient Header */}
      <div 
        className="relative px-6 py-12 lg:py-16"
        style={{
          background: 'linear-gradient(180deg, oklch(0.55 0.22 25) 0%, oklch(0.18 0 0) 100%)'
        }}
      >
        <div className="container max-w-screen-2xl relative z-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold font-display mb-2">
                Music Library
              </h1>
              <p className="text-lg text-foreground/80">
                {totalSongs ? `${totalSongs.toString()} songs` : 'Explore the catalog'}
              </p>
            </div>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Upload className="h-5 w-5" />
              Upload Song
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-[57px] lg:top-[57px] z-40 bg-background/95 backdrop-blur border-b border-border/40 px-6 py-4">
        <div className="container max-w-screen-2xl">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search songs, artists, albums..."
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
            {/* Recommended Today Section */}
            {recommendedSongs.length > 0 && (
              <StreamingSection
                title="Recommended Today"
                icon={<Sparkles className="h-6 w-6" />}
                onShowAll={handleShowAll}
              >
                <HorizontalSnapRow>
                  {recommendedSongs.map((song) => (
                    <StreamingCard
                      key={song.id.toString()}
                      song={song}
                      isPlaying={
                        currentItem?.source === 'catalog' &&
                        currentItem.song.id === song.id
                      }
                      onPlay={() => handlePlayFromCard(song, recommendedSongs)}
                    />
                  ))}
                </HorizontalSnapRow>
              </StreamingSection>
            )}

            {/* Latest Uploads Section */}
            {latestUploads.length > 0 && (
              <StreamingSection
                title="Latest Uploads"
                icon={<TrendingUp className="h-6 w-6" />}
                onShowAll={handleShowAll}
              >
                <HorizontalSnapRow>
                  {latestUploads.map((song) => (
                    <StreamingCard
                      key={song.id.toString()}
                      song={song}
                      isPlaying={
                        currentItem?.source === 'catalog' &&
                        currentItem.song.id === song.id
                      }
                      onPlay={() => handlePlayFromCard(song, latestUploads)}
                    />
                  ))}
                </HorizontalSnapRow>
              </StreamingSection>
            )}

            {/* Browse All Section */}
            <div ref={browsingRef} tabIndex={-1} className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                  <Music className="h-6 w-6" />
                  Browse All
                </h2>
              </div>

              {/* Tab Pills */}
              <div className="flex gap-2 mb-6">
                {['All', 'Music', 'Podcast'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tracklist */}
              {displayedSongs.length > 0 ? (
                <div className="space-y-2">
                  {/* Column Headers - Desktop Only */}
                  <div className="hidden lg:grid grid-cols-[auto_80px_1fr_200px_120px_80px] gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border/50">
                    <div className="w-12"></div>
                    <div>Cover</div>
                    <div>Title</div>
                    <div>Album</div>
                    <div>Duration</div>
                    <div></div>
                  </div>

                  {displayedSongs.map((song, index) => (
                    <CatalogSongRowCard
                      key={song.id.toString()}
                      song={song}
                      index={index}
                      isCurrentSong={
                        currentItem?.source === 'catalog' &&
                        currentItem.song.id === song.id
                      }
                      onPlay={(s, i) => handlePlaySong(s, i, displayedSongs)}
                    />
                  ))}
                </div>
              ) : (
                <Alert>
                  <Music className="h-4 w-4" />
                  <AlertDescription>
                    {activeTab === 'Podcast'
                      ? 'No podcasts available yet.'
                      : 'No songs found in the library.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        ) : (
          // Search Results View
          <div>
            <h2 className="text-2xl font-bold font-display mb-6">
              Search Results {displayedSongs.length > 0 && `(${displayedSongs.length})`}
            </h2>

            {displayedSongs.length > 0 ? (
              <div className="space-y-2">
                {/* Column Headers - Desktop Only */}
                <div className="hidden lg:grid grid-cols-[auto_80px_1fr_200px_120px_80px] gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border/50">
                  <div className="w-12"></div>
                  <div>Cover</div>
                  <div>Title</div>
                  <div>Album</div>
                  <div>Duration</div>
                  <div></div>
                </div>

                {displayedSongs.map((song, index) => (
                  <CatalogSongRowCard
                    key={song.id.toString()}
                    song={song}
                    index={index}
                    isCurrentSong={
                      currentItem?.source === 'catalog' &&
                      currentItem.song.id === song.id
                    }
                    onPlay={(s, i) => handlePlaySong(s, i, displayedSongs)}
                  />
                ))}
              </div>
            ) : (
              <Alert>
                <Music className="h-4 w-4" />
                <AlertDescription>
                  No songs found matching "{query}". Try a different search term.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      <PublicSongUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  );
}
