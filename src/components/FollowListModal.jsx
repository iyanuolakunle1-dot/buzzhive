import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../api/axios';

export default function FollowListModal({ username, initialTab = 'followers', onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/users/${username}/${tab}`)
      .then((res) => setUsers(res.data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [tab, username]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl w-full max-w-sm max-h-[75vh] flex flex-col shadow-xl"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex gap-4">
            <button
              onClick={() => setTab('followers')}
              className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${tab === 'followers' ? 'text-hive-yellow border-hive-yellow' : 'text-gray-500 border-transparent'}`}
            >
              Followers
            </button>
            <button
              onClick={() => setTab('following')}
              className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${tab === 'following' ? 'text-hive-yellow border-hive-yellow' : 'text-gray-500 border-transparent'}`}
            >
              Following
            </button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-thin flex-1 px-2 pb-3">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-hive-yellow border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && users.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-10">
              {tab === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
            </p>
          )}

          {!loading &&
            users.map((u) => (
              <Link
                key={u.id}
                to={`/profile/${u.username}`}
                onClick={onClose}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <div className="w-10 h-10 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
                  {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : u.name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-500">@{u.username}</p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
