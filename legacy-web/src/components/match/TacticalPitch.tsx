import React, { useState } from 'react';
import { Users, Shield, Award, Sparkles, ChevronRight, X, Info } from 'lucide-react';
import { Match, Player } from '../../types/football';
import { mapPlayersToCoordinates } from '../../utils/formationCoordinates';
import { getPlayerPhoto } from '../../utils/playerPhotos';

interface TacticalPitchProps {
  match: Match;
}

type PitchViewMode = 'full' | 'home' | 'away' | 'list';

export const TacticalPitch: React.FC<TacticalPitchProps> = ({ match }) => {
  const [viewMode, setViewMode] = useState<PitchViewMode>('full');
  const [selectedPlayer, setSelectedPlayer] = useState<{
    player: Player;
    teamName: string;
    teamCrest: string;
    isHome: boolean;
  } | null>(null);

  const homeLineup = match.lineups?.home;
  const awayLineup = match.lineups?.away;

  if (!homeLineup || !awayLineup) {
    return (
      <div className="rounded-3xl bg-[#111622] border border-white/5 p-8 text-center text-xs text-sport-textMuted">
        Lineups are being verified by the match delegate. Please check back shortly.
      </div>
    );
  }

  // Pre-calculate coordinates for all view modes
  const isFullPitch = viewMode === 'full';

  const homePlayersOnPitch = mapPlayersToCoordinates(homeLineup.startingXI, {
    isAway: false,
    isFullPitch,
    formation: homeLineup.formation,
  });

  const awayPlayersOnPitch = mapPlayersToCoordinates(awayLineup.startingXI, {
    isAway: true,
    isFullPitch,
    formation: awayLineup.formation,
  });

  // Check if player scored in match events
  const playerGoalsMap = new Map<string, number>();
  const playerYellowMap = new Set<string>();

  match.events?.forEach(ev => {
    if (ev.type === 'GOAL') {
      const current = playerGoalsMap.get(ev.player.toLowerCase()) || 0;
      playerGoalsMap.set(ev.player.toLowerCase(), current + 1);
    } else if (ev.type === 'YELLOW_CARD') {
      playerYellowMap.add(ev.player.toLowerCase());
    }
  });

  const renderPlayerNode = (
    player: Player & { coords: { x: number; y: number } },
    isHome: boolean,
    teamName: string,
    teamCrest: string
  ) => {
    const goals = playerGoalsMap.get(player.name.toLowerCase()) || 0;
    const hasYellow = playerYellowMap.has(player.name.toLowerCase());
    const surname = player.name.split(' ').pop() || player.name;
    const photoUrl = getPlayerPhoto(player.name, player.photo);

    return (
      <div
        key={player.id}
        onClick={() => setSelectedPlayer({ player, teamName, teamCrest, isHome })}
        style={{ top: `${player.coords.y}%`, left: `${player.coords.x}%` }}
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-20 select-none transition-transform hover:scale-115 active:scale-95 duration-200"
      >
        {/* Avatar Container */}
        <div className="relative">
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 shadow-xl bg-slate-900 transition-all ${
              isHome
                ? 'border-sport-electricBlue group-hover:ring-4 group-hover:ring-blue-400/50'
                : 'border-sport-coral group-hover:ring-4 group-hover:ring-rose-400/50'
            }`}
          >
            <img
              src={photoUrl}
              alt={player.name}
              onError={e => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  player.name
                )}&background=1E293B&color=F8FAFC&bold=true&size=128`;
              }}
              className="w-full h-full object-cover object-top scale-105"
            />
          </div>

          {/* Shirt Number Badge */}
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-mono font-bold text-[9px] sm:text-[10px] text-white border border-white/50 shadow-md ${
              isHome ? 'bg-blue-600' : 'bg-rose-600'
            }`}
          >
            {player.number}
          </div>

          {/* Captain Badge */}
          {player.isCaptain && (
            <div
              className="absolute -top-1 -left-1 px-1 py-0.2 rounded-xs bg-amber-400 text-black font-extrabold text-[8px] leading-tight shadow-sm"
              title="Team Captain"
            >
              C
            </div>
          )}

          {/* Goal Indicator */}
          {goals > 0 && (
            <div
              className="absolute -top-1.5 -right-1.5 text-xs bg-black/80 rounded-full px-1 shadow-md animate-bounce"
              title={`Scored ${goals} goal(s)`}
            >
              ⚽{goals > 1 ? goals : ''}
            </div>
          )}

          {/* Yellow Card Indicator */}
          {hasYellow && (
            <div
              className="absolute top-2 -right-2.5 w-2 h-3 bg-amber-400 rounded-xs border border-black/40 shadow-sm"
              title="Yellow Card"
            />
          )}
        </div>

        {/* Player Surname Pill */}
        <div className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 shadow-lg text-center max-w-[75px] sm:max-w-[95px]">
          <span className="text-[10px] sm:text-[11px] font-bold text-white truncate">
            {surname}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="mt-0.5">
          <span
            className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] font-bold ${
              player.rating >= 7.5
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : player.rating >= 6.8
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                : 'bg-white/10 text-white/80'
            }`}
          >
            ★{player.rating}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-[#0D111A] border border-white/5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setViewMode('full')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              viewMode === 'full'
                ? 'bg-sport-electricBlue text-white shadow-glow-blue'
                : 'bg-white/5 hover:bg-white/10 text-sport-textMuted hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Full Pitch (22)</span>
          </button>

          <button
            onClick={() => setViewMode('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              viewMode === 'home'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-sport-textMuted hover:text-white'
            }`}
          >
            <img src={match.homeTeam.crest} alt="" className="w-3.5 h-3.5 object-contain" />
            <span>
              {match.homeTeam.shortName} ({homeLineup.formation})
            </span>
          </button>

          <button
            onClick={() => setViewMode('away')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              viewMode === 'away'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-sport-textMuted hover:text-white'
            }`}
          >
            <img src={match.awayTeam.crest} alt="" className="w-3.5 h-3.5 object-contain" />
            <span>
              {match.awayTeam.shortName} ({awayLineup.formation})
            </span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 hover:bg-white/10 text-sport-textMuted hover:text-white'
            }`}
          >
            <span>Squad List</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-sport-textMuted px-2">
          <Info className="w-3 h-3 text-sport-neonBlue" />
          <span>Click on any player to inspect stats</span>
        </div>
      </div>

      {/* 2D TACTICAL PITCH VIEW */}
      {viewMode !== 'list' && (
        <div className="relative rounded-3xl bg-gradient-to-b from-[#14532D] via-[#0F3E22] to-[#0B2C18] border-2 border-emerald-500/30 shadow-2xl overflow-hidden select-none">
          {/* Pitch grass stripe pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_40px,rgba(255,255,255,0.06)_40px,rgba(255,255,255,0.06)_80px)]" />

          {/* Top/Bottom Team Header Labels */}
          <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-lg">
              <img
                src={viewMode === 'home' ? match.homeTeam.crest : match.awayTeam.crest}
                alt=""
                className="w-4 h-4 object-contain"
              />
              <span>
                {viewMode === 'home'
                  ? `${match.homeTeam.name} (${homeLineup.formation})`
                  : `${match.awayTeam.name} (${awayLineup.formation})`}
              </span>
            </div>

            {viewMode === 'full' && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 px-2 py-1 rounded bg-black/40">
                Attacking ↓
              </span>
            )}
          </div>

          {viewMode === 'full' && (
            <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-lg">
                <img src={match.homeTeam.crest} alt="" className="w-4 h-4 object-contain" />
                <span>
                  {match.homeTeam.name} ({homeLineup.formation})
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 px-2 py-1 rounded bg-black/40">
                Attacking ↑
              </span>
            </div>
          )}

          {/* SVG Pitch Markings */}
          <div className="relative w-full aspect-[2/3] min-h-[520px] sm:min-h-[640px] pointer-events-none">
            {/* Outer Pitch Border */}
            <div className="absolute inset-3 sm:inset-5 border-2 border-white/30 rounded-2xl pointer-events-none" />

            {/* Halfway Line */}
            <div className="absolute top-1/2 left-3 sm:left-5 right-3 sm:right-5 h-0.5 bg-white/30 -translate-y-1/2 pointer-events-none" />

            {/* Center Circle & Spot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 sm:w-36 h-28 sm:h-36 border-2 border-white/30 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white/50 rounded-full pointer-events-none" />

            {/* Top Penalty Box & Arc */}
            <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 w-52 sm:w-64 h-24 sm:h-28 border-b-2 border-x-2 border-white/30 rounded-b-lg pointer-events-none" />
            <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-9 sm:h-11 border-b-2 border-x-2 border-white/30 pointer-events-none" />
            <div className="absolute top-[108px] sm:top-[132px] left-1/2 -translate-x-1/2 w-20 sm:w-24 h-10 border-b-2 border-white/30 rounded-b-full pointer-events-none" />

            {/* Bottom Penalty Box & Arc */}
            <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 w-52 sm:w-64 h-24 sm:h-28 border-t-2 border-x-2 border-white/30 rounded-t-lg pointer-events-none" />
            <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-9 sm:h-11 border-t-2 border-x-2 border-white/30 pointer-events-none" />
            <div className="absolute bottom-[108px] sm:bottom-[132px] left-1/2 -translate-x-1/2 w-20 sm:w-24 h-10 border-t-2 border-white/30 rounded-t-full pointer-events-none" />

            {/* Corner Arcs */}
            <div className="absolute top-3 sm:top-5 left-3 sm:left-5 w-4 h-4 border-b-2 border-r-2 border-white/30 rounded-br-full" />
            <div className="absolute top-3 sm:top-5 right-3 sm:right-5 w-4 h-4 border-b-2 border-l-2 border-white/30 rounded-bl-full" />
            <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 w-4 h-4 border-t-2 border-r-2 border-white/30 rounded-tr-full" />
            <div className="absolute bottom-3 sm:bottom-5 right-3 sm:right-5 w-4 h-4 border-t-2 border-l-2 border-white/30 rounded-tl-full" />

            {/* RENDER PLAYERS ON PITCH */}
            <div className="absolute inset-0 pointer-events-auto">
              {/* Full Pitch Mode: Render both Away (top) and Home (bottom) */}
              {viewMode === 'full' && (
                <>
                  {awayPlayersOnPitch.map(p =>
                    renderPlayerNode(p, false, match.awayTeam.name, match.awayTeam.crest)
                  )}
                  {homePlayersOnPitch.map(p =>
                    renderPlayerNode(p, true, match.homeTeam.name, match.homeTeam.crest)
                  )}
                </>
              )}

              {/* Single Team Home Mode */}
              {viewMode === 'home' && (
                <>
                  {homePlayersOnPitch.map(p =>
                    renderPlayerNode(p, true, match.homeTeam.name, match.homeTeam.crest)
                  )}
                </>
              )}

              {/* Single Team Away Mode */}
              {viewMode === 'away' && (
                <>
                  {awayPlayersOnPitch.map(p =>
                    renderPlayerNode(p, false, match.awayTeam.name, match.awayTeam.crest)
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SQUAD LIST VIEW (Accessible Alternative) */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home Team Starting XI */}
          <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <img src={match.homeTeam.crest} alt="" className="w-5 h-5 object-contain" />
                <h4 className="font-bold text-white text-sm">{match.homeTeam.name}</h4>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                {homeLineup.formation}
              </span>
            </div>

            <div className="space-y-2">
              {homeLineup.startingXI.map(player => (
                <div
                  key={player.id}
                  onClick={() =>
                    setSelectedPlayer({
                      player,
                      teamName: match.homeTeam.name,
                      teamCrest: match.homeTeam.crest,
                      isHome: true,
                    })
                  }
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getPlayerPhoto(player.name, player.photo)}
                      alt={player.name}
                      className="w-8 h-8 rounded-full object-cover bg-slate-800 border border-white/20"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-blue-400">
                          {player.number}
                        </span>
                        <p className="text-xs font-bold text-white">{player.name}</p>
                        {player.isCaptain && (
                          <span className="px-1 py-0.2 rounded-xs bg-amber-400 text-black font-extrabold text-[8px]">
                            C
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-sport-textMuted uppercase font-semibold">
                        {player.position}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-emerald-400">
                    ★{player.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Away Team Starting XI */}
          <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <img src={match.awayTeam.crest} alt="" className="w-5 h-5 object-contain" />
                <h4 className="font-bold text-white text-sm">{match.awayTeam.name}</h4>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                {awayLineup.formation}
              </span>
            </div>

            <div className="space-y-2">
              {awayLineup.startingXI.map(player => (
                <div
                  key={player.id}
                  onClick={() =>
                    setSelectedPlayer({
                      player,
                      teamName: match.awayTeam.name,
                      teamCrest: match.awayTeam.crest,
                      isHome: false,
                    })
                  }
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getPlayerPhoto(player.name, player.photo)}
                      alt={player.name}
                      className="w-8 h-8 rounded-full object-cover bg-slate-800 border border-white/20"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-rose-400">
                          {player.number}
                        </span>
                        <p className="text-xs font-bold text-white">{player.name}</p>
                        {player.isCaptain && (
                          <span className="px-1 py-0.2 rounded-xs bg-amber-400 text-black font-extrabold text-[8px]">
                            C
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-sport-textMuted uppercase font-semibold">
                        {player.position}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-emerald-400">
                    ★{player.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBSTITUTES BENCH & COACHING STAFF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Home Team Bench */}
        <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-sport-textMuted flex items-center gap-2">
              <img src={match.homeTeam.crest} alt="" className="w-4 h-4 object-contain" />
              <span>{match.homeTeam.shortName} Substitutes</span>
            </h5>
            <span className="text-[11px] font-semibold text-white/50">
              Coach: <strong className="text-white">{homeLineup.coach}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {homeLineup.substitutes.map(sub => (
              <div
                key={sub.id}
                onClick={() =>
                  setSelectedPlayer({
                    player: sub,
                    teamName: match.homeTeam.name,
                    teamCrest: match.homeTeam.crest,
                    isHome: true,
                  })
                }
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={getPlayerPhoto(sub.name, sub.photo)}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover bg-slate-800"
                  />
                  <div className="min-w-0 truncate">
                    <p className="font-bold text-white truncate text-[11px]">{sub.name}</p>
                    <span className="text-[9px] text-sport-textMuted font-mono">
                      #{sub.number} • {sub.position}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 shrink-0">
                  ★{sub.rating}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Away Team Bench */}
        <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-sport-textMuted flex items-center gap-2">
              <img src={match.awayTeam.crest} alt="" className="w-4 h-4 object-contain" />
              <span>{match.awayTeam.shortName} Substitutes</span>
            </h5>
            <span className="text-[11px] font-semibold text-white/50">
              Coach: <strong className="text-white">{awayLineup.coach}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {awayLineup.substitutes.map(sub => (
              <div
                key={sub.id}
                onClick={() =>
                  setSelectedPlayer({
                    player: sub,
                    teamName: match.awayTeam.name,
                    teamCrest: match.awayTeam.crest,
                    isHome: false,
                  })
                }
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={getPlayerPhoto(sub.name, sub.photo)}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover bg-slate-800"
                  />
                  <div className="min-w-0 truncate">
                    <p className="font-bold text-white truncate text-[11px]">{sub.name}</p>
                    <span className="text-[9px] text-sport-textMuted font-mono">
                      #{sub.number} • {sub.position}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 shrink-0">
                  ★{sub.rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POPUP PLAYER INSPECTOR MODAL */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#111622] border border-white/10 p-6 shadow-2xl space-y-4 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full overflow-hidden border-2 shadow-xl bg-slate-900 ${
                  selectedPlayer.isHome ? 'border-blue-500' : 'border-rose-500'
                }`}
              >
                <img
                  src={getPlayerPhoto(selectedPlayer.player.name, selectedPlayer.player.photo)}
                  alt=""
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {selectedPlayer.player.name}
                  </h3>
                  {selectedPlayer.player.isCaptain && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black font-extrabold text-[9px]">
                      CAPTAIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-sport-textMuted flex items-center gap-1.5 mt-0.5">
                  <img
                    src={selectedPlayer.teamCrest}
                    alt=""
                    className="w-3.5 h-3.5 object-contain"
                  />
                  <span>{selectedPlayer.teamName}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2 text-center">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-sport-textMuted uppercase font-semibold">
                  Number
                </span>
                <p className="text-lg font-mono font-bold text-white mt-0.5">
                  #{selectedPlayer.player.number}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-sport-textMuted uppercase font-semibold">
                  Position
                </span>
                <p className="text-lg font-bold text-sport-neonBlue mt-0.5">
                  {selectedPlayer.player.position}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-sport-textMuted uppercase font-semibold">
                  Rating
                </span>
                <p className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                  ★{selectedPlayer.player.rating}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
