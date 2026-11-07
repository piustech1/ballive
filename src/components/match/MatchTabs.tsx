import React, { useState } from 'react';
import {
  Activity,
  BarChart2,
  Users,
  History,
  Tv,
  ArrowRightLeft,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Match, MatchEvent, Player } from '../../types/football';

interface MatchTabsProps {
  match: Match;
}

export const MatchTabs: React.FC<MatchTabsProps> = ({ match }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'lineups' | 'h2h' | 'broadcasters'>('overview');

  const tabs = [
    { id: 'overview', label: 'Timeline', icon: Activity },
    { id: 'stats', label: 'Statistics', icon: BarChart2 },
    { id: 'lineups', label: 'Lineups', icon: Users },
    { id: 'h2h', label: 'H2H & Form', icon: History },
    { id: 'broadcasters', label: 'Broadcasters', icon: Tv },
  ] as const;

  return (
    <div className="w-full my-4">
      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 border-b border-white/10">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 select-none ${
                isActive
                  ? 'bg-sport-electricBlue text-white shadow-glow-blue'
                  : 'bg-[#121622] hover:bg-[#182030] text-sport-textSecondary border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {/* ================= OVERVIEW / TIMELINE TAB ================= */}
        {activeTab === 'overview' && (
          <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 sm:p-6 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-sport-textMuted flex items-center gap-2">
              <Activity className="w-4 h-4 text-sport-coral" />
              <span>Key Match Events</span>
            </h4>

            {match.events && match.events.length > 0 ? (
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {match.events.map(ev => {
                  const isHome = ev.teamId === match.homeTeam.id;
                  const team = isHome ? match.homeTeam : match.awayTeam;

                  return (
                    <div key={ev.id} className="relative flex items-start gap-3 sm:gap-4 group">
                      {/* Event Dot Icon */}
                      <div className="absolute -left-6 sm:-left-8 mt-1 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#1A2234] border border-white/20 flex items-center justify-center shrink-0">
                        {ev.type === 'GOAL' && <span className="text-xs">⚽</span>}
                        {ev.type === 'YELLOW_CARD' && (
                          <span className="w-2.5 h-3.5 bg-yellow-400 rounded-xs" />
                        )}
                        {ev.type === 'RED_CARD' && (
                          <span className="w-2.5 h-3.5 bg-red-600 rounded-xs" />
                        )}
                        {ev.type === 'SUBSTITUTION' && (
                          <ArrowRightLeft className="w-3 h-3 text-sport-neonBlue" />
                        )}
                        {ev.type === 'VAR' && (
                          <AlertCircle className="w-3 h-3 text-sport-accentYellow" />
                        )}
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={team.crest} alt="" className="w-5 h-5 object-contain shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-white truncate">
                              {ev.player}
                            </p>
                            {ev.assist && (
                              <p className="text-[11px] text-sport-textMuted truncate">
                                Assist: {ev.assist}
                              </p>
                            )}
                            {ev.detail && (
                              <p className="text-[11px] text-sport-textMuted truncate">{ev.detail}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/10 font-mono font-bold text-xs text-white">
                            {ev.minute}'
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-sport-textMuted">
                No key match events recorded yet. Match events will populate dynamically during live play.
              </div>
            )}
          </div>
        )}

        {/* ================= STATISTICS TAB ================= */}
        {activeTab === 'stats' && (
          <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 sm:p-6 space-y-6">
            {/* Teams Header in Stats */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 text-xs sm:text-sm font-bold text-white">
              <div className="flex items-center gap-2">
                <img src={match.homeTeam.crest} alt="" className="w-5 h-5 object-contain" />
                <span>{match.homeTeam.shortName}</span>
              </div>
              <span className="text-xs uppercase text-sport-textMuted">Match Stats</span>
              <div className="flex items-center gap-2">
                <span>{match.awayTeam.shortName}</span>
                <img src={match.awayTeam.crest} alt="" className="w-5 h-5 object-contain" />
              </div>
            </div>

            {match.stats ? (
              <div className="space-y-4">
                {[
                  { label: 'Ball Possession', val: match.stats.possession, unit: '%' },
                  { label: 'Expected Goals (xG)', val: match.stats.expectedGoals, unit: '' },
                  { label: 'Total Shots', val: match.stats.shotsTotal, unit: '' },
                  { label: 'Shots on Target', val: match.stats.shotsOnTarget, unit: '' },
                  { label: 'Corner Kicks', val: match.stats.corners, unit: '' },
                  { label: 'Fouls', val: match.stats.fouls, unit: '' },
                  { label: 'Yellow Cards', val: match.stats.yellowCards, unit: '' },
                  { label: 'Goalkeeper Saves', val: match.stats.saves, unit: '' },
                  { label: 'Pass Accuracy', val: match.stats.passesAccuracy, unit: '%' },
                ].map((stat, i) => {
                  const [homeVal, awayVal] = stat.val;
                  const total = homeVal + awayVal || 1;
                  const homePercent = Math.round((homeVal / total) * 100);

                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="font-mono text-white">
                          {homeVal}
                          {stat.unit}
                        </span>
                        <span className="text-sport-textMuted font-medium">{stat.label}</span>
                        <span className="font-mono text-white">
                          {awayVal}
                          {stat.unit}
                        </span>
                      </div>

                      {/* Dual Progress Bar */}
                      <div className="h-2 w-full bg-black/40 rounded-full flex overflow-hidden">
                        <div
                          style={{ width: `${homePercent}%` }}
                          className="bg-sport-electricBlue h-full rounded-l-full transition-all duration-500"
                        />
                        <div
                          style={{ width: `${100 - homePercent}%` }}
                          className="bg-sport-coral h-full rounded-r-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-sport-textMuted">
                Detailed stats will be tracked live once match kicks off.
              </div>
            )}
          </div>
        )}

        {/* ================= LINEUPS & TACTICAL PITCH TAB ================= */}
        {activeTab === 'lineups' && (
          <div className="space-y-6">
            {match.lineups ? (
              <>
                {/* 2D Tactical Football Pitch Simulation */}
                <div className="rounded-3xl bg-gradient-to-b from-[#14532D] to-[#0D381E] border border-emerald-500/30 p-4 sm:p-6 shadow-2xl relative overflow-hidden select-none">
                  {/* Pitch lines markings */}
                  <div className="absolute inset-4 border-2 border-white/20 rounded-2xl pointer-events-none" />
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/20 -translate-y-1/2 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white/20 rounded-full pointer-events-none" />
                  {/* Goal boxes */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-44 h-16 border-b-2 border-x-2 border-white/20 rounded-b-lg pointer-events-none" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-44 h-16 border-t-2 border-x-2 border-white/20 rounded-t-lg pointer-events-none" />

                  {/* Formations Label */}
                  <div className="flex justify-between items-center text-xs font-bold text-white mb-6 relative z-10 px-2">
                    <span className="bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {match.homeTeam.name} ({match.lineups.home.formation})
                    </span>
                    <span className="bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {match.awayTeam.name} ({match.lineups.away.formation})
                    </span>
                  </div>

                  {/* Pitch Players Grid */}
                  <div className="relative z-10 py-4 grid grid-cols-2 gap-4 min-h-[380px]">
                    {/* Home Team Side (Left) */}
                    <div className="flex flex-col justify-around items-center">
                      <div className="flex flex-wrap justify-center gap-3">
                        {match.lineups.home.startingXI.map(player => (
                          <div
                            key={player.id}
                            className="flex flex-col items-center group cursor-pointer"
                            title={`${player.name} (${player.position}) - Rating: ${player.rating}`}
                          >
                            <div className="w-8 h-8 rounded-full bg-sport-electricBlue text-white font-mono font-bold text-xs flex items-center justify-center border-2 border-white shadow-md group-hover:scale-110 transition-transform">
                              {player.number}
                            </div>
                            <span className="text-[10px] font-semibold text-white drop-shadow-md text-center max-w-[65px] truncate mt-0.5">
                              {player.name.split(' ').pop()}
                            </span>
                            <span className="text-[9px] font-mono text-emerald-300">
                              ★{player.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Away Team Side (Right) */}
                    <div className="flex flex-col justify-around items-center">
                      <div className="flex flex-wrap justify-center gap-3">
                        {match.lineups.away.startingXI.map(player => (
                          <div
                            key={player.id}
                            className="flex flex-col items-center group cursor-pointer"
                            title={`${player.name} (${player.position}) - Rating: ${player.rating}`}
                          >
                            <div className="w-8 h-8 rounded-full bg-sport-coral text-white font-mono font-bold text-xs flex items-center justify-center border-2 border-white shadow-md group-hover:scale-110 transition-transform">
                              {player.number}
                            </div>
                            <span className="text-[10px] font-semibold text-white drop-shadow-md text-center max-w-[65px] truncate mt-0.5">
                              {player.name.split(' ').pop()}
                            </span>
                            <span className="text-[9px] font-mono text-rose-300">
                              ★{player.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Substitutes Bench */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-[#111622] border border-white/5 p-4">
                    <h5 className="text-xs font-bold uppercase text-sport-textMuted mb-2">
                      {match.homeTeam.shortName} Substitutes
                    </h5>
                    <div className="space-y-1.5 text-xs text-white">
                      {match.lineups.home.substitutes.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                          <span>{sub.number}. {sub.name}</span>
                          <span className="text-sport-textMuted">{sub.position}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#111622] border border-white/5 p-4">
                    <h5 className="text-xs font-bold uppercase text-sport-textMuted mb-2">
                      {match.awayTeam.shortName} Substitutes
                    </h5>
                    <div className="space-y-1.5 text-xs text-white">
                      {match.lineups.away.substitutes.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                          <span>{sub.number}. {sub.name}</span>
                          <span className="text-sport-textMuted">{sub.position}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-3xl bg-[#111622] border border-white/5 p-8 text-center text-xs text-sport-textMuted">
                Official lineups will be confirmed 60 minutes before kickoff.
              </div>
            )}
          </div>
        )}

        {/* ================= H2H & FORM TAB ================= */}
        {activeTab === 'h2h' && (
          <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 sm:p-6 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-sport-textMuted">
              Head-to-Head Record
            </h4>

            {match.headToHead ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-white/5">
                    <span className="text-xl font-bold font-mono text-sport-neonBlue">
                      {match.headToHead.homeWins}
                    </span>
                    <p className="text-[11px] text-sport-textMuted mt-1">
                      {match.homeTeam.shortName} Wins
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5">
                    <span className="text-xl font-bold font-mono text-white">
                      {match.headToHead.draws}
                    </span>
                    <p className="text-[11px] text-sport-textMuted mt-1">Draws</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5">
                    <span className="text-xl font-bold font-mono text-sport-coral">
                      {match.headToHead.awayWins}
                    </span>
                    <p className="text-[11px] text-sport-textMuted mt-1">
                      {match.awayTeam.shortName} Wins
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-sport-textMuted uppercase tracking-wider">
                    Recent Meetings
                  </p>
                  {match.headToHead.lastMatches.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-xs text-white"
                    >
                      <span className="text-sport-textMuted font-mono">{m.date}</span>
                      <div className="flex items-center gap-2 font-semibold">
                        <span>{match.homeTeam.shortName}</span>
                        <span className="px-2 py-0.5 rounded bg-black/40 font-mono">
                          {m.homeScore} - {m.awayScore}
                        </span>
                        <span>{match.awayTeam.shortName}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.winner === 'HOME'
                            ? 'bg-sport-neonBlue/20 text-sport-neonBlue'
                            : m.winner === 'AWAY'
                            ? 'bg-sport-coral/20 text-sport-coral'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {m.winner}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-sport-textMuted">
                Historical head-to-head records are compiled across the last 5 seasons.
              </div>
            )}
          </div>
        )}

        {/* ================= BROADCASTERS TAB ================= */}
        {activeTab === 'broadcasters' && (
          <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-sport-emerald text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Broadcast Partners</span>
            </div>
            <p className="text-xs text-sport-textMuted leading-relaxed">
              SPORT2 connects authorized video streams and official broadcast schedules according to regional broadcast rights.
            </p>

            <div className="space-y-2 pt-2">
              {match.broadcasters && match.broadcasters.length > 0 ? (
                match.broadcasters.map((bc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{bc.network}</p>
                      <p className="text-sport-textMuted text-[11px]">{bc.region}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sport-emerald/20 text-sport-emerald border border-sport-emerald/30">
                      Verified Partner
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-white/5 text-xs text-sport-textMuted">
                  Universal global pass active for this match feed.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
