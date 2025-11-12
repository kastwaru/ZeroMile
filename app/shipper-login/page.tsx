'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// --- Hardcoded Supabase keys (same as before) ---
const SUPABASE_URL = "https://eprfdgapbuabrzvgkjzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcmZkZ2FwYnVhYnJ6dmdranpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQzMDIsImV4cCI6MjA3ODM3MDMwMn0.GM6oLy0I7foAV9w8F2q0p10gAE4lR60bp55CoxZX9dg";
// ------------------------------------------------

export default function ShipperLoginPage() {
  const supabase = createClientComponentClient({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY
  });

  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/complete-profile');
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div style={styles.page}>
      <div style={styles.overlay} />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/9/95/Supabase_Logo.svg"
              alt="Logo"
              style={styles.logo}
            />
            <h1 style={styles.title}>ZeroMile Shipper Portal</h1>
            <p style={styles.subtitle}>Login or create an account to manage your loads</p>
          </div>

          <div style={styles.authBox}>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#4F46E5',
                      brandAccent: '#6366F1',
                    },
                  },
                },
              }}
              theme="dark"
              providers={[]}
              redirectTo="http://localhost:3000/auth/callback"
            />
          </div>

          <p style={styles.footerText}>
            By continuing, you agree to our{' '}
            <a href="#" style={styles.link}>Terms of Service</a> and{' '}
            <a href="#" style={styles.link}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    position: 'relative',
    height: '100vh',
    backgroundImage: 'url(https://images.unsplash.com/photo-1504384308090-c894fdcc538d)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '420px',
    padding: '2rem',
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 4px 25px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center',
    animation: 'fadeIn 0.8s ease-in-out',
  },
  header: {
    marginBottom: '1.5rem',
  },
  logo: {
    height: '50px',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 700,
    margin: '0 0 0.3rem 0',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#ccc',
  },
  authBox: {
    marginTop: '1.5rem',
  },
  footerText: {
    marginTop: '1.5rem',
    fontSize: '0.8rem',
    color: '#999',
  },
  link: {
    color: '#6366F1',
    textDecoration: 'none',
  },
};
