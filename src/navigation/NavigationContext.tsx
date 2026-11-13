import React, { createContext, useContext, useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { TabDestination } from '../components/navigation/BottomNavigation';
import {
  DiscoverMatchup,
  PopularTeam,
  PopularLeague,
  DiscoverCompetition,
} from '../constants/discoverData';

export type ScreenRoute =
  | { name: 'Main'; tab: TabDestination }
  | { name: 'AllLiveStreams' }
  | { name: 'LiveStreamDetails'; params: { match: DiscoverMatchup } }
  | { name: 'MatchDetails'; params: { matchup: DiscoverMatchup } }
  | { name: 'TeamDetails'; params: { team: PopularTeam } }
  | { name: 'CompetitionDetails'; params: { competition: DiscoverCompetition | PopularLeague } }
  | { name: 'AllCompetitions' }
  | { name: 'AllLeagues' }
  | { name: 'AllTeams' }
  | { name: 'Notifications' }
  | { name: 'About' }
  | { name: 'HelpSupport' }
  | { name: 'PrivacySecurity' };

interface NavigationContextType {
  currentRoute: ScreenRoute;
  activeTab: TabDestination;
  stack: ScreenRoute[];
  navigate: (route: ScreenRoute) => void;
  goBack: () => boolean;
  switchTab: (tab: TabDestination) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabDestination>('Home');
  const [stack, setStack] = useState<ScreenRoute[]>([
    { name: 'Main', tab: 'Home' },
  ]);

  const currentRoute = stack[stack.length - 1];

  const navigate = (route: ScreenRoute) => {
    setStack(prev => [...prev, route]);
  };

  const goBack = (): boolean => {
    if (stack.length > 1) {
      setStack(prev => prev.slice(0, prev.length - 1));
      return true;
    }
    return false;
  };

  const switchTab = (tab: TabDestination) => {
    setActiveTab(tab);
    setStack([{ name: 'Main', tab }]);
  };

  // Hardware Android Back button handler
  useEffect(() => {
    const onBackPress = () => {
      if (stack.length > 1) {
        setStack(prev => prev.slice(0, prev.length - 1));
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [stack.length]);

  return (
    <NavigationContext.Provider
      value={{
        currentRoute,
        activeTab,
        stack,
        navigate,
        goBack,
        switchTab,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useAppNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useAppNavigation must be used within a NavigationProvider');
  }
  return context;
};
