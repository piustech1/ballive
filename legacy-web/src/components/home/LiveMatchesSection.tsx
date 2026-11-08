import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Match } from '../../types/football';
import { LiveMatchCard } from './LiveMatchCard';

interface LiveMatchesSectionProps {
  matches: Match[];
  isLoading?: boolean;
}

export const LiveMatchesSection: React.FC<LiveMatchesSectionProps> = ({ matches, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!isLoading && matches.length === 0) return null;

  return (
    <section className="w-full pt-4 pb-1">
      {/* ── Section Header: "Live Matches" + "View All" ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] sm:text-lg font-bold tracking-tight text-white font-display">
            Live Matches
          </h2>
          <span className="relative flex h-2 w-2 mt-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-rose-500" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
        </div>

        <Link
          to="/live"
          className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors active:scale-95"
        >
          <span>View All</span>
          <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
        </Link>
      </div>

      {/* ── Horizontal Scrollable Cards (Pure Liquid Glass) ── */}
      <div
        ref={scrollRef}
        className="flex gap-3.5 overflow-x-auto scrollbar-none px-4 sm:px-6 pb-2 scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[158px] sm:w-[172px] h-[220px] sm:h-[232px] rounded-3xl bg-white/10 animate-pulse"
                style={{ scrollSnapAlign: 'start' }}
              />
            ))
          : matches.map(match => (
              <div key={match.id} style={{ scrollSnapAlign: 'start' }} className="shrink-0">
                <LiveMatchCard match={match} />
              </div>
            ))}
      </div>
    </section>
  );
};
