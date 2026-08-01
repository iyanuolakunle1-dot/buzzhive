import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-hive-dark">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-hive-yellow/20 flex items-center justify-center text-3xl mx-auto mb-4">🐝</div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Page not found</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" className="inline-block mt-5 px-5 py-2 rounded-lg bg-hive-yellow text-black text-sm font-semibold">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
