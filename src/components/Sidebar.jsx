import { NavLink } from 'react-router-dom';
import {
  Home, Compass, Users, MessageSquare, Bell, Bookmark, User, Settings, LogOut, Shield, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
      isActive
        ? 'bg-hive-yellow text-black'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
    }`;

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-gray-200 dark:border-hive-border bg-white dark:bg-hive-panel px-3 py-5">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-9 h-9 rounded-lg bg-hive-yellow flex items-center justify-center font-black text-black">B</div>
        <span className="text-xl font-extrabold text-gray-900 dark:text-white">
          Buzz<span className="text-hive-yellow">Hive</span>
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClasses} end={item.to === '/'}>
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}

        <NavLink to={`/profile/${user?.username}`} className={linkClasses}>
          <User size={20} /> Profile
        </NavLink>
        <NavLink to="/settings" className={linkClasses}>
          <Settings size={20} /> Settings
        </NavLink>
        {user?.isAdmin && (
          <a
            href={ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <Shield size={20} /> Admin Console
            <ExternalLink size={13} className="ml-auto text-gray-400" />
          </a>
        )}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-hive-border">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-full bg-hive-yellow/20 flex items-center justify-center text-sm font-bold text-hive-yellow shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
            </div>
          </div>
          <button onClick={logout} title="Logout" className="p-2 text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
