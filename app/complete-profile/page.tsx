'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import { Loader2 } from 'lucide-react'; 

// --- Hardcoded Keys (same as before) ---
const SUPABASE_URL = "https://eprfdgapbuabrzvgkjzr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcmZkZ2FwYnVhYnJ6dmdranpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQzMDIsImV4cCI6MjA3ODM3MDMwMn0.GM6oLy0I7foAV9w8F2q0p10gAE4lR60bp55CoxZX9dg";

export default function CompleteProfilePage() {
  const supabase = createClientComponentClient({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY
  });
  const router = useRouter();

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

    const { error: dbError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        role: 'shipper',
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

    router.push('/shipper-dashboard');
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/shipper-login');
    };
    checkAuth();
  }, [supabase, router]);

  return (
    <div
      style={{
        background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#1e293b',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '450px',
          color: '#fff',
          border: '1px solid #334155',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '10px',
            fontSize: '28px',
            fontWeight: 700,
          }}
        >
          Complete Shipper Profile
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: '#94a3b8',
            marginBottom: '25px',
            fontSize: '15px',
          }}
        >
          Tell us a little more about your shipping needs.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #475569',
                backgroundColor: '#334155',
                color: '#fff',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #475569',
                backgroundColor: '#334155',
                color: '#fff',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <textarea
              placeholder="Company Address"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              required
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #475569',
                backgroundColor: '#334155',
                color: '#fff',
                fontSize: '15px',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="GST / Tax ID (Optional)"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #475569',
                backgroundColor: '#334155',
                color: '#fff',
                fontSize: '15px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: loading ? '#475569' : '#3b82f6',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: '0.3s',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile & Continue'
            )}
          </button>

          {error && (
            <p
              style={{
                color: '#f87171',
                marginTop: '15px',
                textAlign: 'center',
                fontSize: '14px',
              }}
            >
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
