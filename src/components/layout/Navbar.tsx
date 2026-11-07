import React, { useState, useEffect } from 'react';
import { Menu, Search, Radio, User } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useLiveMatches } from '../../hooks/useFootball';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDrawer, onOpenSearch }) => {
  const [scrolled, setScrolled] = useState(false);
  const { data: liveMatches } = useLiveMatches();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0D14]/90 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'bg-[#0A0D14] border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between relative">
        {/* Left Side: Mobile Hamburger Menu / Desktop Context */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button (Preserved exactly from reference) */}
          <button
            onClick={onOpenDrawer}
            className="md:hidden p-2 -ml-2 rounded-xl text-white/90 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* Desktop Left Quick Indicator */}
          <div className="hidden md:flex items-center gap-4">
            <Logo size="md" />
            {liveMatches.length > 0 && (
              <Link
                to="/live"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sport-coral/15 border border-sport-coral/30 text-sport-coral text-xs font-bold hover:bg-sport-coral/25 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-sport-coral animate-ping-slow" />
                <span>{liveMatches.length} MATCHES LIVE</span>
              </Link>
            )}
          </div>
        </div>

        {/* Center: Centered SPORT2 Branding on Mobile (Preserved exactly from reference) */}
        <div className="md:hidden absolute left-1/2 -translate-x-1/2">
          <Logo size="md" />
        </div>

        {/* Desktop Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            to="/"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-white/90 hover:text-white hover:bg-white/5 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/live"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-white/90 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-sport-coral" />
            Live
          </Link>
          <Link
            to="/fixtures"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-white/90 hover:text-white hover:bg-white/5 transition-colors"
          >
            Fixtures
          </Link>
          <Link
            to="/competitions"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-white/90 hover:text-white hover:bg-white/5 transition-colors"
          >
            Competitions
          </Link>
          <Link
            to="/favorites"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-white/90 hover:text-white hover:bg-white/5 transition-colors"
          >
            Favorites
          </Link>
        </nav>

        {/* Right Side: Search Icon Button (Preserved from reference) + Desktop Shortcuts */}
        <div className="flex items-center gap-2">
          {/* Desktop Search Trigger Bar */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sport-textMuted hover:text-white text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search teams, leagues...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/70">
              ⌘K
            </kbd>
          </button>

          {/* Mobile Search Button (Reference icon on right) */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 -mr-2 rounded-xl text-white/90 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Search football"
          >
            <Search className="w-5 h-5 stroke-[2]" />
          </button>

          {/* User profile / anonymous status indicator */}
          <Link
            to="/favorites"
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors ml-1"
            title="My Account & Favorites"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
