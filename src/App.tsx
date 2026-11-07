import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { NavigationDrawer } from './components/layout/NavigationDrawer';
import { SearchModal } from './components/layout/SearchModal';
import { Toast } from './components/common/Toast';
import { DesktopRightPanel } from './components/home/DesktopRightPanel';
import { HomePage } from './pages/HomePage';
import { MatchPage } from './pages/MatchPage';
import { LivePage } from './pages/LivePage';
import { FixturesPage } from './pages/FixturesPage';
import { CompetitionsPage } from './pages/CompetitionsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { useReminders } from './hooks/useReminders';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
  },
});

const AppContent: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { toastMessage } = useReminders();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white flex flex-col font-sans">
      {/* Search Modal (Cmd+K / Search button) */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Sliding Navigation Drawer */}
      <NavigationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Global In-App Notification Toast */}
      <Toast message={toastMessage} />

      {/* Main Responsive Grid Layout */}
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Left Sidebar Navigation */}
        <Sidebar />

        {/* Central Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation Bar */}
          <Navbar
            onOpenDrawer={() => setDrawerOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
          />

          {/* Central Route Feed */}
          <main className="flex-1 flex flex-col lg:flex-row">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/match/:id" element={<MatchPage />} />
              <Route path="/live" element={<LivePage />} />
              <Route path="/fixtures" element={<FixturesPage />} />
              <Route path="/competitions" element={<CompetitionsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>

            {/* Desktop Right Side Panel (On Home Feed) */}
            {isHome && <DesktopRightPanel />}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
