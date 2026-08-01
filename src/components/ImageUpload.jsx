import { useRef, useState } from 'react';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../api/cloudinary';

/**
 * A small drop-in image picker that uploads directly to Supabase Storage
 * and hands the resulting public URL back via onUploaded.
 */
export default function ImageUpload({ folder = 'posts', onUploaded, previewUrl, onClear, label = 'Photo' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onUploaded(url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      {previewUrl ? (
        <div className="relative mt-3 inline-block">
          <img src={previewUrl} alt="preview" className="max-h-52 rounded-xl object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full p-1"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-hive-yellow px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          {uploading ? 'Uploading...' : label}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
