import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ImageUpload from './ImageUpload';

export default function CreatePost({ onCreated }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setError('');
    try {
      const res = await api.post('/posts', { content, image: image || null });
      onCreated?.(res.data.post);
      setContent('');
      setImage('');
      showToast('Post shared with the hive 🐝', 'success', 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create post';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setPosting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user?.name?.[0]?.toUpperCase()
          )}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}? Use #tags to trend.`}
          rows={2}
          className="flex-1 bg-gray-100 dark:bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none resize-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
        />
      </div>

      <div className="ml-[52px]">
        <ImageUpload folder="posts" previewUrl={image} onUploaded={setImage} onClear={() => setImage('')} label="Photo" />
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-end mt-3">
        <button
          type="submit"
          disabled={!content.trim() || posting}
          className="px-5 py-1.5 rounded-lg bg-hive-yellow text-black text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-95 transition"
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
