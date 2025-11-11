// app/driver-app/page.tsx
import Link from 'next/link';
import { Smartphone } from 'lucide-react';

export default function DriverAppPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-gray-900 text-white">
      <Smartphone size={64} className="mb-8 text-orange-400" />
      <h1 className="text-4xl font-bold mb-4">Driver App</h1>
      <p className="text-xl text-gray-300 mb-8">
        Please download the Zeo_Mile Driver App from your mobile store to continue.
      </p>
      <Link href="/" passHref>
        <span className="px-6 py-3 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 transition">
          Back to Home
        </span>
      </Link>
    </main>
  );
}