'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

// Hardcode keys to bypass .env errors
const SUPABASE_URL = "https://eprfdgapbuabrzvgkjzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcmZkZ2FwYnVhYnJ6dmdranpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQzMDIsImV4cCI6MjA3ODM3MDMwMn0.GM6oLy0I7foAV9w8F2q0p10gAE4lR60bp55CoxZX9dg";

export default function OperatorLoginPage() {
  const supabase = createClientComponentClient({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY
  });

  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // After login, send them to the operator's profile setup
        router.push('/operator-profile-setup');
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f1f8e9, #e3f2fd)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '15px',
          color: '#2c3e50'
        }}>
          🧑‍💼 Operator Login / Sign Up
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#555',
          marginBottom: '30px',
          fontSize: '15px'
        }}>
          Manage your fleet, track drivers, and handle shipments all in one place.
        </p>

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]} // Email/password only
          redirectTo="http://localhost:3000/auth/callback"
        />

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <Link href="/" passHref>
            <span
              style={{
                fontSize: '14px',
                color: '#1e88e5',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              ⬅ Back to Main Portal
            </span>
          </Link>
        </div>

        <div style={{
          marginTop: '35px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          <p>New to the platform? Create an account to manage your drivers efficiently.</p>
        </div>
      </div>
    </div>
  );
}
