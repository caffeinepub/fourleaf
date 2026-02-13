import { Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LeftSidebar from './LeftSidebar';
import RightDetailsPanel from './RightDetailsPanel';
import AudioPlayerBar from '../player/AudioPlayerBar';
import ProfileSetupDialog from '../profile/ProfileSetupDialog';
import LoginButton from '../auth/LoginButton';
import FourleafBrand from '../branding/FourleafBrand';

export default function AppLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-14 items-center px-3 gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-4 border-b border-border/40">
                <FourleafBrand variant="compact" />
              </div>
              <LeftSidebar />
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex justify-center items-center">
            <div className="w-8 h-8">
              <FourleafBrand variant="icon" />
            </div>
          </div>

          <div className="shrink-0">
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <RightDetailsPanel />
      </div>

      {/* Persistent Audio Player */}
      <AudioPlayerBar />

      {/* Profile Setup Dialog */}
      {showProfileSetup && <ProfileSetupDialog />}
    </div>
  );
}
