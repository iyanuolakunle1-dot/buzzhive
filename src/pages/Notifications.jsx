import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import api from '../api/axios';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  const units = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60]];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label} ago`;
  }
  return 'just now';
}

const iconMap = {
  LIKE: { icon: Heart, color: 'text-red-500' },
  COMMENT: { icon: MessageCircle, color: 'text-blue-500' },
  FOLLOW_REQUEST: { icon: UserPlus, color: 'text-hive-yellow' },
  FOLLOW_ACCEPTED: { icon: UserCheck, color: 'text-green-500' },
};

function messageFor(n) {
  switch (n.type) {
    case 'LIKE': return 'liked your post.';
    case 'COMMENT': return 'commented on your post.';
    case 'FOLLOW_REQUEST': return 'sent you a friend request.';
    case 'FOLLOW_ACCEPTED': return 'accepted your friend request.';
    default: return 'interacted with your content.';
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button onClick={markAllRead} className="text-xs font-semibold text-hive-yellow">Mark all as read</button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-hive-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-16 text-gray-500 text-sm">No notifications yet.</div>
      )}

      <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl divide-y divide-gray-100 dark:divide-hive-border">
        {notifications.map((n) => {
          const meta = iconMap[n.type] || iconMap.LIKE;
          const Icon = meta.icon;
          const content = (
            <div className={`flex items-start gap-3 p-3.5 ${!n.read ? 'bg-hive-yellow/5' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
                {n.sender.avatar ? <img src={n.sender.avatar} className="w-full h-full object-cover" alt="" /> : n.sender.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-100">
                  <span className="font-semibold">{n.sender.name}</span> {messageFor(n)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{timeAgo(n.createdAt)}</p>
              </div>
              <Icon size={16} className={`${meta.color} shrink-0 mt-1`} />
            </div>
          );

          return n.postId ? (
            <Link key={n.id} to={`/post/${n.postId}`}>{content}</Link>
          ) : (
            <Link key={n.id} to={`/profile/${n.sender.username}`}>{content}</Link>
          );
        })}
      </div>
    </div>
  );
}
