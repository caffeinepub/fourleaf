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
import {
  validateAudioFile,
  validateCoverImage,
  validateDuration,
  validateRequiredField,
} from '../../utils/uploadValidation';

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
        const detectedDuration = Math.floor(audio.duration);
        if (detectedDuration > 0 && isFinite(detectedDuration)) {
          setDuration(detectedDuration.toString());
        }
        URL.revokeObjectURL(audio.src);
      });
      audio.addEventListener('error', () => {
        console.warn('Could not load audio metadata');
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

    // Validate all fields
    const titleValidation = validateRequiredField(title, 'a song title');
    if (!titleValidation.isValid) {
      toast.error(titleValidation.error);
      return;
    }

    const artistValidation = validateRequiredField(artist, 'an artist name');
    if (!artistValidation.isValid) {
      toast.error(artistValidation.error);
      return;
    }

    const albumValidation = validateRequiredField(album, 'an album name');
    if (!albumValidation.isValid) {
      toast.error(albumValidation.error);
      return;
    }

    const durationValidation = validateDuration(duration);
    if (!durationValidation.isValid) {
      toast.error(durationValidation.error);
      return;
    }

    const audioValidation = validateAudioFile(audioFile);
    if (!audioValidation.isValid) {
      toast.error(audioValidation.error);
      return;
    }

    const coverValidation = validateCoverImage(coverImage);
    if (!coverValidation.isValid) {
      toast.error(coverValidation.error);
      return;
    }

    try {
      setAudioProgress(0);
      setCoverProgress(0);

      const audioBytes = new Uint8Array(await audioFile!.arrayBuffer());
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
      toast.success('Personal song uploaded successfully! Only you can access this track.');
      
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMsg = error.message || 'Failed to upload personal song';
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
              Please log in with Internet Identity to upload personal songs.
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
            <Lock className="h-5 w-5 text-primary" />
            Upload Personal Song
          </DialogTitle>
          <DialogDescription>
            Upload a song to your personal library. Only you will be able to access and stream this track.
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
