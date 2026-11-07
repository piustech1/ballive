import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Trophy, Shield, PlayCircle, Calendar, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0F1420] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3 bg-[#141B2B]">
          <Search className="w-5 h-5 text-sport-textMuted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search teams, competitions, matches..."
            className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-sport-textMuted font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-sport-textMuted hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs uppercase px-2 py-1 rounded bg-white/5 text-sport-textMuted hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {query.trim().length < 2 && (
            <div className="py-8 text-center text-sport-textMuted text-sm">
              <p>Type at least 2 characters to search across live matches, teams, and leagues.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span
                  onClick={() => setQuery('Real Madrid')}
                  className="cursor-pointer px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white"
                >
                  Real Madrid
                </span>
                <span
                  onClick={() => setQuery('Champions League')}
                  className="cursor-pointer px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white"
                >
                  Champions League
                </span>
                <span
                  onClick={() => setQuery('Arsenal')}
                  className="cursor-pointer px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white"
                >
                  Arsenal
                </span>
                <span
                  onClick={() => setQuery('Man City')}
                  className="cursor-pointer px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white"
                >
                  Man City
                </span>
              </div>
            </div>
          )}

          {isLoading && query.trim().length >= 2 && (
            <div className="py-8 text-center text-sport-textMuted text-sm">
              Searching database...
            </div>
          )}

          {searchResults && query.trim().length >= 2 && (
            <>
              {/* Competitions */}
              {searchResults.competitions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-sport-textMuted mb-2 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-sport-accentYellow" />
                    Competitions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {searchResults.competitions.map(comp => (
                      <div
                        key={comp.id}
                        onClick={() => handleCompetitionClick(comp.id)}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <img src={comp.emblem} alt={comp.name} className="w-7 h-7 object-contain" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{comp.name}</p>
                          <p className="text-xs text-sport-textMuted">{comp.country}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-sport-textMuted" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams */}
              {searchResults.teams.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-sport-textMuted mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sport-neonBlue" />
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
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <img src={team.crest} alt={team.name} className="w-7 h-7 object-contain" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{team.name}</p>
                          <p className="text-xs text-sport-textMuted">{team.tla}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matches */}
              {searchResults.matches.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-sport-textMuted mb-2 flex items-center gap-1.5">
                    <PlayCircle className="w-3.5 h-3.5 text-sport-coral" />
                    Matches
                  </h4>
                  <div className="space-y-2">
                    {searchResults.matches.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleMatchClick(m.id)}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img src={m.competition.emblem} alt="" className="w-5 h-5 object-contain" />
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{m.homeTeam.shortName}</span>
                            <span className="text-xs text-sport-textMuted font-mono">
                              {m.status === 'IN_PLAY' || m.status === 'FINISHED'
                                ? `${m.score.home ?? 0} - ${m.score.away ?? 0}`
                                : 'vs'}
                            </span>
                            <span className="text-sm font-semibold text-white">{m.awayTeam.shortName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {m.status === 'IN_PLAY' ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sport-coral text-white animate-pulse">
                              LIVE {m.minute}'
                            </span>
                          ) : (
                            <span className="text-xs text-sport-textMuted">
                              {formatKickoffTime(m.utcDate)}
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-sport-textMuted" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.competitions.length === 0 &&
                searchResults.teams.length === 0 &&
                searchResults.matches.length === 0 && (
                  <div className="py-8 text-center text-sport-textMuted text-sm">
                    No results found for "{query}".
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
