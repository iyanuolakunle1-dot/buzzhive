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
    try {
      const [reqRes, followingRes, sugRes] = await Promise.allSettled([
        api.get('/users/me/follow-requests'),
        api.get('/users/me/following'),
        api.get('/users/me/suggestions'),
      ]);

      if (reqRes.status === 'fulfilled') {
        const payload = reqRes.value?.data?.requests ?? [];
        setRequests(Array.isArray(payload) ? payload : []);
      } else {
        setRequests([]);
      }

      if (followingRes.status === 'fulfilled') {
        const payload = followingRes.value?.data?.following ?? [];
        setFollowing(Array.isArray(payload) ? payload : []);
      } else {
        setFollowing([]);
      }

      if (sugRes.status === 'fulfilled') {
        const payload = sugRes.value?.data?.users ?? [];
        setSuggestions(Array.isArray(payload) ? payload : []);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      setRequests([]);
      setFollowing([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  async function acceptRequest(id) {
    try {
      await api.put(`/users/follow-requests/${id}/accept`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      await loadAll();
      showToast('Friend request accepted', 'success', 2000);
    } catch (err) {
      showToast('Could not accept request', 'error');
    }
  }

  async function declineRequest(id) {
    try {
      await api.delete(`/users/follow-requests/${id}`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      await loadAll();
      showToast('Request declined', 'info', 2000);
    } catch (err) {
      showToast('Could not decline request', 'error');
    }
  }

  async function follow(userId) {
    try {
      await api.post(`/users/${userId}/follow`);
      setFollowedIds((prev) => new Set(prev).add(userId));
      await loadAll();
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
          {requests.map((r) => {
            const follower = r?.follower ?? {};
            const name = follower.name || 'Unknown user';
            const username = follower.username || 'unknown';
            const avatar = follower.avatar || null;
            return (
              <div key={r.id} className="flex items-center gap-3 p-3">
                <Link to={`/profile/${username}`} className="w-10 h-10 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : name[0] || 'U'}
                </Link>
                <Link to={`/profile/${username}`} className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
                  <p className="text-xs text-gray-500">@{username}</p>
                </Link>
                <button onClick={() => acceptRequest(r.id)} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-hive-yellow text-black">Confirm</button>
                <button onClick={() => declineRequest(r.id)} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">Delete</button>
              </div>
            );
          })}
        </div>
      )}

      {!loading && tab === 'following' && (
        <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl divide-y divide-gray-100 dark:divide-hive-border">
          {following.length === 0 && <p className="p-6 text-center text-sm text-gray-500">You're not following anyone yet.</p>}
          {following.map((u) => {
            const name = u?.name || 'Unknown user';
            const username = u?.username || 'unknown';
            const avatar = u?.avatar || null;
            return (
              <Link key={u.id} to={`/profile/${username}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5">
                <div className="w-10 h-10 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : (name[0] || 'U')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                  <p className="text-xs text-gray-500">@{username}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && tab === 'suggestions' && (
        <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl divide-y divide-gray-100 dark:divide-hive-border">
          {suggestions.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No suggestions right now.</p>}
          {suggestions.map((u) => {
            const name = u?.name || 'Unknown user';
            const username = u?.username || 'unknown';
            const avatar = u?.avatar || null;
            return (
              <div key={u.id} className="flex items-center gap-3 p-3">
                <Link to={`/profile/${username}`} className="w-10 h-10 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : (name[0] || 'U')}
                </Link>
                <Link to={`/profile/${username}`} className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
                  <p className="text-xs text-gray-500">@{username}{u?.followsMe ? <span className="text-hive-yellow"> · Follows you</span> : null}</p>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
