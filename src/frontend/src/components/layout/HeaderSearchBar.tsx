import { Home, Globe, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useHeaderSearch } from '../../hooks/useHeaderSearch';
import { useHomeBrowsing } from '../../hooks/useHomeBrowsing';
import { useState, useEffect, useRef } from 'react';
import { useUISounds } from '../../hooks/useUISounds';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';
import { toast } from 'sonner';

export default function HeaderSearchBar() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { query, setQuery, clearQuery } = useHeaderSearch();
  const { requestScrollToBrowsing, resetBrowsingFilters } = useHomeBrowsing();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { playClick } = useUISounds();
  
  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    clearError,
    clearTranscript,
  } = useVoiceSearch();

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

  const handleMicClick = () => {
    playClick();
    if (!isSupported) {
      toast.error('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    startListening();
  };

  // Handle transcript updates - automatically populate search and trigger search
  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
      clearTranscript();
    }
  }, [transcript, setQuery, clearTranscript]);

  // Handle errors - show toast notification
  useEffect(() => {
    if (error) {
      toast.error(error, {
        action: {
          label: 'Try again',
          onClick: () => {
            clearError();
            startListening();
          },
        },
      });
      clearError();
    }
  }, [error, clearError, startListening]);

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
      {/* Fixed-width grid layout: left button | input | right buttons */}
      <div className="grid grid-cols-[2.5rem_1fr_5rem] items-center gap-0">
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

        {/* Center: Search input container with microphone icon */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search tracks, artists, albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 px-3 pr-12"
          />
          
          {/* Microphone button positioned absolutely inside input - right side */}
          <button
            onClick={handleMicClick}
            disabled={!isSupported}
            className={`absolute right-1 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-full transition-all duration-200 ${
              isListening
                ? 'text-[#FF2D78] mic-pulse-glow'
                : isSupported
                ? 'text-gray-400 hover:text-[#FF2D78] hover:bg-accent cursor-pointer'
                : 'text-gray-300 cursor-not-allowed opacity-50'
            } focus:outline-none focus:ring-2 focus:ring-[#FF2D78] focus:ring-offset-2`}
            aria-label={isListening ? 'Listening...' : 'Voice search'}
            title={
              !isSupported
                ? 'Voice search not supported'
                : isListening
                ? 'Listening...'
                : 'Click to search by voice'
            }
          >
            <Mic className={`h-5 w-5 transition-transform ${isListening ? 'scale-110' : ''}`} />
          </button>
          
          {/* Listening indicator text */}
          {isListening && (
            <div className="absolute left-3 -bottom-6 text-xs text-[#FF2D78] font-medium animate-pulse">
              Listening...
            </div>
          )}
        </div>

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
