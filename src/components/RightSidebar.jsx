import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Check } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function RightSidebar() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [tags, setTags] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [followedIds, setFollowedIds] = useState(new Set());

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [reqRes, tagsRes, sugRes] = await Promise.allSettled([
      api.get('/users/me/follow-requests'),
      api.get('/posts/trending-tags'),
      api.get('/users/me/suggestions'),
    ]);
    if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data.requests);
    if (tagsRes.status === 'fulfilled') setTags(tagsRes.value.data.tags);
    if (sugRes.status === 'fulfilled') setSuggestions(sugRes.value.data.users);
  }

  async function acceptRequest(id) {
    try {
      await api.put(`/users/follow-requests/${id}/accept`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      showToast('Friend request accepted', 'success', 2000);
    } catch {
      showToast('Could not accept request', 'error');
    }
  }

  async function declineRequest(id) {
    try {
      await api.delete(`/users/follow-requests/${id}`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      showToast('Could not decline request', 'error');
    }
  }

  async function follow(userId) {
    try {
      await api.post(`/users/${userId}/follow`);
      setFollowedIds((prev) => new Set(prev).add(userId));
      showToast('Friend request sent', 'success', 2000);
    } catch {
      showToast('Could not send request', 'error');
    }
  }

  return (
    <aside className="hidden lg:block w-80 shrink-0 px-4 py-5 space-y-4">
      <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Friend Requests</h3>
        {requests.length === 0 && <p className="text-xs text-gray-400">No pending requests.</p>}
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-hive-yellow/20 flex items-center justify-center text-xs font-bold text-hive-yellow overflow-hidden shrink-0">
                {r.follower.avatar ? <img src={r.follower.avatar} className="w-full h-full object-cover" alt="" /> : r.follower.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.follower.name}</p>
              </div>
              <button onClick={() => acceptRequest(r.id)} className="text-xs font-semibold px-2.5 py-1 rounded-md bg-hive-yellow text-black">Confirm</button>
              <button onClick={() => declineRequest(r.id)} className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">Delete</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Trending Tags</h3>
        {tags.length === 0 && <p className="text-xs text-gray-400">No tags yet — use #hashtags in your posts!</p>}
        <div className="space-y-2.5">
          {tags.map((t) => (
            <div key={t.tag} className="flex items-center justify-between text-sm">
              <Link to={`/explore?q=${encodeURIComponent(t.tag)}`} className="text-gray-700 dark:text-gray-200 hover:text-hive-yellow">{t.tag}</Link>
              <span className="text-xs text-gray-400">{t.count} posts</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Suggested Friends</h3>
        {suggestions.length === 0 && <p className="text-xs text-gray-400">No suggestions right now.</p>}
        <div className="space-y-3">
          {suggestions.map((u) => (
            <div key={u.id} className="flex items-center gap-2">
              <Link to={`/profile/${u.username}`} className="w-9 h-9 rounded-full bg-hive-yellow/20 flex items-center justify-center text-xs font-bold text-hive-yellow overflow-hidden shrink-0">
                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : u.name[0]}
              </Link>
              <Link to={`/profile/${u.username}`} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                {u.followsMe && <p className="text-[11px] text-hive-yellow">Follows you</p>}
              </Link>
              <button
                onClick={() => follow(u.id)}
                disabled={followedIds.has(u.id)}
                title={followedIds.has(u.id) ? 'Request sent' : 'Add Friend'}
                className="w-7 h-7 rounded-full bg-hive-yellow text-black flex items-center justify-center disabled:opacity-50 shrink-0"
              >
                {followedIds.has(u.id) ? <Check size={14} /> : <UserPlus size={14} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
