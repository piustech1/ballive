import React, { createContext, useContext, useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
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
  isFullscreen: boolean;
  setIsFullscreen: (val: boolean) => void;
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentRoute = stack[stack.length - 1];

  const navigate = (route: ScreenRoute) => {
    if (isFullscreen) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      setIsFullscreen(false);
    }
    setStack(prev => [...prev, route]);
  };

  const goBack = (): boolean => {
    if (isFullscreen) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      setIsFullscreen(false);
      return true;
    }
    if (stack.length > 1) {
      setStack(prev => prev.slice(0, prev.length - 1));
      return true;
    }
    return false;
  };

  const switchTab = (tab: TabDestination) => {
    if (isFullscreen) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      setIsFullscreen(false);
    }
    setActiveTab(tab);
    setStack([{ name: 'Main', tab }]);
  };

  // Hardware Android Back button handler
  useEffect(() => {
    const onBackPress = () => {
      if (isFullscreen) {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
        setIsFullscreen(false);
        return true;
      }
      if (stack.length > 1) {
        setStack(prev => prev.slice(0, prev.length - 1));
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [isFullscreen, stack.length]);

  return (
    <NavigationContext.Provider
      value={{
        currentRoute,
        activeTab,
        stack,
        isFullscreen,
        setIsFullscreen,
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
