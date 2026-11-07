import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LiveMatchesSection } from '../components/home/LiveMatchesSection';
import { FeaturedSpotlight } from '../components/home/FeaturedSpotlight';
import { ChannelsSection } from '../components/home/ChannelsSection';
import { DateSelectorStrip } from '../components/home/DateSelectorStrip';
import { CompetitionFilterChips } from '../components/home/CompetitionFilterChips';
import { FixturesList } from '../components/home/FixturesList';
import { DesktopRightPanel } from '../components/home/DesktopRightPanel';
import { useLiveMatches, useFixtures } from '../hooks/useFootball';

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchFilter = searchParams.get('search');

  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [selectedCompId, setSelectedCompId] = useState<string>('all');
  const [showLiveOnly, setShowLiveOnly] = useState<boolean>(false);

  const { data: liveMatches, isLoading: liveLoading } = useLiveMatches();

  const { data: fixtures, isLoading: fixturesLoading } = useFixtures({
    date: showLiveOnly ? undefined : selectedDate,
    competitionId: selectedCompId,
    status: showLiveOnly ? 'live' : undefined,
  });

  // Filter fixtures if user navigated from search query
  const filteredFixtures = fixtures?.filter(match => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      match.homeTeam.name.toLowerCase().includes(q) ||
      match.awayTeam.name.toLowerCase().includes(q) ||
      match.competition.name.toLowerCase().includes(q)
    );
  }) || [];

  const featuredMatch = liveMatches[0] || fixtures?.find(m => m.isFeatured) || fixtures?.[0];

  return (
    <div className="flex-1 min-w-0 pb-20 md:pb-12">
      {/* Search Filter banner if applied */}
      {searchFilter && (
        <div className="mx-4 sm:mx-6 my-2 px-4 py-2 rounded-xl bg-sport-electricBlue/20 border border-sport-electricBlue/30 text-xs text-white flex items-center justify-between">
          <span>Filtering matches for "{searchFilter}"</span>
          <a href="/" className="underline text-sport-neonBlue font-semibold">
            Clear filter
          </a>
        </div>
      )}

      {/* 1. HERO SECTION: Live Matches (PRESERVED DIRECTLY FROM REFERENCE SCREENSHOT) */}
      <LiveMatchesSection matches={liveMatches} isLoading={liveLoading} />

      {/* 2. SPOTLIGHT MARQUEE BANNER: High-impact cinema match feature */}
      {!searchFilter && !showLiveOnly && featuredMatch && (
        <FeaturedSpotlight match={featuredMatch} />
      )}

      {/* 24/7 Live Sports TV Channels from sports-streaming-api */}
      {!searchFilter && !showLiveOnly && <ChannelsSection />}

      {/* 3. REDESIGNED TODAY'S MATCHES DISCOVERY INTERFACE */}
      <div className="mt-4">
        {/* Section title */}
        <div className="px-4 sm:px-6 flex items-center justify-between mb-1">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-display">
            Match Discovery
          </h2>
          <span className="text-xs text-sport-textMuted">Local Timezone</span>
        </div>

        {/* Modern Date Strip & Live Filter */}
        <DateSelectorStrip
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          showLiveOnly={showLiveOnly}
          onToggleLiveOnly={() => setShowLiveOnly(!showLiveOnly)}
          liveCount={liveMatches.length}
        />

        {/* Competition Filter Pills */}
        <CompetitionFilterChips
          selectedCompetitionId={selectedCompId}
          onSelectCompetition={setSelectedCompId}
        />

        {/* Grouped Match Rows with Watch Button & Reminder Controls */}
        <FixturesList matches={filteredFixtures} isLoading={fixturesLoading} />
      </div>
    </div>
  );
};
