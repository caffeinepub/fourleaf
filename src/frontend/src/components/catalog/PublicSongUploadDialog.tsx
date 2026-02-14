import { useState, useRef } from 'react';
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
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const isUploading = uploadPublicSong.isPending;

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
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

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setAlbum('');
    setDuration('');
    setAudioFile(null);
    setCoverImage(null);
    setAudioProgress(0);
    setCoverProgress(0);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to upload songs');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a song title');
      return;
    }

    if (!artist.trim()) {
      toast.error('Please enter an artist name');
      return;
    }

    if (!album.trim()) {
      toast.error('Please enter an album name');
      return;
    }

    if (!duration.trim() || Number(duration) <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    try {
      setAudioProgress(0);
      setCoverProgress(0);

      const audioBytes = new Uint8Array(await audioFile.arrayBuffer());
      const audioBlob = ExternalBlob.fromBytes(audioBytes).withUploadProgress((percentage) => {
        const normalized = Math.min(100, Math.max(0, percentage > 1 ? percentage : percentage * 100));
        setAudioProgress(Math.round(normalized));
      });

      let coverBlob: ExternalBlob | undefined;
      if (coverImage) {
        const coverBytes = new Uint8Array(await coverImage.arrayBuffer());
        coverBlob = ExternalBlob.fromBytes(coverBytes).withUploadProgress((percentage) => {
          const normalized = Math.min(100, Math.max(0, percentage > 1 ? percentage : percentage * 100));
          setCoverProgress(Math.round(normalized));
        });
      }

      const songUpdate: Update = {
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        duration: BigInt(duration),
        audioFile: audioBlob,
        coverImage: coverBlob,
      };

      await uploadPublicSong.mutateAsync(songUpdate);
      toast.success('Song uploaded successfully and is now publicly available for streaming!');
      
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      // The error is already normalized by the mutation hook
      const errorMsg = error.message || 'Failed to upload song';
      toast.error(errorMsg);
      
      setAudioProgress(0);
      setCoverProgress(0);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false);
    }
  };

  const handleInteractOutside = (e: Event) => {
    if (isUploading) {
      e.preventDefault();
    }
  };

  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    if (isUploading) {
      e.preventDefault();
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent onInteractOutside={handleInteractOutside} onEscapeKeyDown={handleEscapeKeyDown}>
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

  const totalProgress = coverImage 
    ? Math.round((audioProgress * 0.7) + (coverProgress * 0.3))
    : audioProgress;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={handleInteractOutside} onEscapeKeyDown={handleEscapeKeyDown}>
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
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audioFile">Audio File *</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={audioInputRef}
                  id="audioFile"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
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
                  ref={coverInputRef}
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

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
              {coverImage && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Audio:</span>
                    <span>{audioProgress}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cover:</span>
                    <span>{coverProgress}%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end">
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
              {isUploading ? 'Uploading...' : 'Upload Song'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
