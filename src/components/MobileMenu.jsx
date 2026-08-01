import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, User, Users, Bookmark, Settings, Shield, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

export default function MobileMenu({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
      isActive ? 'bg-hive-yellow text-black' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
    }`;

  // Rendered via a portal straight to <body>, NOT inline inside Navbar.
  // Navbar has `backdrop-blur`, and any CSS filter/backdrop-filter on an
  // ancestor creates a new containing block for `position: fixed`
  // descendants — so without the portal, this drawer's "fixed inset-0"
  // would be constrained to the Navbar's own small height instead of the
  // full screen (exactly the squished-at-the-top bug this fixes).
  return createPortal(
    <div className="md:hidden fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-72 max-w-[80%] h-full bg-white dark:bg-hive-panel border-l border-gray-200 dark:border-hive-border p-4 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-extrabold text-gray-900 dark:text-white">
            Buzz<span className="text-hive-yellow">Hive</span>
          </span>
          <button onClick={onClose}><X size={22} className="text-gray-500" /></button>
        </div>

        <nav className="flex flex-col gap-1" onClick={onClose}>
          <NavLink to={`/profile/${user?.username}`} className={linkClasses}>
            <User size={20} /> Profile
          </NavLink>
          <NavLink to="/friends" className={linkClasses}>
            <Users size={20} /> Friends
          </NavLink>
          <NavLink to="/bookmarks" className={linkClasses}>
            <Bookmark size={20} /> Bookmarks
          </NavLink>
          <NavLink to="/settings" className={linkClasses}>
            <Settings size={20} /> Settings
          </NavLink>
          {user?.isAdmin && (
            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <Shield size={20} /> Admin Console
              <ExternalLink size={13} className="ml-auto text-gray-400" />
            </a>
          )}
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-hive-border">
          <button
            onClick={() => { onClose(); logout(); navigate('/login'); }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
