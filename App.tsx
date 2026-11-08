import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Colors from './src/theme/colors';
import { HomeScreen } from './src/screens/HomeScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import {
  SavedScreen,
  ProfileScreen,
} from './src/screens/PlaceholderScreens';
import {
  BottomNavigation,
  TabDestination,
} from './src/components/navigation/BottomNavigation';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabDestination>('Home');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Discover':
        return <DiscoverScreen />;
      case 'Saved':
        return <SavedScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.rootContainer}>
        <StatusBar style="light" backgroundColor={Colors.headerPurple} />

        {/* Active Screen View */}
        <View style={styles.screenContainer}>
          {renderActiveScreen()}
        </View>

        {/* Anchored Bottom Navigation Bar */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>
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
