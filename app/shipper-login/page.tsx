// app/shipper-login/page.tsx
'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// --- We are hardcoding the keys here to fix the loading bug ---
const SUPABASE_URL = "https://eprfdgapbuabrzvgkjzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcmZkZ2FwYnVhYnJ6dmdranpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQzMDIsImV4cCI6MjA3ODM3MDMwMn0.GM6oLy0I7foAV9w8F2q0p10gAE4lR60bp55CoxZX9dg";
// -------------------------------------------------------------

export default function ShipperLoginPage() {
  // Create the client directly with the hardcoded keys
  const supabase = createClientComponentClient({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY
  });
  
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // After login, send them to the dashboard
        
        router.push('/complete-profile');
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: 'auto', paddingTop: '100px' }}>
      <h2>Shipper Login / Sign Up</h2>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        providers={[]} // We are only using email/password
        redirectTo="http://localhost:3000/auth/callback"
      />
    </div>
  );
}