import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ImageUpload from './ImageUpload';

export default function StoryBar() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [viewing, setViewing] = useState(null); // group being viewed
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    try {
      const res = await api.get('/stories');
      setGroups(res.data.groups);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddStory(e) {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setError('');
    setSaving(true);
    try {
      await api.post('/stories', { image: imageUrl.trim() });
      setImageUrl('');
      setShowAdd(false);
      showToast('Story shared — visible for 24 hours', 'success', 2500);
      loadStories();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add story';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }

  const myGroup = groups.find((g) => g.user.id === user?.id);
  const otherGroups = groups.filter((g) => g.user.id !== user?.id);

  return (
    <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-4 mb-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Stories</h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-1">
        <button onClick={() => setShowAdd(true)} className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="relative w-16 h-16 rounded-full ring-2 ring-hive-yellow p-0.5">
            <div className="w-full h-full rounded-full bg-hive-yellow/20 flex items-center justify-center text-lg font-bold text-hive-yellow overflow-hidden">
              {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-hive-yellow rounded-full flex items-center justify-center border-2 border-white dark:border-hive-panel">
              <Plus size={12} className="text-black" />
            </div>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-300">Your Story</span>
        </button>

        {myGroup &&
          otherGroups.length >= 0 && (
            <button onClick={() => setViewing(myGroup)} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-16 h-16 rounded-full ring-2 ring-hive-yellow p-0.5 overflow-hidden">
                <img src={myGroup.stories[0].image} loading="lazy" className="w-full h-full rounded-full object-cover" alt="" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-300">You</span>
            </button>
          )}

        {otherGroups.map((group) => (
          <button key={group.user.id} onClick={() => setViewing(group)} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-16 h-16 rounded-full ring-2 ring-hive-yellow p-0.5 overflow-hidden">
              <img src={group.stories[0].image} loading="lazy" className="w-full h-full rounded-full object-cover" alt="" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[64px]">{group.user.name.split(' ')[0]}</span>
          </button>
        ))}

        {groups.length === 0 && (
          <p className="text-xs text-gray-400 self-center">No stories yet — add the first one!</p>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setShowAdd(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-hive-panel rounded-2xl p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Add a story</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddStory}>
              <ImageUpload folder="stories" previewUrl={imageUrl} onUploaded={setImageUrl} onClear={() => setImageUrl('')} label="Choose an image" />
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
              <p className="text-xs text-gray-400 mt-2">Stories disappear after 24 hours.</p>
              <button type="submit" disabled={!imageUrl || saving} className="mt-3 w-full py-2 rounded-lg bg-hive-yellow text-black font-semibold text-sm disabled:opacity-50">
                {saving ? 'Sharing...' : 'Share Story'}
              </button>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setViewing(null)}>
          <button onClick={() => setViewing(null)} className="absolute top-4 right-4 text-white z-10">
            <X size={26} />
          </button>
          <div className="relative w-full max-w-sm h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-3 left-3 right-3 flex items-center gap-2 z-10">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white">
                {viewing.user.avatar ? <img src={viewing.user.avatar} className="w-full h-full object-cover" alt="" /> : (
                  <div className="w-full h-full bg-hive-yellow flex items-center justify-center text-black font-bold">{viewing.user.name[0]}</div>
                )}
              </div>
              <span className="text-white font-medium text-sm drop-shadow">{viewing.user.name}</span>
            </div>
            <img src={viewing.stories[0].image} alt="story" className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
