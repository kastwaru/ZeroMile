// app/operator-dashboard/page.tsx
'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Truck, Users, MapPin, LogOut, BarChart3 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

// Define driver type
type DriverProfile = {
  id: string;
  full_name: string;
  phone_number: string | null;
  last_location: string | null;
};

// Hardcoded Supabase keys
const SUPABASE_URL = "https://eprfdgapbuabrzvgkjzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcmZkZ2FwYnVhYnJ6dmdranpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQzMDIsImV4cCI6MjA3ODM3MDMwMn0.GM6oLy0I7foAV9w8F2q0p10gAE4lR60bp55CoxZX9dg";

// Helper to parse location
function parseLocation(wkbString: string | null): string {
  if (!wkbString) return 'Location Unknown';
  const match = wkbString.match(/POINT\(([^ ]+) ([^)]+)\)/);
  if (match && match[1] && match[2]) {
    const lat = parseFloat(match[2]).toFixed(4);
    const lon = parseFloat(match[1]).toFixed(4);
    return `Lat: ${lat}, Lon: ${lon}`;
  }
  return 'Invalid Location Data';
}

export default function OperatorDashboard() {
  const supabase = createClientComponentClient({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY
  });
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/operator-login');
        return;
      }
      setUser(user);

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || profile?.role !== 'operator') {
        alert('Access Denied. This page is for Fleet Operators only.');
        await supabase.auth.signOut();
        router.push('/');
        return;
      }

      fetchDrivers(user.id);
    };
    checkUser();
  }, [supabase, router]);

  const fetchDrivers = async (operatorId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, phone_number, last_location')
      .eq('role', 'driver')
      .eq('fleet_id', operatorId);

    if (!error && data) setDrivers(data as DriverProfile[]);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user || loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <Loader2 size={48} className="animate-spin" color="#2563eb" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>
      {/* HEADER */}
      <header style={{
        background: '#ffffff',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={26} color="#16a34a" /> Fleet Operator Dashboard
        </h1>
        <button
          onClick={handleSignOut}
          style={{
            backgroundColor: '#dc2626',
            color: '#fff',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} style={{ marginRight: '6px' }} /> Sign Out
        </button>
      </header>

      {/* MAIN SECTION */}
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <p style={{ color: '#475569', marginBottom: '1rem' }}>Welcome, {user.email}</p>

        {/* Fleet Info */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#1d4ed8', fontWeight: '600' }}>Your Fleet ID</h3>
          <p style={{ marginTop: '0.3rem', color: '#334155' }}>
            Share this ID with your drivers so they can join your fleet:
          </p>
          <code style={{
            display: 'block',
            marginTop: '0.5rem',
            background: '#e2e8f0',
            padding: '0.6rem',
            borderRadius: '6px',
            color: '#1e3a8a',
            fontFamily: 'monospace'
          }}>
            {user.id}
          </code>
        </div>

        {/* Fleet Overview Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontWeight: '600', color: '#334155' }}>Total Drivers</h4>
            <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#16a34a', marginTop: '0.5rem' }}>{drivers.length}</p>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontWeight: '600', color: '#334155' }}>Active Fleets</h4>
            <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2563eb', marginTop: '0.5rem' }}>{Math.floor(drivers.length / 2)}</p>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
            <h4 style={{ fontWeight: '600', color: '#334155' }}>Idle Trucks</h4>
            <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f97316', marginTop: '0.5rem' }}>{Math.max(0, drivers.length - 2)}</p>
          </div>
        </div>

        {/* DRIVER LIST */}
        <h2 style={{ fontSize: '1.6rem', fontWeight: '600', marginBottom: '1rem' }}>
          <BarChart3 size={22} style={{ marginRight: '6px', color: '#2563eb' }} />
          Fleet Drivers ({drivers.length})
        </h2>

        {drivers.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No drivers have joined yet.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {drivers.map((driver) => (
              <div key={driver.id} style={{
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', color: '#111827' }}>
                  <Truck size={20} color="#16a34a" /> {driver.full_name || 'Unnamed Driver'}
                </h3>
                <p style={{ color: '#475569', marginTop: '0.5rem' }}>
                  📍 <strong>Last Location:</strong> {parseLocation(driver.last_location)}
                </p>
                <p style={{ color: '#475569', marginTop: '0.3rem' }}>
                  ☎️ <strong>Phone:</strong> {driver.phone_number || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
