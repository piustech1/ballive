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
import {
  NavigationProvider,
  useAppNavigation,
} from './src/navigation/NavigationContext';
import {
  BottomNavigation,
  TabDestination,
} from './src/components/navigation/BottomNavigation';

const AppContent: React.FC = () => {
  const { currentRoute, activeTab, switchTab } = useAppNavigation();

  const renderActiveScreen = () => {
    switch (currentRoute.name) {
      case 'AllLiveStreams':
        return <AllLiveStreamsScreen />;
      case 'LiveStreamDetails':
        return <LiveStreamDetailsScreen match={currentRoute.params.match} />;
      case 'MatchDetails':
        return <MatchDetailsScreen matchup={currentRoute.params.matchup} />;
      case 'TeamDetails':
        return <TeamDetailsScreen team={currentRoute.params.team} />;
      case 'CompetitionDetails':
        return <CompetitionDetailsScreen competition={currentRoute.params.competition} />;
      case 'AllCompetitions':
        return <AllCompetitionsScreen />;
      case 'AllLeagues':
        return <AllLeaguesScreen />;
      case 'AllTeams':
        return <AllTeamsScreen />;
      case 'Notifications':
        return <NotificationsScreen />;
      case 'Main':
      default:
        switch (activeTab) {
          case 'Home':
            return <HomeScreen />;
          case 'Discover':
            return <DiscoverScreen />;
          case 'Saved':
            return <SavedScreen onNavigateToDiscover={() => switchTab('Discover')} />;
          case 'Profile':
            return <ProfileScreen />;
          default:
            return <HomeScreen />;
        }
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" backgroundColor={Colors.headerPurple} />

      {/* Active Screen View */}
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>

      {/* Anchored Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={switchTab}
      />
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
  screenContainer: {
    flex: 1,
  },
});
