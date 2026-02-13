import { useState } from 'react';
import { useUploadPublicSong } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Music, Image as ImageIcon, Globe } from 'lucide-react';
import { ExternalBlob } from '../../backend';
import type { Update } from '../../backend';

interface PublicSongUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublicSongUploadDialog({ open, onOpenChange }: PublicSongUploadDialogProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const uploadPublicSong = useUploadPublicSong();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const isUploading = uploadPublicSong.isPending;

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

    if (!title.trim() || !artist.trim() || !album.trim()) {
      toast.error('Please fill in all required fields');
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
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        duration: BigInt(duration || 0),
        audioFile: audioBlob,
        coverImage: coverBlob,
      };

      await uploadPublicSong.mutateAsync(songUpdate);
      toast.success('Song uploaded successfully and is now publicly available for streaming!');
      
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
              Please log in with Internet Identity to upload songs to the public catalog.
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
            <Globe className="h-5 w-5 text-primary" />
            Upload Public Song
          </DialogTitle>
          <DialogDescription>
            Share your music with everyone! Songs uploaded here will be publicly available for anyone to stream on the website.
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
              {isUploading ? 'Uploading...' : 'Upload to Public Catalog'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
