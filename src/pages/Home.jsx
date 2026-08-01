import { useCallback, useEffect, useRef, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import StoryBar from '../components/StoryBar';
import RightSidebar from '../components/RightSidebar';
import api from '../api/axios';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const PAGE_SIZE = 10;

export default function Home() {
  const online = useOnlineStatus();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const sentinelRef = useRef(null);
  const loadingRef = useRef(false); // guards against duplicate concurrent fetches

  const loadPage = useCallback(async (pageToLoad) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setError('');
    if (pageToLoad === 1) setInitialLoading(true);
    else setLoadingMore(true);

    try {
      const res = await api.get(`/posts?page=${pageToLoad}&limit=${PAGE_SIZE}`);
      const newPosts = res.data.posts;

      setPosts((prev) => (pageToLoad === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(newPosts.length === PAGE_SIZE);
      setPage(pageToLoad);
    } catch (err) {
      setError(
        !navigator.onLine
          ? "You're offline — check your connection and try again."
          : 'Could not load the feed. The server might be slow or unreachable.'
      );
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  // Infinite scroll: watch a sentinel div near the bottom of the feed and
  // load the next page automatically when it comes into view.
  useEffect(() => {
    if (!sentinelRef.current || initialLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current && online) {
          loadPage(page + 1);
        }
      },
      { rootMargin: '400px' } // start loading before the user actually hits bottom
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, initialLoading, online, loadPage]);

  function handleCreated(post) {
    setPosts((prev) => [post, ...prev]);
  }

  function handleDeleted(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      <div className="flex-1 min-w-0 px-4 py-5">
        {!online && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm rounded-xl px-4 py-2.5 mb-4">
            <WifiOff size={16} className="shrink-0" />
            You're offline. New posts and actions will resume once you're back online.
          </div>
        )}

        <StoryBar />
        <CreatePost onCreated={handleCreated} />

        {initialLoading && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}

        {!initialLoading && error && posts.length === 0 && (
          <div className="text-center py-14">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button
              onClick={() => loadPage(1)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-hive-yellow text-black"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}

        {!initialLoading && !error && posts.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="font-semibold text-lg text-gray-700 dark:text-gray-300">No posts yet</p>
            <p className="text-sm mt-1">Be the first to share something with the hive 🐝</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDeleted={handleDeleted} />
        ))}

        {loadingMore && <PostSkeleton />}

        {!initialLoading && error && posts.length > 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-red-500 mb-2">{error}</p>
            <button onClick={() => loadPage(page)} className="text-xs font-semibold text-hive-yellow">
              Retry
            </button>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-gray-400 py-6">You're all caught up 🐝</p>
        )}

        {/* Sentinel for infinite scroll — kept in the DOM even while empty/loading so the observer has something to watch */}
        <div ref={sentinelRef} className="h-1" />
      </div>
      <RightSidebar />
    </div>
  );
}
