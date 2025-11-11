// app/complete-profile/page.tsx
'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react'; 

// --- Hardcoded Keys (for stability) ---
const SUPABASE_URL = "https://eprfdgapbuabrzvgkjzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcmZkZ2FwYnVhYnJ6dmdranpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQzMDIsImV4cCI6MjA3ODM3MDMwMn0.GM6oLy0I7foAV9w8F2q0p10gAE4lR60bp55CoxZX9dg"; 

export default function CompleteProfilePage() {
  const supabase = createClientComponentClient({
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY
  });
  const router = useRouter();

  // State for new fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/shipper-login');
      return;
    }

    // 2. Insert/Update the user_profiles table with collected data
    const { error: dbError } = await supabase
      .from('user_profiles')
      .upsert({ 
          id: user.id, // User ID from Supabase Auth
          role: 'shipper', // Automatically set the role here!
          full_name: fullName,
          phone_number: phoneNumber,
          company_address: companyAddress,
          gst_number: gstNumber 
      });

    if (dbError) {
      setError(`Profile save failed: ${dbError.message}`);
      setLoading(false);
      return;
    }

    // 3. Success! Redirect to the main dashboard
    router.push('/shipper-dashboard');
  };

  // Check auth and redirect if not logged in
  useState(() => {
    const checkAuth = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) {
             router.push('/shipper-login');
         }
    };
    checkAuth();
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-lg p-8 bg-gray-900 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-4xl font-extrabold mb-8 text-white text-center tracking-tight">
          Complete Shipper Profile
        </h2>
        <p className="text-center text-gray-400 mb-8">
          Tell us a little more about your shipping needs.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <input
            type="text"
            placeholder="Your Full Name (Required)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500"
          />

          <input
            type="tel"
            placeholder="Phone Number (Required)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500"
          />

          <textarea
            placeholder="Company Address (Required)"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            required
            rows={3}
            className="p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y placeholder-gray-500"
          />

          <input
            type="text"
            placeholder="GST ID / Tax ID (Optional)"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
            className="p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400 flex items-center justify-center gap-2 text-lg"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Profile & Continue'}
          </button>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}