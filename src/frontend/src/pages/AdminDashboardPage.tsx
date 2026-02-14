import { useState } from 'react';
import { useGetAllSongs, useRemoveSong, useGetTotalSongs } from '../hooks/useQueries';
import { Plus, Pencil, Trash2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import SongEditorDialog from '../components/admin/SongEditorDialog';
import GrantAdminControl from '../components/admin/GrantAdminControl';
import { toast } from 'sonner';
import type { Song } from '../backend';

export default function AdminDashboardPage() {
  const { data: songs, isLoading, refetch } = useGetAllSongs();
  const { data: totalSongs } = useGetTotalSongs();
  const removeSong = useRemoveSong();
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);

  const handleDelete = async () => {
    if (!deletingSong) return;

    try {
      await removeSong.mutateAsync(deletingSong.id);
      toast.success('Track deleted successfully');
      setDeletingSong(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete track');
    }
  };

  const formatDuration = (seconds: bigint) => {
    const totalSeconds = Number(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsCreating(false);
      setEditingSong(null);
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your catalog • {totalSongs !== undefined ? Number(totalSongs) : 0} total tracks
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Track
        </Button>
      </div>

      <GrantAdminControl />

      <Separator />

      <div>
        <h2 className="text-2xl font-display font-bold mb-4">Catalog Tracks</h2>
        {!songs || songs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Music className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start building your catalog by uploading your first track
              </p>
              <Button onClick={() => setIsCreating(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Upload Track
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {songs.map((song) => {
              const coverUrl = song.coverImage?.getDirectURL();
              return (
                <Card key={Number(song.id)}>
                  <CardContent className="flex items-center gap-4 p-4">
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
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingSong(song)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeletingSong(song)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <SongEditorDialog
        open={isCreating || !!editingSong}
        onOpenChange={handleDialogClose}
        song={editingSong}
      />

      <AlertDialog open={!!deletingSong} onOpenChange={(open) => !open && setDeletingSong(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Track</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingSong?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
