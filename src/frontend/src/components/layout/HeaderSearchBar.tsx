import { Home, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useHeaderSearch } from '../../hooks/useHeaderSearch';
import { useHomeBrowsing } from '../../hooks/useHomeBrowsing';
import { useState, useEffect, useRef } from 'react';
import { useUISounds } from '../../hooks/useUISounds';

export default function HeaderSearchBar() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { query, setQuery, clearQuery } = useHeaderSearch();
  const { requestScrollToBrowsing, resetBrowsingFilters } = useHomeBrowsing();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { playClick } = useUISounds();

  const handleHomeClick = () => {
    playClick();
    navigate({ to: '/' });
  };

  const handleStartBrowsing = () => {
    playClick();
    setIsMenuOpen(false);
    if (routerState.location.pathname !== '/') {
      navigate({ to: '/' });
    }
    // Small delay to ensure navigation completes
    setTimeout(() => {
      requestScrollToBrowsing();
    }, 100);
  };

  const handleBrowseAll = () => {
    playClick();
    setIsMenuOpen(false);
    if (routerState.location.pathname !== '/') {
      navigate({ to: '/' });
    }
    clearQuery();
    resetBrowsingFilters();
    // Small delay to ensure navigation completes
    setTimeout(() => {
      requestScrollToBrowsing();
    }, 100);
  };

  const handleMenuToggle = () => {
    playClick();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMenuToggle();
    } else if (e.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
      buttonRef.current?.focus();
    }
  };

  const handleMenuItemKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  return (
    <div className="relative w-full max-w-md">
      {/* Fixed-width grid layout: left button | input | right button */}
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-0">
        {/* Left: Home button */}
        <div className="flex items-center justify-center">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleHomeClick}
            className="h-8 w-8 shrink-0"
            aria-label="Return to home"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        {/* Center: Search input with fixed padding to prevent text jump */}
        <Input
          type="text"
          placeholder="Search songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 px-3"
        />

        {/* Right: Browse button */}
        <div className="flex items-center justify-center relative">
          <button
            ref={buttonRef}
            onClick={handleMenuToggle}
            onKeyDown={handleKeyDown}
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded focus:outline-none focus:ring-2 focus:ring-primary shrink-0"
            aria-label="Browse menu"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <Globe className="h-4 w-4" />
          </button>

          {/* Menu positioned absolutely, outside the grid flow */}
          {isMenuOpen && (
            <div
              ref={menuRef}
              role="menu"
              className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-lg py-1 z-50"
            >
              <button
                role="menuitem"
                onClick={handleStartBrowsing}
                onKeyDown={(e) => handleMenuItemKeyDown(e, handleStartBrowsing)}
                className="w-full px-4 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:bg-accent"
                tabIndex={0}
              >
                Start Browsing
              </button>
              <button
                role="menuitem"
                onClick={handleBrowseAll}
                onKeyDown={(e) => handleMenuItemKeyDown(e, handleBrowseAll)}
                className="w-full px-4 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:bg-accent"
                tabIndex={0}
              >
                Browse All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
