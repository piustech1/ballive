import React, { useState } from 'react';
import { Calendar as CalendarIcon, Filter, Search } from 'lucide-react';
import { useFixtures } from '../hooks/useFootball';
import { DateSelectorStrip } from '../components/home/DateSelectorStrip';
import { CompetitionFilterChips } from '../components/home/CompetitionFilterChips';
import { FixturesList } from '../components/home/FixturesList';

export const FixturesPage: React.FC = () => {
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [selectedCompId, setSelectedCompId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');
  const [teamQuery, setTeamQuery] = useState('');

  const { data: fixtures, isLoading } = useFixtures({
    date: statusFilter === 'live' ? undefined : selectedDate,
    competitionId: selectedCompId,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const filtered = fixtures?.filter(m => {
    if (!teamQuery.trim()) return true;
    const q = teamQuery.toLowerCase();
    return (
      m.homeTeam.name.toLowerCase().includes(q) ||
      m.awayTeam.name.toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="flex-1 min-w-0 max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-16 space-y-5">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-sport-accentYellow" />
            <span>Fixtures & Results</span>
          </h1>
          <p className="text-xs text-sport-textMuted mt-1">
            Browse complete schedules, local kickoff times, match reminders, and final scores.
          </p>
        </div>

        {/* Search team filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-sport-textMuted" />
          <input
            type="text"
            value={teamQuery}
            onChange={e => setTeamQuery(e.target.value)}
            placeholder="Search team fixture..."
            className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-sport-textMuted outline-none focus:border-sport-electricBlue"
          />
        </div>
      </div>

      {/* Date Selector Strip */}
      <DateSelectorStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        showLiveOnly={statusFilter === 'live'}
        onToggleLiveOnly={() =>
          setStatusFilter(statusFilter === 'live' ? 'all' : 'live')
        }
        liveCount={0}
      />

      {/* Match Status Segmented Controls */}
      <div className="flex items-center gap-2 px-1">
        {(['all', 'upcoming', 'finished'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
              statusFilter === status
                ? 'bg-sport-electricBlue text-white font-bold'
                : 'bg-white/5 hover:bg-white/10 text-sport-textSecondary'
            }`}
          >
            {status === 'all' ? 'All Matches' : status}
          </button>
        ))}
      </div>

      {/* Competition Filter Chips */}
      <CompetitionFilterChips
        selectedCompetitionId={selectedCompId}
        onSelectCompetition={setSelectedCompId}
      />

      {/* Fixtures List */}
      <FixturesList matches={filtered} isLoading={isLoading} />
    </div>
  );
};
