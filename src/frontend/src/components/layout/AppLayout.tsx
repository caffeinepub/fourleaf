import { Outlet } from '@tanstack/react-router';
import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import LeftSidebar from './LeftSidebar';
import RightDetailsPanel from './RightDetailsPanel';
import AudioPlayerBar from '../player/AudioPlayerBar';
import ProfileSetupDialog from '../profile/ProfileSetupDialog';
import LoginButton from '../auth/LoginButton';
import FourleafBrand from '../branding/FourleafBrand';
import { Button } from '@/components/ui/button';

export default function AppLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const openMobileSidebar = () => setIsMobileSidebarOpen(true);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Side-by-side layout for all breakpoints */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Always visible on desktop, drawer on mobile */}
        <LeftSidebar 
          isMobileOpen={isMobileSidebarOpen}
          onRequestClose={closeMobileSidebar}
        />

        {/* Semi-transparent overlay for mobile - only shown when sidebar is open */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileSidebar}
            onTouchEnd={closeMobileSidebar}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header with Hamburger Menu, Fourleaf Brand, and Login Button */}
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex h-14 items-center justify-between px-4">
              {/* Left cluster: Hamburger + Fourleaf Brand */}
              <div className="flex items-center gap-3">
                {/* Hamburger menu button - only visible on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0"
                  onClick={openMobileSidebar}
                  aria-label="Open menu"
                >
                  <img 
                    src="/assets/generated/hamburger-menu.dim_24x24.svg" 
                    alt="" 
                    className="h-6 w-6 text-foreground"
                    style={{ filter: 'brightness(0) saturate(100%)' }}
                  />
                </Button>
                
                {/* Fourleaf Brand - compact variant */}
                <FourleafBrand variant="compact" />
              </div>
              
              {/* Right: Login Button */}
              <LoginButton />
            </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-auto">
            <Outlet />
          </main>
        </div>

        {/* Right Details Panel - Hidden on mobile */}
        <RightDetailsPanel />
      </div>

      {/* Persistent Audio Player */}
      <AudioPlayerBar />

      {/* Profile Setup Dialog */}
      {showProfileSetup && <ProfileSetupDialog />}
    </div>
  );
}
