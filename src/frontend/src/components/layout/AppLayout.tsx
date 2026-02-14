import { Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import LeftSidebar from './LeftSidebar';
import RightDetailsPanel from './RightDetailsPanel';
import AudioPlayerBar from '../player/AudioPlayerBar';
import ProfileSetupDialog from '../profile/ProfileSetupDialog';
import LoginButton from '../auth/LoginButton';

export default function AppLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Side-by-side layout for all breakpoints */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Always visible */}
        <LeftSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header with Login Button - Inside main content area */}
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex h-14 items-center justify-end px-4">
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
