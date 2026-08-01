import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  const units = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60]];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label}`;
  }
  return 'just now';
}

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/posts/${id}/comments`),
      ]);
      setPost(postRes.data.post);
      setComments(commentsRes.data.comments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(`/posts/${id}/comments`, { content: text });
      setComments((prev) => [...prev, res.data.comment]);
      setText('');
    } catch (err) {
      showToast('Could not post comment', 'error');
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-hive-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <div className="text-center py-16 text-gray-500">Post not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-hive-yellow mb-3">
        <ArrowLeft size={16} /> Back
      </button>

      <PostCard post={post} onDeleted={() => navigate('/')} />

      <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Comments ({comments.length})</h2>

        <form onSubmit={handleComment} className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-hive-yellow/20 flex items-center justify-center text-xs font-bold text-hive-yellow shrink-0 overflow-hidden">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : user?.name?.[0]?.toUpperCase()}
          </div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full px-4 py-2 text-sm outline-none text-gray-800 dark:text-gray-100"
          />
          <button type="submit" disabled={!text.trim() || posting} className="p-2 rounded-full bg-hive-yellow text-black disabled:opacity-50">
            <Send size={16} />
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No comments yet. Be the first to reply.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-hive-yellow/20 flex items-center justify-center text-xs font-bold text-hive-yellow shrink-0 overflow-hidden">
                  {c.author.avatar ? <img src={c.author.avatar} className="w-full h-full object-cover" alt="" /> : c.author.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.author.name}</p>
                    <p className="text-xs text-gray-500">{timeAgo(c.createdAt)}</p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
