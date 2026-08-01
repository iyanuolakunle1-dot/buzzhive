import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import ImageUpload from '../components/ImageUpload';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    avatar: user?.avatar || '',
    coverPhoto: user?.coverPhoto || '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwSaving, setPwSaving] = useState(false);

  function update(field) {
    return (e) => setProfile((p) => ({ ...p, [field]: e.target.value }));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const res = await api.put('/users/me', profile);
      setUser(res.data.user);
      localStorage.setItem('buzzhive_user', JSON.stringify(res.data.user));
      setProfileMsg('Profile updated successfully.');
      showToast('Profile updated', 'success', 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setProfileMsg(msg);
      showToast(msg, 'error');
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (pw.newPassword !== pw.confirmPassword) {
      return setPwMsg({ type: 'error', text: "New passwords don't match" });
    }
    setPwSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      showToast('Password updated', 'success', 2500);
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      setPwMsg({ type: 'error', text: msg });
      showToast(msg, 'error');
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Appearance */}
      <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Appearance</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-300">Dark mode</p>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-hive-yellow' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Profile */}
      <form onSubmit={saveProfile} className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Profile</h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Avatar</label>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-hive-yellow/20 flex items-center justify-center font-bold text-hive-yellow overflow-hidden shrink-0">
              {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" alt="" /> : user?.name?.[0]}
            </div>
            <ImageUpload folder="avatars" onUploaded={(url) => setProfile((p) => ({ ...p, avatar: url }))} label="Change avatar" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Cover photo</label>
          {profile.coverPhoto && <img src={profile.coverPhoto} loading="lazy" className="w-full h-24 object-cover rounded-lg mb-2" alt="" />}
          <ImageUpload folder="covers" onUploaded={(url) => setProfile((p) => ({ ...p, coverPhoto: url }))} label="Change cover photo" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Name</label>
          <input value={profile.name} onChange={update('name')} className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-800 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Bio</label>
          <textarea value={profile.bio} onChange={update('bio')} rows={3} className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none resize-none text-gray-800 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Location</label>
          <input value={profile.location} onChange={update('location')} className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-800 dark:text-gray-100" />
        </div>

        {profileMsg && <p className={`text-sm ${profileMsg.includes('success') ? 'text-green-500' : 'text-red-500'}`}>{profileMsg}</p>}

        <button type="submit" disabled={profileSaving} className="px-5 py-2 rounded-lg bg-hive-yellow text-black text-sm font-semibold disabled:opacity-50">
          {profileSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={savePassword} className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Current password</label>
          <input type="password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-800 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">New password</label>
          <input type="password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-800 dark:text-gray-100" />
          <p className="text-xs text-gray-400 mt-1">At least 8 characters, with upper, lower case letters and a number.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Confirm new password</label>
          <input type="password" value={pw.confirmPassword} onChange={(e) => setPw((p) => ({ ...p, confirmPassword: e.target.value }))} className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-800 dark:text-gray-100" />
        </div>

        {pwMsg.text && <p className={`text-sm ${pwMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{pwMsg.text}</p>}

        <button type="submit" disabled={pwSaving} className="px-5 py-2 rounded-lg bg-hive-yellow text-black text-sm font-semibold disabled:opacity-50">
          {pwSaving ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="w-full py-2.5 rounded-lg border border-red-300 dark:border-red-500/30 text-red-500 text-sm font-semibold"
      >
        Log Out
      </button>
    </div>
  );
}
