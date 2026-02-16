import { useState, useRef } from 'react';
import { useUploadPersonalSong } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Music, Image as ImageIcon, User, AlertCircle } from 'lucide-react';
import { ExternalBlob } from '../../backend';
import {
  validateAudioFile,
  validateCoverImage,
  validateDuration,
  validateRequiredField,
} from '../../utils/uploadValidation';
import { buildSongUpdate } from '../../utils/buildSongUpdate';
import { normalizeBackendError, isAuthorizationError } from '../../utils/backendErrors';
import UploadDiagnosticsDialog from '../upload/UploadDiagnosticsDialog';

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
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
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
    setLastError(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const resetProgress = () => {
    setAudioProgress(0);
    setCoverProgress(0);
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
      resetProgress();
      setLastError(null);

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

      const songUpdate = buildSongUpdate({
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        duration: BigInt(duration),
        audioFile: audioBlob,
        coverImage: coverBlob,
      });

      await uploadPersonalSong.mutateAsync(songUpdate);
      toast.success('Song uploaded successfully to your personal library!');
      
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMsg = normalizeBackendError(error);
      setLastError(errorMsg);
      toast.error(errorMsg);
      
      // Always reset progress on failure so user can retry
      resetProgress();
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Upload to Personal Library
            </DialogTitle>
            <DialogDescription>
              Please log in to upload songs to your personal library.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-sm text-muted-foreground text-center">
              You need to be logged in with Internet Identity to upload songs.
            </p>
            <Button onClick={login} disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const totalProgress = coverImage 
    ? Math.round((audioProgress + coverProgress) / 2)
    : audioProgress;

  const showAuthWarning = lastError && isAuthorizationError(lastError);

  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={handleClose}
        modal={true}
      >
        <DialogContent 
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          onInteractOutside={handleInteractOutside}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Upload to Personal Library
            </DialogTitle>
            <DialogDescription>
              Upload a song to your personal library. Only you will be able to access it.
            </DialogDescription>
          </DialogHeader>

          {showAuthWarning && (
            <div className="rounded-lg border border-warning/50 bg-warning/10 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="text-sm text-foreground">{lastError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiagnostics(true)}
                  className="h-8"
                >
                  View Diagnostics
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Song Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter song title"
                disabled={isUploading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist *</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Enter artist name"
                disabled={isUploading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album">Album *</Label>
              <Input
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Enter album name"
                disabled={isUploading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds) *</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Auto-detected from audio file"
                disabled={isUploading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audioFile">Audio File * (MP3, WAV, max 100MB)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="audioFile"
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  disabled={isUploading}
                  required
                />
                <Music className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
              {audioFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image (JPG, PNG, max 10MB)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="coverImage"
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  disabled={isUploading}
                />
                <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
              {coverImage && (
                <p className="text-xs text-muted-foreground">
                  Selected: {coverImage.name} ({(coverImage.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {isUploading && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Audio upload</span>
                    <span className="font-medium">{audioProgress}%</span>
                  </div>
                  <Progress value={audioProgress} className="h-2" />
                </div>

                {coverImage && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cover upload</span>
                      <span className="font-medium">{coverProgress}%</span>
                    </div>
                    <Progress value={coverProgress} className="h-2" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total progress</span>
                    <span>{totalProgress}%</span>
                  </div>
                  <Progress value={totalProgress} className="h-2" />
                </div>
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
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Song
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <UploadDiagnosticsDialog
        open={showDiagnostics}
        onOpenChange={setShowDiagnostics}
      />
    </>
  );
}
