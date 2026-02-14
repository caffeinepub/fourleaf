import { useState, useRef } from 'react';
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
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const isUploading = uploadPersonalSong.isPending;

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

      await uploadPersonalSong.mutateAsync(songUpdate);
      toast.success('Song uploaded successfully to your private library!');
      
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Upload error:', error);
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

  const totalProgress = coverImage && audioFile
    ? Math.round((audioProgress * 0.7) + (coverProgress * 0.3))
    : audioFile
    ? audioProgress
    : 0;

  const showProgress = isUploading && (audioProgress > 0 || coverProgress > 0 || audioFile !== null);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Upload Personal Track
          </DialogTitle>
          <DialogDescription>
            Upload a track to your private library. Only you can access and play this track.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artist">Artist *</Label>
            <Input
              id="artist"
              placeholder="Artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              disabled={isUploading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="album">Album *</Label>
            <Input
              id="album"
              placeholder="Album name"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              disabled={isUploading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds) *</Label>
            <Input
              id="duration"
              type="number"
              placeholder="Duration in seconds"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={isUploading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio">Audio File *</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={audioInputRef}
                id="audio"
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                className="flex-1"
                disabled={isUploading}
                required
              />
              {audioFile && <Music className="h-5 w-5 text-primary shrink-0" />}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={coverInputRef}
                id="cover"
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="flex-1"
                disabled={isUploading}
              />
              {coverImage && <ImageIcon className="h-5 w-5 text-primary shrink-0" />}
            </div>
          </div>

          {showProgress && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload Track'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
