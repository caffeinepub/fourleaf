import { useState } from 'react';
import { useUploadPersonalSong } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Music, Image as ImageIcon, Lock } from 'lucide-react';
import { ExternalBlob } from '../../backend';
import type { Update } from '../../backend';

interface PersonalSongUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PersonalSongUploadDialog({ open, onOpenChange }: PersonalSongUploadDialogProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const uploadPersonalSong = useUploadPersonalSong();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const isUploading = uploadPersonalSong.isPending;

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // Try to extract duration from audio file
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(Math.floor(audio.duration).toString());
        URL.revokeObjectURL(audio.src);
      });
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to upload songs');
      return;
    }

    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    try {
      const audioBytes = new Uint8Array(await audioFile.arrayBuffer());
      const audioBlob = ExternalBlob.fromBytes(audioBytes).withUploadProgress((percentage) => {
        // Normalize progress to 0-100 range
        const normalizedProgress = percentage > 1 ? percentage : percentage * 100;
        setUploadProgress(Math.round(normalizedProgress));
      });

      let coverBlob: ExternalBlob | undefined;
      if (coverImage) {
        const coverBytes = new Uint8Array(await coverImage.arrayBuffer());
        coverBlob = ExternalBlob.fromBytes(coverBytes);
      }

      const songUpdate: Update = {
        title,
        artist,
        album,
        duration: BigInt(duration || 0),
        audioFile: audioBlob,
        coverImage: coverBlob,
      };

      await uploadPersonalSong.mutateAsync(songUpdate);
      toast.success('Song uploaded successfully to your private library!');
      
      // Reset form
      setTitle('');
      setArtist('');
      setAlbum('');
      setDuration('');
      setAudioFile(null);
      setCoverImage(null);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload song');
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in with Internet Identity to upload your personal songs.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <Button onClick={login} disabled={isLoggingIn} className="gap-2">
              {isLoggingIn ? 'Logging in...' : 'Login with Internet Identity'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Upload Personal Song
          </DialogTitle>
          <DialogDescription>
            Add your own music to your private library. Your songs are private and only accessible to you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song title"
                required
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist *</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist name"
                required
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album">Album *</Label>
              <Input
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Album name"
                required
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds) *</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration in seconds (auto-detected if possible)"
                required
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audioFile">Audio File *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="audioFile"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  required
                  disabled={isUploading}
                  className="flex-1"
                />
                <Music className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
              {audioFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {audioFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  disabled={isUploading}
                  className="flex-1"
                />
                <ImageIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
              {coverImage && (
                <p className="text-sm text-muted-foreground">
                  Selected: {coverImage.name}
                </p>
              )}
            </div>
          </div>

          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading} className="gap-2">
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload to Private Library'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
