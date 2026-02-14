import { useState } from 'react';
import { useGrantAdminRole } from '../../hooks/useQueries';
import { Shield, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export default function GrantAdminControl() {
  const [principalInput, setPrincipalInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const grantAdmin = useGrantAdminRole();

  const validatePrincipal = (input: string): Principal | null => {
    if (!input.trim()) {
      setValidationError('Principal ID is required');
      return null;
    }

    try {
      const principal = Principal.fromText(input.trim());
      setValidationError('');
      return principal;
    } catch (error) {
      setValidationError('Invalid Principal ID format');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const principal = validatePrincipal(principalInput);
    if (!principal) return;

    try {
      await grantAdmin.mutateAsync(principal);
      toast.success('Admin access granted successfully');
      setPrincipalInput('');
      setValidationError('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to grant admin access');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Grant Admin Access</CardTitle>
        </div>
        <CardDescription>
          Add another administrator to manage the public catalog
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Principal ID</Label>
            <Input
              id="principal"
              type="text"
              placeholder="Enter Principal ID (e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx)"
              value={principalInput}
              onChange={(e) => {
                setPrincipalInput(e.target.value);
                if (validationError) setValidationError('');
              }}
              disabled={grantAdmin.isPending}
              className={validationError ? 'border-destructive' : ''}
            />
            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The user must provide their Principal ID from the access denied screen.
            </p>
          </div>
          <Button
            type="submit"
            disabled={grantAdmin.isPending || !principalInput.trim()}
            className="gap-2"
          >
            {grantAdmin.isPending ? (
              <>Granting Access...</>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Grant Admin Access
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
