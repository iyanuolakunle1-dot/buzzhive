import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-hive-dark">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
