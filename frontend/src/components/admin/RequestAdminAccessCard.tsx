import { useState } from 'react';
import { useGetCallerPrincipal } from '../../hooks/useQueries';
import { ShieldAlert, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function RequestAdminAccessCard() {
  const { data: principal, isLoading } = useGetCallerPrincipal();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!principal) return;
    
    try {
      await navigator.clipboard.writeText(principal.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy principal:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            <CardTitle>Access Denied</CardTitle>
          </div>
          <CardDescription>
            Loading your account information...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-destructive" />
          <CardTitle>Access Denied</CardTitle>
        </div>
        <CardDescription>
          You do not have administrator privileges to access this area. Only admins can upload and manage tracks in the public catalog.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Your Principal ID:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded text-xs font-mono break-all">
              {principal?.toString() || 'Unable to load'}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              disabled={!principal}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this Principal ID with an existing admin to request access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
