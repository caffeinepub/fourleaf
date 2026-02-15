import { useNavigate } from '@tanstack/react-router';
import { Music, Library, Sparkles, Shield, Home, Radio, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import FourleafBrand from '../branding/FourleafBrand';
import UISoundControls from '../settings/UISoundControls';
import { useUISounds } from '../../hooks/useUISounds';
import { useState } from 'react';

interface LeftSidebarProps {
  isMobileOpen?: boolean;
  onRequestClose?: () => void;
}

export default function LeftSidebar({ isMobileOpen = false, onRequestClose }: LeftSidebarProps) {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const { playClick } = useUISounds();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const toggleCollapse = () => {
    playClick();
    setIsCollapsed(prev => !prev);
  };

  return (
    <aside
      id="mobile-sidebar"
      className={`
        shrink-0 flex flex-col gap-2 p-2 overflow-y-auto
        
        /* Mobile: Off-canvas drawer with transform animation */
        fixed inset-y-0 left-0 bg-background
        transition-transform duration-300 ease-in-out
        motion-reduce:transition-none motion-reduce:duration-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        z-50
        
        /* Desktop: Static sidebar with collapse/expand animation */
        md:translate-x-0 md:sticky md:top-0 md:h-screen md:z-auto
        ${isCollapsed ? 'md:w-[80px]' : 'w-[250px]'}
        md:transition-[width] md:duration-300 md:ease-in-out
        md:motion-reduce:transition-none md:motion-reduce:duration-0
      `}
    >
      {/* Brand Section with hamburger toggle and close button */}
      <div className="bg-card/80 backdrop-blur rounded-lg px-5 py-4 border border-border/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger toggle button - only visible on desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
              aria-expanded={!isCollapsed}
              className="hidden md:flex h-10 w-10 shrink-0 hover:bg-accent/50"
            >
              <img 
                src="/assets/generated/hamburger-menu.dim_24x24.svg" 
                alt="" 
                className="h-6 w-6"
              />
            </Button>
            
            {/* Brand - hide text when collapsed on desktop */}
            <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
              <div className="h-12 w-12 shrink-0">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Fourleaf"
                >
                  <circle cx="50" cy="50" r="50" fill="#000000" />
                  <g transform="translate(50, 50)">
                    <path
                      d="M 0,-18 C -5,-18 -9,-14 -9,-9 C -9,-4 -5,0 0,0 C 0,0 -5,0 -9,-4 C -14,-9 -18,-5 -18,0 C -18,5 -14,9 -9,9 C -4,9 0,5 0,0 C 0,0 0,5 -4,9 C -9,14 -5,18 0,18 C 5,18 9,14 9,9 C 9,4 5,0 0,0 C 0,0 5,0 9,4 C 14,9 18,5 18,0 C 18,-5 14,-9 9,-9 C 4,-9 0,-5 0,0 C 0,0 0,-5 4,-9 C 9,-14 5,-18 0,-18 Z"
                      fill="#22c55e"
                    />
                  </g>
                </svg>
              </div>
              <span className={`font-display font-bold text-2xl text-foreground transition-opacity duration-300 ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
                Fourleaf
              </span>
            </div>
          </div>
          
          {/* Close button - only visible on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close menu"
            className="h-10 w-10 md:hidden shrink-0"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="bg-card/80 backdrop-blur rounded-lg p-3 border border-border/50">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full gap-3 text-sm md:text-base font-medium hover:bg-accent/50 min-h-[44px] px-3 py-2 ${isCollapsed ? 'md:justify-center' : 'justify-start'}`}
              onClick={() => handleNavClick(item.path)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className={`truncate transition-opacity duration-300 ${isCollapsed ? 'md:hidden md:opacity-0 md:w-0' : 'opacity-100'}`}>
                {item.label}
              </span>
            </Button>
          ))}
        </nav>
      </div>

      {/* Library/Admin Section */}
      <div className="bg-card/80 backdrop-blur rounded-lg p-3 border border-border/50 flex-1 flex flex-col">
        <div className={`flex items-center gap-2 mb-3 px-3 ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}>
          <Music className="h-5 w-5 text-muted-foreground shrink-0" />
          <h3 className={`font-semibold text-sm truncate transition-opacity duration-300 ${isCollapsed ? 'md:hidden md:opacity-0 md:w-0' : 'opacity-100'}`}>
            Your Library
          </h3>
        </div>
        <div className="flex flex-col gap-1 mb-4">
          {isAdmin && (
            <Button
              variant="ghost"
              className={`w-full gap-3 text-sm md:text-base font-medium hover:bg-accent/50 min-h-[44px] px-3 py-2 ${isCollapsed ? 'md:justify-center' : 'justify-start'}`}
              onClick={() => handleNavClick('/admin')}
            >
              <Shield className="h-5 w-5 shrink-0" />
              <span className={`truncate transition-opacity duration-300 ${isCollapsed ? 'md:hidden md:opacity-0 md:w-0' : 'opacity-100'}`}>
                Admin
              </span>
            </Button>
          )}
        </div>
        
        {/* UI Sound Controls - hide when collapsed */}
        <div className={`mt-auto transition-opacity duration-300 ${isCollapsed ? 'md:hidden md:opacity-0' : 'opacity-100'}`}>
          <UISoundControls />
        </div>
      </div>
    </aside>
  );
}
