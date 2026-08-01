import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Friends from './pages/Friends';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Bookmarks from './pages/Bookmarks';
import Settings from './pages/Settings';
import PostDetail from './pages/PostDetail';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/post/:id" element={<PostDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
