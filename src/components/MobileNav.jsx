import { NavLink } from 'react-router-dom';
import { Home, Compass, Users, MessageSquare, Bell } from 'lucide-react';

const items = [
  { to: '/', icon: Home, end: true },
  { to: '/explore', icon: Compass },
  { to: '/friends', icon: Users },
  { to: '/messages', icon: MessageSquare },
  { to: '/notifications', icon: Bell },
];

export default function MobileNav() {
  const cls = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 py-2 ${
      isActive ? 'text-hive-yellow' : 'text-gray-500 dark:text-gray-400'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-hive-panel border-t border-gray-200 dark:border-hive-border flex items-center px-1">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={cls}>
          <item.icon size={22} />
        </NavLink>
      ))}
    </nav>
  );
}
