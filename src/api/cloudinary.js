import api from './axios';

/**
 * Uploads a file to Cloudinary via the backend's /api/upload endpoint (the
 * backend holds the Cloudinary API secret and does the actual upload —
 * the browser never sees Cloudinary credentials). Returns the uploaded
 * image's public HTTPS URL.
 * @param {File} file
 * @param {string} folder - one of 'avatars' | 'covers' | 'posts' | 'stories'
 * @returns {Promise<string>} the uploaded image's secure_url
 */
export async function uploadImage(file, folder = 'posts') {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post(`/upload?folder=${encodeURIComponent(folder)}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // uploads can legitimately take longer than the default API timeout
  });

  return res.data.url;
}
