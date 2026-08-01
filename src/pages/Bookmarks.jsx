import { useEffect, useState } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';

export default function Bookmarks() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/bookmarks');
      setPosts(res.data.posts.map((p) => ({ ...p, bookmarkedByMe: true })));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Bookmarks</h1>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-hive-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16 text-gray-500 text-sm">
          Nothing saved yet. Tap the bookmark icon on any post to save it here.
        </div>
      )}

      {posts.map((p) => (
        <PostCard key={p.id} post={p} onDeleted={() => setPosts((prev) => prev.filter((x) => x.id !== p.id))} />
      ))}
    </div>
  );
}
