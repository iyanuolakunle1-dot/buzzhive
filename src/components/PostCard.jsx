import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  const units = [
    ['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60],
  ];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label}`;
  }
  return 'just now';
}

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount] = useState(post.commentCount);
  const [bookmarked, setBookmarked] = useState(post.bookmarkedByMe || false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleBookmark() {
    try {
      const res = await api.post(`/bookmarks/${post.id}`);
      setBookmarked(res.data.bookmarked);
      showToast(res.data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks', 'success', 2000);
    } catch (err) {
      showToast('Could not update bookmark', 'error');
    }
  }

  async function handleLike() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.post(`/posts/${post.id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (err) {
      showToast('Could not update like', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'BuzzHive post', url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard', 'success', 2000);
      }
    } catch {
      // user cancelled share sheet — no-op
    }
  }

  async function handleDelete() {
    setConfirmOpen(false);
    try {
      await api.delete(`/posts/${post.id}`);
      showToast('Post deleted', 'success', 2000);
      onDeleted?.(post.id);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete post', 'error');
    }
  }

  const canDelete = user && (user.id === post.author.id || user.isAdmin);

  return (
    <article className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-4 mb-4">
      <div className="flex items-start justify-between">
        <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
            ) : (
              post.author.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white leading-tight truncate">{post.author.name}</p>
            <p className="text-xs text-gray-500 truncate">@{post.author.username} · {timeAgo(post.createdAt)}</p>
          </div>
        </Link>

        {canDelete && (
          <div className="relative shrink-0">
            <button onClick={() => setShowMenu((s) => !s)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-lg shadow-lg overflow-hidden z-10">
                <button
                  onClick={() => { setShowMenu(false); setConfirmOpen(true); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">{post.content}</p>

      {post.image && (
        <img
          src={post.image}
          alt="post"
          loading="lazy"
          decoding="async"
          className="mt-3 rounded-xl w-full max-h-[420px] object-cover bg-gray-100 dark:bg-white/5"
        />
      )}

      <div className="flex items-center gap-4 sm:gap-5 mt-4 pt-3 border-t border-gray-100 dark:border-hive-border text-sm">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {likeCount}
        </button>
        <Link to={`/post/${post.id}`} className="flex items-center gap-1.5 text-gray-500 hover:text-hive-yellow transition-colors">
          <MessageCircle size={18} /> {commentCount}
        </Link>
        <button onClick={handleShare} className="flex items-center gap-1.5 text-gray-500 hover:text-hive-yellow transition-colors">
          <Share2 size={18} /> <span className="hidden sm:inline">Share</span>
        </button>
        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1.5 transition-colors ml-auto ${bookmarked ? 'text-hive-yellow' : 'text-gray-500 hover:text-hive-yellow'}`}
        >
          <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete this post?"
        message="This can't be undone. The post and its comments/likes will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  );
}
