import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Filter, Play, Volume2, Search, ArrowRight, Clock } from 'lucide-react';
import { useLiveMatches, useFixtures } from '../hooks/useFootball';
import { COMPETITIONS } from '../data/mockMatches';
import { LiveMatchCard } from '../components/home/LiveMatchCard';

export const LivePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: liveMatches, isLoading } = useLiveMatches();
  const { data: upcomingFixtures } = useFixtures({ status: 'upcoming' });

  const [selectedCompId, setSelectedCompId] = useState<string>('all');
  const [filterTeam, setFilterTeam] = useState<string>('');

  const filteredMatches = liveMatches.filter(m => {
    if (selectedCompId !== 'all' && m.competition.id !== selectedCompId) return false;
    if (filterTeam.trim()) {
      const q = filterTeam.toLowerCase();
      return (
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 min-w-0 max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-16 space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sport-coral animate-ping" />
            <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
              Live Matches Center
            </h1>
          </div>
          <p className="text-xs text-sport-textMuted mt-1">
            Real-time score updates, live minute progression, and high-definition authorized streams.
          </p>
        </div>

        {/* Live Filter / Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-sport-textMuted" />
            <input
              type="text"
              value={filterTeam}
              onChange={e => setFilterTeam(e.target.value)}
              placeholder="Filter by team..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-sport-textMuted outline-none focus:border-sport-electricBlue"
            />
          </div>
        </div>
      </div>

      {/* Competition Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
        <button
          onClick={() => setSelectedCompId('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            selectedCompId === 'all'
              ? 'bg-sport-coral text-white font-bold shadow-lg shadow-sport-coral/25'
              : 'bg-white/5 hover:bg-white/10 text-sport-textSecondary border border-white/5'
          }`}
        >
          All Competitions ({liveMatches.length})
        </button>

        {Object.values(COMPETITIONS).map(comp => {
          const count = liveMatches.filter(m => m.competition.id === comp.id).length;
          return (
            <button
              key={comp.id}
              onClick={() => setSelectedCompId(comp.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCompId === comp.id
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-sport-textSecondary border border-white/5'
              }`}
            >
              <img src={comp.emblem} alt="" className="w-4 h-4 object-contain" />
              <span>{comp.name}</span>
              {count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-sport-coral text-white text-[10px] font-black">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Live Matches Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMatches.map(match => (
            <LiveMatchCard key={match.id} match={match} className="w-full" />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl bg-[#111622] border border-white/5 p-8 text-center space-y-3">
          <Radio className="w-10 h-10 text-sport-textMuted mx-auto" />
          <h3 className="text-base font-bold text-white">No Live Matches At This Moment</h3>
          <p className="text-xs text-sport-textMuted max-w-md mx-auto leading-relaxed">
            There are currently no active live matches matching your filter. Browse today's upcoming fixtures below.
          </p>
        </div>
      )}

      {/* Upcoming Fixtures Section */}
      {upcomingFixtures && upcomingFixtures.length > 0 && (
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-sport-neonBlue" />
              <span>Upcoming Matches Today</span>
            </h3>
            <button
              onClick={() => navigate('/fixtures')}
              className="text-xs text-sport-neonBlue hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingFixtures.slice(0, 4).map(m => (
              <div
                key={m.id}
                onClick={() => navigate(`/match/${m.id}`)}
                className="p-4 rounded-2xl bg-[#121622] hover:bg-[#161D2E] border border-white/5 hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={m.competition.emblem} alt="" className="w-6 h-6 object-contain" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {m.homeTeam.shortName} vs {m.awayTeam.shortName}
                    </p>
                    <p className="text-[11px] text-sport-textMuted">{m.competition.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-sport-accentYellow">
                    {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(m.utcDate))}
                  </span>
                  <Play className="w-3.5 h-3.5 text-sport-textMuted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
