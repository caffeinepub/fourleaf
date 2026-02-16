import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetUploadPermissionsDebug } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { normalizeBackendError } from '../../utils/backendErrors';

interface UploadDiagnosticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadDiagnosticsDialog({ open, onOpenChange }: UploadDiagnosticsDialogProps) {
  const [copied, setCopied] = useState(false);
  const { data: debugInfo, refetch, isFetching, isError } = useGetUploadPermissionsDebug();

  const handleFetchDebugInfo = async () => {
    try {
      await refetch();
    } catch (error: any) {
      console.error('Failed to fetch debug info:', error);
      const errorMsg = normalizeBackendError(error);
      toast.error(errorMsg);
    }
  };

  const handleCopy = () => {
    if (!debugInfo) return;

    const roleLabel = debugInfo.role === UserRole.admin ? 'Admin' : 
                      debugInfo.role === UserRole.user ? 'User' : 'Guest';

    const text = `Principal: ${debugInfo.principal.toString()}\nRole: ${roleLabel}\nCan Upload to Public Catalog: ${debugInfo.canUploadToPublicCatalog ? 'Yes' : 'No'}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Diagnostics copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case UserRole.admin:
        return 'Admin';
      case UserRole.user:
        return 'User';
      case UserRole.guest:
        return 'Guest';
      default:
        return 'Unknown';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Upload Permissions Diagnostics
          </DialogTitle>
          <DialogDescription>
            View your current permissions and identity information to help troubleshoot upload issues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!debugInfo && !isFetching && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to fetch your current permissions.
              </p>
              <Button onClick={handleFetchDebugInfo} disabled={isFetching}>
                Fetch Diagnostics
              </Button>
            </div>
          )}

          {isFetching && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Loading diagnostics...</p>
            </div>
          )}

          {isError && !isFetching && (
            <div className="text-center py-6">
              <p className="text-sm text-destructive mb-4">
                Failed to load diagnostics. Please try again.
              </p>
              <Button onClick={handleFetchDebugInfo} variant="outline">
                Retry
              </Button>
            </div>
          )}

          {debugInfo && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Principal ID</p>
                  <p className="text-sm font-mono break-all">{debugInfo.principal.toString()}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Role</p>
                  <p className="text-sm font-medium">{getRoleLabel(debugInfo.role)}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Can Upload to Public Catalog</p>
                  <p className="text-sm font-medium">
                    {debugInfo.canUploadToPublicCatalog ? (
                      <span className="text-success">Yes</span>
                    ) : (
                      <span className="text-destructive">No</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1"
                  disabled={copied}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                <Button onClick={() => onOpenChange(false)} variant="secondary">
                  Close
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Share this information with an administrator if you believe you should have upload permissions.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
