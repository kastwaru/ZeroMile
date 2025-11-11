'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

// --- Hardcoded Supabase Keys (Stable for demo) ---
const SUPABASE_URL = "https://eprfdgapbuabrzvgkjzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcmZkZ2FwYnVhYnJ6dmdranpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQzMDIsImV4cCI6MjA3ODM3MDMwMn0.GM6oLy0I7foAV9w8F2q0p10gAE4lR60bp55CoxZX9dg";

export default function DriverLoginPage() {
  const supabase = createClientComponentClient({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY
  });

  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/driver-profile-setup');
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
        color: 'white'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '40px 30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.8s ease'
        }}
      >
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(15px); }
              to { opacity: 1; transform: translateY(0); }
            }

            .back-link:hover {
              color: #38bdf8;
              text-decoration: underline;
            }
          `}
        </style>

        <h2
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '24px',
            background: 'linear-gradient(to right, #38bdf8, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Driver Login / Sign Up
        </h2>

        <div
          style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
            marginBottom: '15px'
          }}
        >
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={[]} // email/password only
            redirectTo="http://localhost:3000/auth/callback"
          />
        </div>

        <Link href="/" passHref>
          <span
            className="back-link"
            style={{
              display: 'inline-block',
              marginTop: '15px',
              color: '#60a5fa',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'color 0.3s ease'
            }}
          >
            ← Back to Main Portal
          </span>
        </Link>
      </div>
    </div>
  );
}
