import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Trophy, ChevronRight, ShieldCheck, ArrowRight, Play } from 'lucide-react';
import { useCompetitions, useStandings, useFixtures } from '../hooks/useFootball';
import { COMPETITIONS } from '../data/mockMatches';
import { FixturesList } from '../components/home/FixturesList';

export const CompetitionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeCompId = searchParams.get('id') || 'ucl';
  const { data: competitions } = useCompetitions();
  const { data: standings } = useStandings(activeCompId);
  const { data: competitionFixtures, isLoading: fixturesLoading } = useFixtures({
    competitionId: activeCompId,
  });

  const activeComp = COMPETITIONS[activeCompId] || COMPETITIONS.ucl;

  const handleSelectComp = (id: string) => {
    setSearchParams({ id });
  };

  return (
    <div className="flex-1 min-w-0 max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-16 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-sport-accentYellow" />
          <span>Competitions & Leagues</span>
        </h1>
        <p className="text-xs text-sport-textMuted mt-1">
          Explore elite football tournaments, table standings, live streams, and fixture schedules.
        </p>
      </div>

      {/* League Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {competitions?.map(comp => {
          const isSelected = comp.id === activeCompId;
          return (
            <div
              key={comp.id}
              onClick={() => handleSelectComp(comp.id)}
              className={`p-3.5 rounded-2xl flex flex-col items-center text-center gap-2 cursor-pointer transition-all select-none border ${
                isSelected
                  ? 'bg-sport-electricBlue/20 border-sport-electricBlue shadow-glow-blue scale-[1.02]'
                  : 'bg-[#111622] border-white/5 hover:border-white/10 hover:bg-[#151C2C]'
              }`}
            >
              <img src={comp.emblem} alt={comp.name} className="w-10 h-10 object-contain drop-shadow-md" />
              <div className="min-w-0 w-full">
                <p className="text-xs font-bold text-white truncate">{comp.name}</p>
                <p className="text-[10px] text-sport-textMuted truncate">{comp.country}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Competition Hero Bar */}
      <div className="rounded-3xl bg-gradient-to-r from-[#121829] via-[#161F36] to-[#0F1422] border border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={activeComp.emblem}
            alt={activeComp.name}
            className="w-16 h-16 object-contain drop-shadow-xl"
          />
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-white font-display">
              {activeComp.name}
            </h2>
            <p className="text-xs text-sport-textMuted flex items-center gap-2 mt-0.5">
              <span>{activeComp.country}</span>
              <span>•</span>
              <span className="text-sport-emerald flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live Center Active
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white font-semibold">
            Season 2024/25
          </span>
        </div>
      </div>

      {/* Standings Table & Matches Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Standings Table */}
        <div className="lg:col-span-2 rounded-3xl bg-[#111622] border border-white/5 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-sport-accentYellow" />
              <span>League Table Standings</span>
            </h3>
            <span className="text-[11px] text-sport-textMuted">Top 8</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-semibold uppercase text-sport-textMuted">
                  <th className="py-2.5 px-2 w-8">#</th>
                  <th className="py-2.5 px-2">Club</th>
                  <th className="py-2.5 px-2 text-center w-10">PL</th>
                  <th className="py-2.5 px-2 text-center w-10">W</th>
                  <th className="py-2.5 px-2 text-center w-10">D</th>
                  <th className="py-2.5 px-2 text-center w-10">L</th>
                  <th className="py-2.5 px-2 text-center w-12">GD</th>
                  <th className="py-2.5 px-2 text-center w-12 font-bold text-white">PTS</th>
                  <th className="py-2.5 px-2 text-right hidden sm:table-cell w-28">Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {standings?.map(row => (
                  <tr
                    key={row.team.id}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/?search=${encodeURIComponent(row.team.name)}`)}
                  >
                    <td className="py-3 px-2 font-mono font-bold">
                      <span
                        className={`inline-block w-5 text-center ${
                          row.position <= 4 ? 'text-sport-neonBlue' : 'text-sport-textMuted'
                        }`}
                      >
                        {row.position}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-white">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={row.team.crest} alt="" className="w-5 h-5 object-contain shrink-0" />
                        <span className="truncate">{row.team.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-sport-textMuted">{row.played}</td>
                    <td className="py-3 px-2 text-center font-mono text-sport-textMuted">{row.won}</td>
                    <td className="py-3 px-2 text-center font-mono text-sport-textMuted">{row.drawn}</td>
                    <td className="py-3 px-2 text-center font-mono text-sport-textMuted">{row.lost}</td>
                    <td className="py-3 px-2 text-center font-mono text-sport-textMuted">
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-extrabold text-white text-sm">
                      {row.points}
                    </td>
                    <td className="py-3 px-2 text-right hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-1">
                        {row.form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center text-white ${
                              res === 'W'
                                ? 'bg-sport-emerald'
                                : res === 'D'
                                ? 'bg-amber-500'
                                : 'bg-rose-600'
                            }`}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Selected Competition Fixtures */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-[#111622] border border-white/5 p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {activeComp.name} Fixtures
            </h3>

            <div className="space-y-2.5">
              {competitionFixtures?.slice(0, 5).map(m => (
                <div
                  key={m.id}
                  onClick={() => navigate(`/match/${m.id}`)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-white/5 flex items-center justify-between"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <img src={m.homeTeam.crest} alt="" className="w-4 h-4 object-contain" />
                      <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                        {m.homeTeam.shortName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={m.awayTeam.crest} alt="" className="w-4 h-4 object-contain" />
                      <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                        {m.awayTeam.shortName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {m.status === 'IN_PLAY' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sport-coral text-white animate-pulse">
                        LIVE {m.minute}'
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-sport-textMuted">
                        {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(m.utcDate))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
