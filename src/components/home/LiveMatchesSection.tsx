import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Match } from '../../types/football';
import { LiveMatchCard } from './LiveMatchCard';

interface LiveMatchesSectionProps {
  matches: Match[];
  isLoading?: boolean;
}

export const LiveMatchesSection: React.FC<LiveMatchesSectionProps> = ({ matches, isLoading }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!isLoading && matches.length === 0) {
    return null;
  }

  return (
    <section className="w-full pt-4 pb-2">
      {/* Section Header: "Live Matches" on left, "View All" on right (Preserved from reference) */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-display">
            Live Matches
          </h2>
          <span className="w-2 h-2 rounded-full bg-sport-coral animate-ping" />
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop Left/Right Scroll Arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/live"
            className="text-xs sm:text-sm font-medium text-sport-textMuted hover:text-white transition-colors flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Horizontally Scrollable Matches Strip */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3.5 overflow-x-auto scrollbar-none px-4 sm:px-6 py-2 scroll-smooth -mx-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[155px] sm:w-[170px] h-[215px] sm:h-[225px] rounded-3xl bg-white/5 animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="h-4 w-12 bg-white/10 rounded-full" />
              <div className="flex justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="w-10 h-10 rounded-full bg-white/10" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="h-3 w-16 bg-white/10 rounded" />
              </div>
            </div>
          ))
        ) : (
          matches.map(match => (
            <div key={match.id} style={{ scrollSnapAlign: 'start' }}>
              <LiveMatchCard match={match} />
            </div>
          ))
        )}
      </div>
    </section>
  );
};
