import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../api/axios';
import PostCard from '../components/PostCard';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.get('/posts/trending-tags').then((res) => setTags(res.data.tags)).catch(() => {});
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      runSearch(q);
    } else {
      loadFeed();
    }
  }, [searchParams]);

  async function loadFeed() {
    setLoading(true);
    setSearched(false);
    try {
      const res = await api.get('/posts');
      setPosts(res.data.posts);
    } finally {
      setLoading(false);
    }
  }

  async function runSearch(q) {
    setLoading(true);
    setSearched(true);
    try {
      const cleanQuery = q.replace(/^#/, '');
      const [usersRes, postsRes] = await Promise.all([
        api.get(`/users/search?q=${encodeURIComponent(cleanQuery)}`),
        api.get('/posts'),
      ]);
      setUsers(usersRes.data.users);
      const lower = q.toLowerCase();
      setPosts(postsRes.data.posts.filter((p) => p.content.toLowerCase().includes(lower)));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
    else setSearchParams({});
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="flex items-center gap-2 bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-full px-4 py-2.5">
          <Search size={18} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, people, #tags..."
            className="bg-transparent outline-none text-sm w-full text-gray-800 dark:text-gray-100"
          />
        </div>
      </form>

      {!searched && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((t) => (
            <button
              key={t.tag}
              onClick={() => setSearchParams({ q: t.tag })}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border text-gray-600 dark:text-gray-300 hover:border-hive-yellow hover:text-hive-yellow"
            >
              {t.tag} <span className="text-gray-400">· {t.count}</span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-hive-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && searched && users.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">People</h3>
          <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl divide-y divide-gray-100 dark:divide-hive-border">
            {users.map((u) => (
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
        </div>
      )}

      {!loading && (
        <div>
          {searched && <h3 className="text-sm font-semibold text-gray-500 mb-2">Posts</h3>}
          {posts.length === 0 && (
            <div className="text-center py-14 text-gray-500 text-sm">
              {searched ? 'No results found.' : 'No posts to explore yet.'}
            </div>
          )}
          {posts.map((p) => <PostCard key={p.id} post={p} onDeleted={() => setPosts((prev) => prev.filter((x) => x.id !== p.id))} />)}
        </div>
      )}
    </div>
  );
}
