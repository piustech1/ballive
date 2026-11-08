import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faPlay,
  faChevronRight,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
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

  /* ─── Loading Skeletons ─── */
  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 my-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#141824] p-4 space-y-3 animate-pulse"
          >
            <div className="h-4 w-44 bg-white/10 rounded-lg" />
            {Array.from({ length: 3 }).map((__, j) => (
              <div key={j} className="h-12 w-full bg-white/5 rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  /* ─── Empty State ─── */
  if (matches.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 my-8 text-center">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#141824] shadow-lg flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 text-white/50">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-xl" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Fixtures Found</h3>
          <p className="text-xs text-white/50 max-w-xs">
            No matches scheduled for this selection. Try choosing another day or toggle the Live filter.
          </p>
        </div>
      </div>
    );
  }

  /* ─── Group by Competition ─── */
  const grouped = matches.reduce((acc, match) => {
    const key = match.competition.id;
    if (!acc[key]) acc[key] = { competition: match.competition, matches: [] };
    acc[key].matches.push(match);
    return acc;
  }, {} as Record<string, { competition: Match['competition']; matches: Match[] }>);

  return (
    <div className="w-full px-4 sm:px-6 my-3.5 space-y-4">
      {Object.values(grouped).map(group => (
        <div
          key={group.competition.id}
          className="rounded-2xl bg-[#141824] shadow-lg overflow-hidden"
        >
          {/* ── Competition Header (NO OUTLINES) ── */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#181D2B]">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-white/10 p-0.5 flex items-center justify-center">
                <img
                  src={group.competition.emblem}
                  alt={group.competition.name}
                  className="w-5 h-5 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {group.competition.name}
              </span>
            </div>

            <span className="text-[11px] font-medium text-white/40">
              {group.matches.length} {group.matches.length === 1 ? 'match' : 'matches'}
            </span>
          </div>

          {/* ── Match Rows (NO OUTLINES, NO BORDERS) ── */}
          <div>
            {group.matches.map((match, idx) => {
              const isLive = match.status === 'IN_PLAY';
              const isFinished = match.status === 'FINISHED';
              const isUpcoming = match.status === 'TIMED' || match.status === 'SCHEDULED';
              const reminderActive = hasReminder(match.id);

              return (
                <div
                  key={match.id}
                  onClick={() => navigate(`/match/${match.id}`)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors cursor-pointer group"
                >
                  {/* Left: Date / Time or Live Status block */}
                  <div className="flex flex-col items-center justify-center w-14 shrink-0 text-center">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#EF4444] text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {match.minute}'
                      </span>
                    ) : isFinished ? (
                      <span className="text-[10px] font-bold text-white/40 uppercase bg-white/10 px-2 py-0.5 rounded-full">
                        FT
                      </span>
                    ) : (
                      <>
                        <span className="text-[9px] text-white/40 leading-none">
                          {new Date(match.utcDate)
                            .toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                            })
                            .replace(/\//g, '.')}
                        </span>
                        <span className="text-[11px] font-bold text-white mt-0.5 leading-none font-mono">
                          {formatKickoffTime(match.utcDate)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Center: Teams with Real Official Club Logos */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    {/* Home team */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <img
                          src={match.homeTeam.crest}
                          alt={match.homeTeam.name}
                          className="w-5 h-5 object-contain"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-xs sm:text-[13px] font-semibold text-white truncate">
                        {match.homeTeam.name}
                      </span>
                      {(isLive || isFinished) && (
                        <span className="ml-auto font-mono font-bold text-xs text-white shrink-0">
                          {match.score.home ?? 0}
                        </span>
                      )}
                    </div>

                    {/* Away team */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <img
                          src={match.awayTeam.crest}
                          alt={match.awayTeam.name}
                          className="w-5 h-5 object-contain"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-xs sm:text-[13px] font-semibold text-white/80 truncate">
                        {match.awayTeam.name}
                      </span>
                      {(isLive || isFinished) && (
                        <span className="ml-auto font-mono font-bold text-xs text-white shrink-0">
                          {match.score.away ?? 0}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Deep Blue Watch button / Font Awesome Bell reminder */}
                  <div className="flex items-center gap-2 shrink-0 ml-1">
                    {match.hasLiveStream && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/match/${match.id}`);
                        }}
                        className="w-8 h-8 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
                        aria-label="Watch stream"
                        title="Watch live stream"
                      >
                        <FontAwesomeIcon icon={faPlay} className="text-[10px] text-white" />
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
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                          reminderActive
                            ? 'text-amber-300 bg-amber-400/20'
                            : 'text-white/40 hover:text-white bg-white/5 hover:bg-white/10'
                        }`}
                        title={reminderActive ? 'Reminder active' : 'Set reminder'}
                        aria-label="Set match reminder"
                      >
                        <FontAwesomeIcon icon={faBell} className="text-xs" />
                      </button>
                    )}

                    <div className="w-5 h-5 flex items-center justify-center text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all">
                      <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
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
