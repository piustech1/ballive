import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Colors from './src/theme/colors';
import { HomeScreen } from './src/screens/HomeScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SavedScreen } from './src/screens/SavedScreen';
import { MatchDetailsScreen } from './src/screens/MatchDetailsScreen';
import { TeamDetailsScreen } from './src/screens/TeamDetailsScreen';
import { CompetitionDetailsScreen } from './src/screens/CompetitionDetailsScreen';
import { AllCompetitionsScreen } from './src/screens/AllCompetitionsScreen';
import { AllLeaguesScreen } from './src/screens/AllLeaguesScreen';
import { AllTeamsScreen } from './src/screens/AllTeamsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { AllLiveStreamsScreen } from './src/screens/AllLiveStreamsScreen';
import { LiveStreamDetailsScreen } from './src/screens/LiveStreamDetailsScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { HelpSupportScreen } from './src/screens/HelpSupportScreen';
import { PrivacySecurityScreen } from './src/screens/PrivacySecurityScreen';
import {
  NavigationProvider,
  useAppNavigation,
} from './src/navigation/NavigationContext';
import {
  BottomNavigation,
  TabDestination,
} from './src/components/navigation/BottomNavigation';
import { startupPreloader } from './src/services/startupPreloader';

const AppContent: React.FC = () => {
  const { currentRoute, activeTab, switchTab, isFullscreen } = useAppNavigation();

  React.useEffect(() => {
    startupPreloader.warmCoreAssetsOnStartup();
  }, []);

  // Lazy tab mounting: Mount tabs on first visit, then keep them mounted in memory for 0ms switching
  const [visitedTabs, setVisitedTabs] = React.useState<Record<TabDestination, boolean>>({
    Home: true,
    Discover: false,
    Saved: false,
    Profile: false,
  });

  React.useEffect(() => {
    if (!visitedTabs[activeTab]) {
      setVisitedTabs(prev => ({ ...prev, [activeTab]: true }));
    }
  }, [activeTab, visitedTabs]);

  const isMainRoute = currentRoute.name === 'Main';

  const renderDetailScreen = () => {
    switch (currentRoute.name) {
      case 'AllLiveStreams':
        return <AllLiveStreamsScreen />;
      case 'LiveStreamDetails':
        return (
          <LiveStreamDetailsScreen
            key={currentRoute.params.match.id}
            match={currentRoute.params.match}
          />
        );
      case 'MatchDetails':
        return (
          <MatchDetailsScreen
            key={currentRoute.params.matchup.id}
            matchup={currentRoute.params.matchup}
          />
        );
      case 'TeamDetails':
        return (
          <TeamDetailsScreen
            key={currentRoute.params.team.id}
            team={currentRoute.params.team}
          />
        );
      case 'CompetitionDetails':
        return (
          <CompetitionDetailsScreen
            key={currentRoute.params.competition.id}
            competition={currentRoute.params.competition}
          />
        );
      case 'AllCompetitions':
        return <AllCompetitionsScreen />;
      case 'AllLeagues':
        return <AllLeaguesScreen />;
      case 'AllTeams':
        return <AllTeamsScreen />;
      case 'Notifications':
        return <NotificationsScreen />;
      case 'About':
        return <AboutScreen />;
      case 'HelpSupport':
        return <HelpSupportScreen />;
      case 'PrivacySecurity':
        return <PrivacySecurityScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={isFullscreen ? styles.fullscreenRootContainer : styles.rootContainer}>
      <StatusBar
        hidden={isFullscreen}
        style="light"
        backgroundColor={isFullscreen ? '#000000' : Colors.headerPurple}
      />

      {/* Screen View */}
      <View style={isFullscreen ? styles.fullscreenScreenContainer : styles.screenContainer}>
        {/* Persistent Bottom Tab Screens: Kept mounted in memory once visited for 0ms instantaneous tab switching */}
        <View style={[styles.mainTabsContainer, !isMainRoute && styles.hiddenPane]}>
          <View style={[styles.tabPane, activeTab === 'Home' ? styles.visiblePane : styles.hiddenPane]}>
            {visitedTabs.Home && <HomeScreen />}
          </View>
          <View style={[styles.tabPane, activeTab === 'Discover' ? styles.visiblePane : styles.hiddenPane]}>
            {visitedTabs.Discover && <DiscoverScreen />}
          </View>
          <View style={[styles.tabPane, activeTab === 'Saved' ? styles.visiblePane : styles.hiddenPane]}>
            {visitedTabs.Saved && <SavedScreen onNavigateToDiscover={() => switchTab('Discover')} />}
          </View>
          <View style={[styles.tabPane, activeTab === 'Profile' ? styles.visiblePane : styles.hiddenPane]}>
            {visitedTabs.Profile && <ProfileScreen />}
          </View>
        </View>

        {/* Stack Detail Screen */}
        {!isMainRoute && renderDetailScreen()}
      </View>

      {/* Anchored Bottom Navigation Bar - hidden during fullscreen video streaming */}
      {!isFullscreen && (
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={switchTab}
        />
      )}
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fullscreenRootContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screenContainer: {
    flex: 1,
  },
  fullscreenScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  mainTabsContainer: {
    flex: 1,
  },
  tabPane: {
    flex: 1,
  },
  visiblePane: {
    display: 'flex',
  },
  hiddenPane: {
    display: 'none',
  },
});
