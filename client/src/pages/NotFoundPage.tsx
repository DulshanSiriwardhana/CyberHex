import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0c0c] text-center px-4">
      <h1 className="font-spectral font-extrabold text-6xl text-brand mb-4">404</h1>
      <p className="text-lg text-text-secondary mb-2">Page not found</p>
      <p className="text-sm text-text-tertiary mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-lg bg-brand text-white font-medium hover:bg-brand-hover transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}