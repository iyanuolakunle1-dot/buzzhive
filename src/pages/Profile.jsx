import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, MessageCircle, Camera, Loader2 } from 'lucide-react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { uploadImage } from '../api/cloudinary';
import ImageLightbox from '../components/ImageLightbox';
import FollowListModal from '../components/FollowListModal';

export default function Profile() {
  const { username } = useParams();
  const { user: me, setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followStatus, setFollowStatus] = useState('NONE'); // NONE | PENDING | ACCEPTED | FRIENDS
  const [followBusy, setFollowBusy] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [followListTab, setFollowListTab] = useState(null); // null | 'followers' | 'following'
  const avatarInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get(`/users/${username}`)
      .then((res) => {
        setData(res.data);
        setFollowStatus(res.data.followStatus || 'NONE');
      })
      .catch(() => setError('User not found'))
      .finally(() => setLoading(false));
  }, [username]);

  async function handleAvatarFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error');
      return;
    }

    setAvatarUploading(true);
    try {
      const url = await uploadImage(file, 'avatars');
      const res = await api.put('/users/me', { avatar: url });
      setUser(res.data.user);
      localStorage.setItem('buzzhive_user', JSON.stringify(res.data.user));
      setData((prev) => ({ ...prev, user: { ...prev.user, avatar: url } }));
      showToast('Profile picture updated', 'success', 2000);
    } catch (err) {
      showToast(err.message || err.response?.data?.message || 'Failed to update profile picture', 'error');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  }

  async function handleFollow() {
    if (!data || followBusy) return;
    setFollowBusy(true);
    try {
      const res = await api.post(`/users/${data.user.id}/follow`);
      if (res.data.status === 'REMOVED') {
        setFollowStatus('NONE');
        showToast(followStatus === 'ACCEPTED' ? 'Unfollowed' : 'Follow request cancelled', 'info', 2000);
      } else {
        setFollowStatus(res.data.status);
        showToast('Friend request sent', 'success', 2000);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update follow status', 'error');
    } finally {
      setFollowBusy(false);
    }
  }

  function handleDeleted(id) {
    setData((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== id) }));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-hive-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-center py-16 text-gray-500">{error || 'User not found'}</div>;
  }

  const { user, posts } = data;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl overflow-hidden mb-4">
        <div className="h-32 bg-gradient-to-r from-hive-yellow/40 to-hive-yellow/10">
          {user.coverPhoto && <img src={user.coverPhoto} loading="lazy" className="w-full h-full object-cover" alt="cover" />}
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between">
            <div className="relative -mt-10">
              <button
                type="button"
                onClick={() => user.avatar && setShowLightbox(true)}
                className="w-20 h-20 rounded-full border-4 border-white dark:border-hive-panel bg-hive-yellow/20 flex items-center justify-center text-2xl font-bold text-hive-yellow overflow-hidden"
              >
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} /> : user.name?.[0]?.toUpperCase()}
              </button>
              {me?.username === user.username && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }}
                    disabled={avatarUploading}
                    title="Change profile picture"
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-hive-yellow text-black flex items-center justify-center border-2 border-white dark:border-hive-panel disabled:opacity-60"
                  >
                    {avatarUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                </>
              )}
            </div>
            {me && me.username !== user.username && (
              <div className="flex gap-2">
                <button
                  onClick={handleFollow}
                  disabled={followBusy}
                  className={`text-sm font-semibold px-4 py-1.5 rounded-lg disabled:opacity-50 ${
                    followStatus === 'NONE' ? 'bg-hive-yellow text-black' :
                    followStatus === 'PENDING' ? 'border border-gray-200 dark:border-hive-border text-gray-700 dark:text-gray-200' :
                    'border border-gray-200 dark:border-hive-border text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {followStatus === 'ACCEPTED' ? 'Friends ✓' : followStatus === 'PENDING' ? 'Requested' : 'Add Friend'}
                </button>
                {followStatus === 'ACCEPTED' && (
                  <button
                    onClick={() => navigate(`/messages?to=${user.id}&username=${user.username}`)}
                    className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-hive-yellow text-black flex items-center gap-1.5"
                  >
                    <MessageCircle size={15} /> Message
                  </button>
                )}
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-3">{user.name}</h1>
          <p className="text-sm text-gray-500">@{user.username}</p>
          {user.bio && <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">{user.bio}</p>}

          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            {user.location && <span className="flex items-center gap-1"><MapPin size={13} /> {user.location}</span>}
            <span className="flex items-center gap-1"><Calendar size={13} /> Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
          </div>

          <div className="flex gap-5 mt-4 text-sm">
            <span><b className="text-gray-900 dark:text-white">{user.postCount}</b> <span className="text-gray-500">Posts</span></span>
            <button onClick={() => setFollowListTab('followers')} className="hover:underline">
              <b className="text-gray-900 dark:text-white">{user.followerCount}</b> <span className="text-gray-500">Followers</span>
            </button>
            <button onClick={() => setFollowListTab('following')} className="hover:underline">
              <b className="text-gray-900 dark:text-white">{user.followingCount}</b> <span className="text-gray-500">Following</span>
            </button>
          </div>
        </div>
      </div>

      {showLightbox && <ImageLightbox src={user.avatar} alt={user.name} onClose={() => setShowLightbox(false)} />}
      {followListTab && (
        <FollowListModal username={user.username} initialTab={followListTab} onClose={() => setFollowListTab(null)} />
      )}

      {posts.length === 0 ? (
        <div className="text-center py-14 text-gray-500 text-sm">No posts yet.</div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={{ ...post, author: user, likedByMe: false }} onDeleted={handleDeleted} />)
      )}
    </div>
  );
}
