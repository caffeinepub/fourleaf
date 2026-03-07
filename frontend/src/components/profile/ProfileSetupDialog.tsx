import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useQueries';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function ProfileSetupDialog() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [hasSubscription, setHasSubscription] = useState(false);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (!showProfileSetup) {
      setName('');
      setHasSubscription(false);
    }
  }, [showProfileSetup]);

  const handleSave = async () => {
    // Prevent duplicate submissions
    if (saveProfile.isPending) return;

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        hasActiveSubscription: hasSubscription,
      });
      toast.success('Profile created successfully!');
    } catch (error: any) {
      // Keep dialog open on error and show clear error message
      toast.error(error.message || 'Failed to create profile');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !saveProfile.isPending) {
      handleSave();
    }
  };

  return (
    <Dialog open={showProfileSetup}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to Fourleaf!</DialogTitle>
          <DialogDescription>
            Please set up your profile to get started with music streaming.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={saveProfile.isPending}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="subscription"
              checked={hasSubscription}
              onCheckedChange={(checked) => setHasSubscription(checked === true)}
              disabled={saveProfile.isPending}
            />
            <Label
              htmlFor="subscription"
              className="text-sm font-normal cursor-pointer"
            >
              I have an active subscription (enables downloads)
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saveProfile.isPending} className="w-full">
            {saveProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
