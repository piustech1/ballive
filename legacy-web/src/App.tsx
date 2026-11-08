import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faBell,
  faUser,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { SearchModal } from './components/layout/SearchModal';
import { NavigationDrawer } from './components/layout/NavigationDrawer';
import { Toast } from './components/common/Toast';
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { toastMessage, reminders } = useReminders();

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white flex flex-col font-sans antialiased">
      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Navigation Drawer */}
      <NavigationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Global In-App Notification Toast */}
      <Toast message={toastMessage} />

      {/* ── FLOATING TOP APP BAR (CURVED EDGES, SOLID FILL, NO OUTLINES) ── */}
      <header className="sticky top-3 z-50 px-4 sm:px-6 w-full max-w-2xl mx-auto">
        <div className="h-14 px-4 rounded-2xl bg-[#141824] shadow-xl flex items-center justify-between">
          {/* Left-aligned App Branding */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus:outline-none group active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-[11px] font-black tracking-widest text-white">S2</span>
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="text-lg font-black text-white font-display">SPORT</span>
              <span className="text-lg font-black text-sport-coral font-display">2</span>
            </div>
          </Link>

          {/* Right Action Icons: Search, Notifications, Profile (Font Awesome, No Outlines) */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 text-white transition-all focus:outline-none"
              aria-label="Search"
              title="Search"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs" />
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(prev => !prev)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 focus:outline-none ${
                  notificationsOpen
                    ? 'bg-white/25 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                aria-label="Notifications"
                title="Notifications"
              >
                <FontAwesomeIcon icon={faBell} className="text-xs" />
                {reminders.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sport-coral animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown (Solid Fill, No Outlines) */}
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#1A1F2C] shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Match Alerts
                      </span>
                      <span className="text-[11px] font-medium text-white/50">
                        {reminders.length} active
                      </span>
                    </div>

                    {reminders.length === 0 ? (
                      <p className="text-xs text-white/50 py-4 text-center">
                        No active match reminders. Tap the bell icon next to any fixture.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-none">
                        {reminders.map(r => (
                          <div
                            key={r.matchId}
                            className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-white truncate">
                                {r.matchTitle}
                              </p>
                              <p className="text-[10px] text-white/50 truncate">
                                {r.competitionName}
                              </p>
                            </div>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[10px] text-emerald-400 shrink-0"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Profile Button */}
            <Link
              to="/favorites"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 text-white transition-all focus:outline-none"
              aria-label="Profile"
              title="Profile & Favorites"
            >
              <FontAwesomeIcon icon={faUser} className="text-xs" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 max-w-2xl w-full mx-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/match/:id" element={<MatchPage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
          <Route path="/competitions" element={<CompetitionsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
