import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Bell, BellOff, ChevronRight, Clock, Tv, AlertCircle } from 'lucide-react';
import { Match } from '../../types/football';
import { formatKickoffTime } from '../../utils/dateUtils';
import { useReminders } from '../../hooks/useReminders';

interface FixturesListProps {
  matches: Match[];
  isLoading?: boolean;
}

export const FixturesList: React.FC<FixturesListProps> = ({ matches, isLoading }) => {
  const navigate = useNavigate();
  const { hasReminder, toggleReminder } = useReminders();

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 my-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-[#111622] border border-white/5 p-4 space-y-3 animate-pulse">
            <div className="h-4 w-40 bg-white/10 rounded" />
            <div className="space-y-2">
              <div className="h-12 w-full bg-white/5 rounded-xl" />
              <div className="h-12 w-full bg-white/5 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 my-8 text-center">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#111622] border border-white/5 flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-sport-textMuted mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Fixtures Found</h3>
          <p className="text-xs text-sport-textMuted max-w-xs">
            There are no matches scheduled for the selected date or filter. Try choosing another day or selecting "All Leagues".
          </p>
        </div>
      </div>
    );
  }

  // Group matches by competition
  const grouped = matches.reduce((acc, match) => {
    const compId = match.competition.id;
    if (!acc[compId]) {
      acc[compId] = {
        competition: match.competition,
        matches: [],
      };
    }
    acc[compId].matches.push(match);
    return acc;
  }, {} as Record<string, { competition: Match['competition']; matches: Match[] }>);

  return (
    <div className="w-full px-4 sm:px-6 my-4 space-y-6">
      {Object.values(grouped).map(group => (
        <div
          key={group.competition.id}
          className="rounded-3xl bg-[#101522] border border-white/5 overflow-hidden shadow-xl"
        >
          {/* Elegant Competition Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#141B2B] border-b border-white/5">
            <div className="flex items-center gap-3">
              <img
                src={group.competition.emblem}
                alt={group.competition.name}
                className="w-6 h-6 object-contain"
              />
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {group.competition.name}
                </h3>
                <p className="text-[11px] text-sport-textMuted">
                  {group.competition.country}
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-sport-textSecondary border border-white/5">
              {group.matches.length} {group.matches.length === 1 ? 'Match' : 'Matches'}
            </span>
          </div>

          {/* Matches List */}
          <div className="divide-y divide-white/5">
            {group.matches.map(match => {
              const isLive = match.status === 'IN_PLAY';
              const isFinished = match.status === 'FINISHED';
              const isUpcoming = match.status === 'TIMED' || match.status === 'SCHEDULED';
              const reminderActive = hasReminder(match.id);

              return (
                <div
                  key={match.id}
                  onClick={() => navigate(`/match/${match.id}`)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-5 sm:py-4 hover:bg-white/[0.03] transition-colors cursor-pointer group gap-3"
                >
                  {/* Left: Status / Time */}
                  <div className="flex items-center sm:w-28 shrink-0 gap-2">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-sport-coral text-white animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        {match.minute}'
                      </span>
                    ) : isFinished ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-white/10 text-sport-textMuted">
                        FT
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-sport-textSecondary">
                        <Clock className="w-3.5 h-3.5 text-sport-textMuted" />
                        <span>{formatKickoffTime(match.utcDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Center: Teams & Score */}
                  <div className="flex-1 flex items-center justify-between sm:justify-center sm:gap-8 min-w-0">
                    {/* Home Team */}
                    <div className="flex items-center gap-2.5 sm:w-44 justify-start sm:justify-end min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-white truncate text-left sm:text-right">
                        {match.homeTeam.name}
                      </span>
                      <img
                        src={match.homeTeam.crest}
                        alt={match.homeTeam.name}
                        className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0"
                      />
                    </div>

                    {/* Score / VS Display */}
                    <div className="px-3 shrink-0 flex items-center justify-center min-w-[50px]">
                      {isLive || isFinished ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/5 font-mono text-sm sm:text-base font-extrabold text-white">
                          <span>{match.score.home ?? 0}</span>
                          <span className="text-sport-textMuted">-</span>
                          <span>{match.score.away ?? 0}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-medium text-sport-textMuted px-2 py-0.5 rounded bg-white/5">
                          vs
                        </span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2.5 sm:w-44 justify-end sm:justify-start min-w-0">
                      <img
                        src={match.awayTeam.crest}
                        alt={match.awayTeam.name}
                        className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0"
                      />
                      <span className="text-xs sm:text-sm font-semibold text-white truncate text-right sm:text-left">
                        {match.awayTeam.name}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions: Watch stream / Reminders */}
                  <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {match.hasLiveStream && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/match/${match.id}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sport-electricBlue/20 hover:bg-sport-electricBlue border border-sport-electricBlue/40 hover:border-sport-electricBlue text-white text-xs font-semibold transition-all group-hover:scale-105"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Watch</span>
                      </button>
                    )}

                    {isUpcoming && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleReminder(
                            match.id,
                            `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
                            match.utcDate,
                            match.competition.name
                          );
                        }}
                        className={`p-2 rounded-xl transition-colors ${
                          reminderActive
                            ? 'bg-sport-accentYellow/20 text-sport-accentYellow border border-sport-accentYellow/30'
                            : 'bg-white/5 hover:bg-white/10 text-sport-textMuted hover:text-white'
                        }`}
                        title={reminderActive ? 'Reminder active' : 'Set match reminder'}
                        aria-label="Set match reminder"
                      >
                        <Bell className={`w-4 h-4 ${reminderActive ? 'fill-sport-accentYellow' : ''}`} />
                      </button>
                    )}

                    <div className="hidden sm:block text-sport-textMuted group-hover:text-white group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
