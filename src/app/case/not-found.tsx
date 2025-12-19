import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F1419] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Case Not Found</h1>
        <p className="text-gray-400 mb-8">
          The case you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Return to Cases
        </Link>
      </div>
    </div>
  );
}

