// app/operator-login/page.tsx
import Link from 'next/link';

export default function OperatorLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Operator Portal</h1>
      <p className="text-xl text-gray-300 mb-8">
        This feature is coming soon!
      </p>
      <Link href="/" passHref>
        <span className="px-6 py-3 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 transition">
          Back to Home
        </span>
      </Link>
    </main>
  );
}