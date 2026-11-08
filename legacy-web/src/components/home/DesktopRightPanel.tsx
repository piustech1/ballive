import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Volume2, VolumeX, Maximize2, Trophy, ShieldCheck, ExternalLink } from 'lucide-react';
import { useLiveMatches, useStandings } from '../../hooks/useFootball';
import { COMPETITIONS } from '../../data/mockMatches';

export const DesktopRightPanel: React.FC = () => {
  const navigate = useNavigate();
  const { data: liveMatches } = useLiveMatches();
  const [selectedComp, setSelectedComp] = useState<string>('ucl');
  const { data: standings } = useStandings(selectedComp);
  const [isMuted, setIsMuted] = useState(true);

  const featuredLiveMatch = liveMatches[0];

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 space-y-6 px-4 py-6 border-l border-white/5 select-none">
      {/* Live Stream Mini Player Preview */}
      {featuredLiveMatch && (
        <div className="rounded-3xl bg-[#121622] border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-3 bg-[#161D2E] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sport-coral animate-ping" />
              <span className="text-xs font-black uppercase text-white tracking-wider">
                LIVE STREAM PREVIEW
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-sport-accentYellow">
              {featuredLiveMatch.minute}' MIN
            </span>
          </div>

          {/* Video Container */}
          <div className="relative aspect-video bg-black group">
            <video
              src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-3 opacity-90 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sport-coral text-white">
                  LIVE 1080p
                </span>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white truncate max-w-[170px]">
                  {featuredLiveMatch.homeTeam.shortName} {featuredLiveMatch.score.home ?? 0} -{' '}
                  {featuredLiveMatch.score.away ?? 0} {featuredLiveMatch.awayTeam.shortName}
                </div>
                <button
                  onClick={() => navigate(`/match/${featuredLiveMatch.id}`)}
                  className="p-1.5 rounded-full bg-sport-electricBlue hover:bg-blue-600 text-white transition-all shadow-glow-blue"
                  title="Expand to Full Match Center"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#0F1420] flex items-center justify-between text-xs">
            <span className="text-sport-textMuted">{featuredLiveMatch.competition.name}</span>
            <button
              onClick={() => navigate(`/match/${featuredLiveMatch.id}`)}
              className="text-sport-neonBlue hover:underline font-semibold flex items-center gap-1"
            >
              <span>Watch Now</span>
              <Play className="w-2.5 h-2.5 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* Mini Standings Widget */}
      <div className="rounded-3xl bg-[#121622] border border-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-sport-accentYellow" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Standings
            </h4>
          </div>

          {/* League Selector Pill */}
          <div className="flex gap-1 bg-black/40 p-1 rounded-xl">
            <button
              onClick={() => setSelectedComp('ucl')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                selectedComp === 'ucl' ? 'bg-white text-black' : 'text-sport-textMuted hover:text-white'
              }`}
            >
              UCL
            </button>
            <button
              onClick={() => setSelectedComp('pl')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                selectedComp === 'pl' ? 'bg-white text-black' : 'text-sport-textMuted hover:text-white'
              }`}
            >
              PL
            </button>
            <button
              onClick={() => setSelectedComp('laliga')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                selectedComp === 'laliga' ? 'bg-white text-black' : 'text-sport-textMuted hover:text-white'
              }`}
            >
              LaLiga
            </button>
          </div>
        </div>

        {/* Table Rows */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center text-[10px] font-semibold text-sport-textMuted px-2 pb-1 border-b border-white/5">
            <span className="w-5">#</span>
            <span className="flex-1">Club</span>
            <span className="w-7 text-center">PL</span>
            <span className="w-7 text-center">GD</span>
            <span className="w-8 text-right">PTS</span>
          </div>

          {standings?.slice(0, 5).map(row => (
            <div
              key={row.team.id}
              onClick={() => navigate(`/?search=${encodeURIComponent(row.team.name)}`)}
              className="flex items-center px-2 py-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
            >
              <span
                className={`w-5 font-mono font-bold ${
                  row.position <= 4 ? 'text-sport-neonBlue' : 'text-sport-textMuted'
                }`}
              >
                {row.position}
              </span>
              <div className="flex-1 flex items-center gap-2 min-w-0 pr-1">
                <img src={row.team.crest} alt="" className="w-4 h-4 object-contain shrink-0" />
                <span className="truncate text-white font-medium">{row.team.shortName}</span>
              </div>
              <span className="w-7 text-center font-mono text-sport-textMuted">{row.played}</span>
              <span className="w-7 text-center font-mono text-sport-textMuted">
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </span>
              <span className="w-8 text-right font-mono font-bold text-white">{row.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Official Broadcasters Guide */}
      <div className="rounded-3xl bg-[#121622] border border-white/5 p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
          <ShieldCheck className="w-4 h-4 text-sport-emerald" />
          <span>Official Broadcasters</span>
        </div>
        <p className="text-[11px] text-sport-textMuted leading-relaxed">
          Matches on SPORT2 are synced with licensed rights-holders.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-sport-textSecondary font-medium">
          <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
            <span>Sky Sports</span>
            <span className="text-[9px] text-sport-emerald font-bold">UK</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
            <span>TNT Sports</span>
            <span className="text-[9px] text-sport-emerald font-bold">UCL</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
            <span>DAZN</span>
            <span className="text-[9px] text-sport-emerald font-bold">EU</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
            <span>Paramount+</span>
            <span className="text-[9px] text-sport-emerald font-bold">US</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
