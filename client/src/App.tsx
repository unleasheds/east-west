import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import Toast from './components/ui/Toast';
import ExplorePage from './pages/ExplorePage';
import PackageDetailPage from './pages/PackageDetailPage';
import WishlistPage from './pages/WishlistPage';
import TripsPage from './pages/TripsPage';
import InboxPage from './pages/InboxPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pb-24 md:pb-0">
        <Routes>
          <Route path="/"            element={<ExplorePage />} />
          <Route path="/package/:id" element={<PackageDetailPage />} />
          <Route path="/wishlist"    element={<WishlistPage />} />
          <Route path="/trips"       element={<TripsPage />} />
          <Route path="/inbox"       element={<InboxPage />} />
          <Route path="/profile"     element={<ProfilePage />} />
          <Route path="/admin"       element={<AdminPage />} />
        </Routes>
      </main>

      <Footer />
      <MobileNav />
      <Toast />
    </div>
  );
}
