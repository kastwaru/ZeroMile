'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Hardcode keys to bypass .env errors
const SUPABASE_URL = "https://eprfdgapbuabrzvgkjzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcmZkZ2FwYnVhYnJ6dmdranpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQzMDIsImV4cCI6MjA3ODM3MDMwMn0.GM6oLy0I7foAV9w8F2q0p10gAE4lR60bp55CoxZX9dg";

export default function OperatorProfileSetupPage() {
  const supabase = createClientComponentClient({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY
  });

  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [govtId, setGovtId] = useState('');
  const [truckNumbers, setTruckNumbers] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/operator-login');
    };
    checkUser();
  }, [supabase, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/operator-login');
      return;
    }

    const { error: dbError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        role: 'operator',
        full_name: fullName,
        company_address: companyName,
        govt_id_number: govtId,
        truck_registrations: truckNumbers
      });

    if (dbError) {
      setError(`Profile save failed: ${dbError.message}`);
      setLoading(false);
      return;
    }

    router.push('/operator-dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f1f8e9, #e3f2fd)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '30px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '10px',
          color: '#2c3e50'
        }}>
          🚛 Operator / Fleet Setup
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#555',
          marginBottom: '25px',
          fontSize: '15px'
        }}>
          Register your fleet and manage all your drivers and vehicles easily.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Operator / Owner Full Name (Required)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Fleet Company Name (e.g., Tornado Logistics)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Government ID (e.g., PAN, GST, or Business ID)"
            value={govtId}
            onChange={(e) => setGovtId(e.target.value)}
            required
            style={inputStyle}
          />

          <textarea
            placeholder="Truck Numbers (e.g., UP14A1234, DL1B5678)"
            value={truckNumbers}
            onChange={(e) => setTruckNumbers(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '12px',
              backgroundColor: loading ? '#999' : '#2e7d32',
              color: '#fff',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: '0.3s'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Saving...
              </>
            ) : (
              'Create Fleet & Continue'
            )}
          </button>

          {error && (
            <p style={{
              color: 'red',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'center'
            }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// Common input field style
const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  backgroundColor: '#fafafa',
  fontSize: '15px',
  color: '#333',
  outline: 'none'
};
