import { useNavigate } from '@tanstack/react-router';
import { Music, Library, Sparkles, Shield, Home, Radio, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import FourleafBrand from '../branding/FourleafBrand';
import UISoundControls from '../settings/UISoundControls';
import { useUISounds } from '../../hooks/useUISounds';

interface LeftSidebarProps {
  isMobileOpen?: boolean;
  onRequestClose?: () => void;
}

export default function LeftSidebar({ isMobileOpen = false, onRequestClose }: LeftSidebarProps) {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const { playClick } = useUISounds();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Library, label: 'My Library', path: '/my-library' },
    { icon: Sparkles, label: 'Pricing', path: '/pricing' },
    { icon: Radio, label: 'Player Layout', path: '/player-layout' },
  ];

  const handleNavClick = (path: string) => {
    playClick();
    navigate({ to: path });
    // Close mobile sidebar after navigation
    if (onRequestClose) {
      onRequestClose();
    }
  };

  const handleClose = () => {
    playClick();
    if (onRequestClose) {
      onRequestClose();
    }
  };

  return (
    <aside
      className={`
        w-[250px] shrink-0 flex flex-col gap-2 p-2 overflow-y-auto
        
        /* Mobile: Off-canvas drawer with transform animation */
        fixed inset-y-0 left-0 z-50 bg-background
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        
        /* Desktop: Sticky sidebar, always visible */
        md:translate-x-0 md:sticky md:top-0 md:h-screen
      `}
    >
      {/* Close button - only visible on mobile when drawer is open */}
      <div className="md:hidden flex justify-end mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label="Close menu"
          className="h-10 w-10"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Brand Section */}
      <div className="bg-card/80 backdrop-blur rounded-lg px-5 py-4 border border-border/50">
        <FourleafBrand variant="full" />
      </div>

      {/* Navigation Section */}
      <div className="bg-card/80 backdrop-blur rounded-lg p-3 border border-border/50">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start gap-3 text-sm md:text-base font-medium hover:bg-accent/50 min-h-[44px] px-3 py-2"
              onClick={() => handleNavClick(item.path)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>

      {/* Library/Admin Section */}
      <div className="bg-card/80 backdrop-blur rounded-lg p-3 border border-border/50 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3 px-3">
          <Music className="h-5 w-5 text-muted-foreground shrink-0" />
          <h3 className="font-semibold text-sm truncate">Your Library</h3>
        </div>
        <div className="flex flex-col gap-1 mb-4">
          {isAdmin && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sm md:text-base font-medium hover:bg-accent/50 min-h-[44px] px-3 py-2"
              onClick={() => handleNavClick('/admin')}
            >
              <Shield className="h-5 w-5 shrink-0" />
              <span className="truncate">Admin</span>
            </Button>
          )}
        </div>
        
        {/* UI Sound Controls */}
        <div className="mt-auto">
          <UISoundControls />
        </div>
      </div>
    </aside>
  );
}
