import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Check } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function Friends() {
  const { showToast } = useToast();
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [followedIds, setFollowedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [reqRes, followingRes, sugRes] = await Promise.allSettled([
      api.get('/users/me/follow-requests'),
      api.get('/users/me/following'),
      api.get('/users/me/suggestions'),
    ]);
    if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data.requests);
    if (followingRes.status === 'fulfilled') setFollowing(followingRes.value.data.following);
    if (sugRes.status === 'fulfilled') setSuggestions(sugRes.value.data.users);
    setLoading(false);
  }

  async function acceptRequest(id) {
    try {
      await api.put(`/users/follow-requests/${id}/accept`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      showToast('Friend request accepted', 'success', 2000);
    } catch (err) {
      showToast('Could not accept request', 'error');
    }
  }

  async function declineRequest(id) {
    try {
      await api.delete(`/users/follow-requests/${id}`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      showToast('Request declined', 'info', 2000);
    } catch (err) {
      showToast('Could not decline request', 'error');
    }
  }

  async function follow(userId) {
    try {
      await api.post(`/users/${userId}/follow`);
      setFollowedIds((prev) => new Set(prev).add(userId));
      showToast('Friend request sent', 'success', 2000);
    } catch (err) {
      showToast('Could not send request', 'error');
    }
  }

  const tabs = [
    { id: 'requests', label: `Requests (${requests.length})` },
    { id: 'following', label: `Following (${following.length})` },
    { id: 'suggestions', label: 'Suggestions' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Friends</h1>

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-hive-yellow text-black' : 'bg-white dark:bg-hive-panel text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-hive-border'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-hive-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && tab === 'requests' && (
        <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl divide-y divide-gray-100 dark:divide-hive-border">
          {requests.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No pending friend requests.</p>}
          {requests.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3">
              <Link to={`/profile/${r.follower.username}`} className="w-10 h-10 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
                {r.follower.avatar ? <img src={r.follower.avatar} className="w-full h-full object-cover" alt="" /> : r.follower.name[0]}
              </Link>
              <Link to={`/profile/${r.follower.username}`} className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.follower.name}</p>
                <p className="text-xs text-gray-500">@{r.follower.username}</p>
              </Link>
              <button onClick={() => acceptRequest(r.id)} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-hive-yellow text-black">Confirm</button>
              <button onClick={() => declineRequest(r.id)} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">Delete</button>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'following' && (
        <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl divide-y divide-gray-100 dark:divide-hive-border">
          {following.length === 0 && <p className="p-6 text-center text-sm text-gray-500">You're not following anyone yet.</p>}
          {following.map((u) => (
            <Link key={u.id} to={`/profile/${u.username}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5">
              <div className="w-10 h-10 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : u.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</p>
                <p className="text-xs text-gray-500">@{u.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && tab === 'suggestions' && (
        <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl divide-y divide-gray-100 dark:divide-hive-border">
          {suggestions.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No suggestions right now.</p>}
          {suggestions.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3">
              <Link to={`/profile/${u.username}`} className="w-10 h-10 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : u.name[0]}
              </Link>
              <Link to={`/profile/${u.username}`} className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                <p className="text-xs text-gray-500">@{u.username}{u.followsMe && <span className="text-hive-yellow"> · Follows you</span>}</p>
              </Link>
              <button
                onClick={() => follow(u.id)}
                disabled={followedIds.has(u.id)}
                title={followedIds.has(u.id) ? 'Request sent' : 'Add Friend'}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-hive-yellow text-black disabled:opacity-50"
              >
                {followedIds.has(u.id) ? <Check size={14} /> : <UserPlus size={14} />}
                {followedIds.has(u.id) ? 'Requested' : 'Add Friend'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
