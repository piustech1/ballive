import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faXmark,
  faTrophy,
  faShieldHalved,
  faPlay,
  faCalendarDays,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { useSearch } from '../../hooks/useFootball';
import { formatKickoffTime } from '../../utils/dateUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: searchResults, isLoading } = useSearch(query);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMatchClick = (matchId: string) => {
    onClose();
    navigate(`/match/${matchId}`);
  };

  const handleCompetitionClick = (compId: string) => {
    onClose();
    navigate(`/competitions?id=${compId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/80 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#141824] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar (NO OUTLINES) */}
        <div className="flex items-center px-4 py-3.5 gap-3 bg-[#1A2030]">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white/40 text-sm" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search teams, competitions, matches..."
            className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-white/40 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[10px] font-mono uppercase px-2 py-1 rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-none">
          {query.trim().length < 2 && (
            <div className="py-8 text-center text-white/40 text-sm">
              <p>Type at least 2 characters to search across matches, teams, and leagues.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Real Madrid', 'Champions League', 'Arsenal', 'Man City'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && query.trim().length >= 2 && (
            <div className="py-8 text-center text-white/40 text-sm">Searching fixtures...</div>
          )}

          {searchResults && query.trim().length >= 2 && (
            <>
              {/* Competitions */}
              {searchResults.competitions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faTrophy} className="text-amber-400 text-xs" />
                    Competitions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {searchResults.competitions.map(comp => (
                      <div
                        key={comp.id}
                        onClick={() => handleCompetitionClick(comp.id)}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <img
                          src={comp.emblem}
                          alt={comp.name}
                          className="w-6 h-6 object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{comp.name}</p>
                          <p className="text-[10px] text-white/40">{comp.country}</p>
                        </div>
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="text-xs text-white/20 group-hover:text-white/60 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams */}
              {searchResults.teams.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-sky-400 text-xs" />
                    Clubs
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {searchResults.teams.map(team => (
                      <div
                        key={team.id}
                        onClick={() => {
                          onClose();
                          navigate(`/?search=${encodeURIComponent(team.name)}`);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <img
                          src={team.crest}
                          alt={team.name}
                          className="w-6 h-6 object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{team.name}</p>
                          <p className="text-[10px] text-white/40">{team.tla}</p>
                        </div>
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="text-xs text-white/20 group-hover:text-white/60 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matches */}
              {searchResults.matches.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faPlay} className="text-rose-400 text-xs" />
                    Matches
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.matches.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleMatchClick(m.id)}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <img
                            src={m.homeTeam.crest}
                            alt=""
                            className="w-4 h-4 object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-xs font-semibold text-white truncate">
                            {m.homeTeam.shortName}
                          </span>
                          <span className="text-[10px] text-white/30 uppercase">vs</span>
                          <span className="text-xs font-semibold text-white truncate">
                            {m.awayTeam.shortName}
                          </span>
                          <img
                            src={m.awayTeam.crest}
                            alt=""
                            className="w-4 h-4 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-white/50 font-mono shrink-0 ml-2">
                          <FontAwesomeIcon icon={faCalendarDays} className="text-[10px]" />
                          <span>{formatKickoffTime(m.utcDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.competitions.length === 0 &&
                searchResults.teams.length === 0 &&
                searchResults.matches.length === 0 && (
                  <div className="py-8 text-center text-white/40 text-sm">
                    No results found for "{query}"
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
