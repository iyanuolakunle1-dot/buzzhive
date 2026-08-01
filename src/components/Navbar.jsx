import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-4 md:px-6 py-3 bg-white/95 dark:bg-hive-panel/95 backdrop-blur border-b border-gray-200 dark:border-hive-border">
      <div className="md:hidden flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-hive-yellow flex items-center justify-center font-black text-black">B</div>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-full px-4 py-2">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, people, #tags..."
            className="bg-transparent outline-none text-sm w-full text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
          />
        </div>
      </form>

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <button
          onClick={() => navigate('/messages')}
          className="hidden md:inline-flex p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <MessageCircle size={19} />
        </button>
        <button
          onClick={() => navigate('/notifications')}
          className="hidden md:inline-flex p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <Bell size={19} />
        </button>
        <div
          onClick={() => navigate(`/profile/${user?.username}`)}
          className="hidden md:flex w-9 h-9 rounded-full bg-hive-yellow/20 items-center justify-center text-sm font-bold text-hive-yellow cursor-pointer overflow-hidden"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user?.name?.[0]?.toUpperCase()
          )}
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
