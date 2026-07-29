import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import Toast from './components/ui/Toast';
import ExplorePage from './pages/ExplorePage';
import PackageDetailPage from './pages/PackageDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import InstallAppButton from './components/ui/InstallAppButton';
import ScrollToTop from './components/layout/ScrollToTop';

// Explore and package pages are the two organic-search landing points, so they
// stay in the main bundle. Everything below is account-only and noindexed —
// splitting it keeps the first paint on a search landing as small as possible.
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const InboxPage = lazy(() => import('./pages/InboxPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function RouteFallback() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-20">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded-full bg-soft" />
        <div className="h-40 rounded-3xl bg-soft" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />

      <main className="flex-1 pb-24 md:pb-0">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/"            element={<ExplorePage />} />
            <Route path="/package/:id" element={<PackageDetailPage />} />
            <Route path="/wishlist"    element={<WishlistPage />} />
            <Route path="/trips"       element={<TripsPage />} />
            <Route path="/contact"     element={<InboxPage />} />
            {/* Former URL for the contact page — kept so old links resolve. */}
            <Route path="/inbox"       element={<Navigate to="/contact" replace />} />
            <Route path="/profile"     element={<ProfilePage />} />
            <Route path="/admin"       element={<AdminPage />} />
            <Route path="*"            element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <MobileNav />
      <Toast />
      <InstallAppButton />
    </div>
  );
}
