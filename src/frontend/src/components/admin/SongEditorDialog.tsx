import { useState, useEffect } from 'react';
import { useUploadSong, useEditSong } from '../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Music, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob, type Song } from '../../backend';

interface SongEditorDialogProps {
  song: Song | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SongEditorDialog({ song, open, onOpenChange }: SongEditorDialogProps) {
  const uploadSong = useUploadSong();
  const editSong = useEditSong();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);

  const isEditing = !!song;

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setAlbum(song.album);
      setDuration(Number(song.duration).toString());
    } else {
      setTitle('');
      setArtist('');
      setAlbum('');
      setDuration('');
      setAudioFile(null);
      setCoverImage(null);
    }
    setAudioProgress(0);
    setCoverProgress(0);
  }, [song, open]);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setDuration(Math.floor(audio.duration).toString());
        URL.revokeObjectURL(audio.src);
      };
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !artist.trim() || !album.trim() || !duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isEditing && !audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    try {
      setAudioProgress(0);
      setCoverProgress(0);

      let audioBlob: ExternalBlob;
      if (audioFile) {
        const audioBytes = new Uint8Array(await audioFile.arrayBuffer());
        audioBlob = ExternalBlob.fromBytes(audioBytes).withUploadProgress((percentage) => {
          const normalized = Math.min(100, Math.max(0, percentage > 1 ? percentage : percentage * 100));
          setAudioProgress(Math.round(normalized));
        });
      } else if (song) {
        audioBlob = song.audioFile;
      } else {
        throw new Error('No audio file available');
      }

      let coverBlob: ExternalBlob | undefined;
      if (coverImage) {
        const coverBytes = new Uint8Array(await coverImage.arrayBuffer());
        coverBlob = ExternalBlob.fromBytes(coverBytes).withUploadProgress((percentage) => {
          const normalized = Math.min(100, Math.max(0, percentage > 1 ? percentage : percentage * 100));
          setCoverProgress(Math.round(normalized));
        });
      } else if (song?.coverImage) {
        coverBlob = song.coverImage;
      }

      const songUpdate = {
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        duration: BigInt(parseInt(duration)),
        audioFile: audioBlob,
        coverImage: coverBlob,
      };

      if (isEditing) {
        await editSong.mutateAsync({ songId: song.id, songUpdate });
        toast.success('Song updated successfully');
      } else {
        await uploadSong.mutateAsync(songUpdate);
        toast.success('Song uploaded successfully');
      }

      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save song';
      toast.error(errorMessage.includes('Unauthorized') ? 'You do not have permission to perform this action' : errorMessage);
      setAudioProgress(0);
      setCoverProgress(0);
    }
  };

  const isUploading = uploadSong.isPending || editSong.isPending;

  const totalProgress = coverImage && audioFile
    ? Math.round((audioProgress * 0.7) + (coverProgress * 0.3))
    : audioFile
    ? audioProgress
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Song' : 'Upload New Song'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the song details below'
              : 'Fill in the song details and upload files'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio">
              Audio File {!isEditing && '*'}
              {isEditing && ' (leave empty to keep current)'}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="flex-1"
                disabled={isUploading}
              />
              {audioFile && <Music className="h-5 w-5 text-primary" />}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="flex-1"
                disabled={isUploading}
              />
              {coverImage && <ImageIcon className="h-5 w-5 text-primary" />}
            </div>
          </div>

          {isUploading && totalProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading} className="gap-2">
            <Upload className="h-4 w-4" />
            {isUploading ? 'Saving...' : isEditing ? 'Update Song' : 'Upload Song'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
