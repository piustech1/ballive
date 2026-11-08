import React, { useState } from 'react';
import { LiveMatchesSection } from '../components/home/LiveMatchesSection';
import { DateSelectorStrip } from '../components/home/DateSelectorStrip';
import { FixturesList } from '../components/home/FixturesList';
import { useLiveMatches, useFixtures } from '../hooks/useFootball';

export const HomePage: React.FC = () => {
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [showLiveOnly, setShowLiveOnly] = useState(false);

  const { data: liveMatches, isLoading: liveLoading } = useLiveMatches();
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures({
    date: showLiveOnly ? undefined : selectedDate,
    competitionId: 'all',
    status: showLiveOnly ? 'live' : undefined,
  });

  return (
    <div className="pb-10">
      {/* Live match cards */}
      <LiveMatchesSection matches={liveMatches} isLoading={liveLoading} />

      {/* Date strip */}
      <DateSelectorStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        showLiveOnly={showLiveOnly}
        onToggleLiveOnly={() => setShowLiveOnly(v => !v)}
        liveCount={liveMatches.length}
      />

      {/* Fixtures grouped by league */}
      <FixturesList matches={fixtures ?? []} isLoading={fixturesLoading} />
    </div>
  );
};
