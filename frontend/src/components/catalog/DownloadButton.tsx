import { Download, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useDownloadSongAudio } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { Song } from '../../backend';

interface DownloadButtonProps {
  song: Song;
}

export default function DownloadButton({ song }: DownloadButtonProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const downloadMutation = useDownloadSongAudio();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const hasSubscription = userProfile?.hasActiveSubscription ?? false;
  const canDownload = isAuthenticated && hasSubscription;

  const handleDownload = async () => {
    if (!canDownload) return;

    try {
      const blob = await downloadMutation.mutateAsync(song.id);
      const bytes = await blob.getBytes();
      const file = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.artist} - ${song.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download song');
    }
  };

  if (!isAuthenticated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" disabled>
              <Lock className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>You must be logged in to download songs</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Show loading state while profile is being fetched
  if (isAuthenticated && profileLoading && !isFetched) {
    return (
      <Button size="icon" variant="ghost" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!hasSubscription) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" disabled>
              <Lock className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="mb-2">An active subscription is required to download songs</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                navigate({ to: '/pricing' });
              }}
              className="w-full"
            >
              View Plans
            </Button>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleDownload}
      disabled={downloadMutation.isPending}
    >
      {downloadMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}
