import { Outlet, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import AudioPlayerBar from '../player/AudioPlayerBar';
import ProfileSetupDialog from '../profile/ProfileSetupDialog';
import LeftSidebar from './LeftSidebar';
import RightDetailsPanel from './RightDetailsPanel';

export default function AppLayout() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ProfileSetupDialog />
      
      {/* Three-panel layout */}
      <div className="flex flex-1 min-h-screen pb-24">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Auth button - floating top right on mobile, integrated on desktop */}
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/40 lg:hidden">
            <div className="container flex items-center justify-between py-3">
              <button
                onClick={() => navigate({ to: '/' })}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src="/assets/generated/fourleaf-logo.dim_512x512.png"
                  alt="Fourleaf"
                  className="h-8 w-auto"
                />
              </button>
              <Button
                onClick={handleAuth}
                disabled={isLoggingIn}
                variant={isAuthenticated ? 'outline' : 'default'}
                size="sm"
              >
                {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>
            </div>
          </div>

          {/* Desktop auth button */}
          <div className="hidden lg:block sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/40">
            <div className="container flex items-center justify-end py-3">
              <Button
                onClick={handleAuth}
                disabled={isLoggingIn}
                variant={isAuthenticated ? 'outline' : 'default'}
                size="sm"
              >
                {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>
            </div>
          </div>

          <Outlet />

          {/* Footer */}
          <footer className="border-t border-border/40 bg-card/50 backdrop-blur mt-12">
            <div className="container py-6 text-center text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} Fourleaf. Built with ❤️ using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.hostname : 'fourleaf-app'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </footer>
        </main>

        {/* Right Details Panel */}
        <RightDetailsPanel />
      </div>

      {/* Persistent Audio Player */}
      <AudioPlayerBar />
    </div>
  );
}
