// app/shipper-dashboard/page.tsx
'use client';
import { createClient } from '@/app/_lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';

// Define the type for a Load
type Load = {
  id: number;
  created_at: string;
  pickup_location_text: string;
  dropoff_location_text: string;
  load_weight_kg: number;
  status: string;
};

// --- Helper function to color-code the status ---
function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return '#FFA500'; // Orange
    case 'matched': return '#FFD700'; // Yellow
    case 'accepted': return '#007BFF'; // Blue
    case 'completed': return '#28A745'; // Green
    default: return '#FFFFFF'; // White
  }
}

// --- A Reusable Card Component for Loads ---
function LoadCard({ load }: { load: Load }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h4>{load.pickup_location_text} ➔ {load.dropoff_location_text}</h4>
        <span style={{...styles.statusTag, backgroundColor: getStatusColor(load.status)}}>
          {load.status.toUpperCase()}
        </span>
      </div>
      <p style={{ margin: '8px 0 0 0', color: '#CCC' }}>Weight: {load.load_weight_kg} kg</p>
      <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.8rem' }}>
        Posted: {new Date(load.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}

// --- The Main Dashboard Page ---
export default function ShipperDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [allLoads, setAllLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Form State ---
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [weight, setWeight] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchLoads(user.id);
      } else {
        router.push('/shipper-login');
      }
    };
    checkUser();
  }, [supabase, router]);

  // Function to fetch all of the user's loads
  const fetchLoads = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('shipper_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching loads:', error);
    } else {
      setAllLoads(data as Load[]);
    }
    setLoading(false);
  };

  // --- NEW: Filtered lists ---
  // We use useMemo to avoid re-calculating on every render
  const currentLoads = useMemo(() => {
    return allLoads.filter(load => 
      load.status === 'pending' || 
      load.status === 'matched' || 
      load.status === 'accepted'
    );
  }, [allLoads]);

  const pastLoads = useMemo(() => {
    return allLoads.filter(load => load.status === 'completed');
  }, [allLoads]);

  // Function to handle posting a new load
  const handlePostLoad = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFormLoading(true);

    if (!user) {
      setFormError('You must be logged in to post a load.');
      setFormLoading(false);
      return;
    }

    const { error } = await supabase.from('loads').insert({
      pickup_location_text: pickup,
      dropoff_location_text: dropoff,
      load_weight_kg: parseInt(weight),
      shipper_id: user.id,
      status: 'pending',
    });

    setFormLoading(false);
    if (error) {
      setFormError(error.message);
    } else {
      setPickup('');
      setDropoff('');
      setWeight('');
      fetchLoads(user.id); // Refresh the list
    }
  };

  // Simple sign-out function
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/shipper-login');
  };

  if (!user) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      {/* --- Header --- */}
      <div style={styles.header}>
        <h1>Shipper Dashboard</h1>
        <button onClick={handleSignOut} style={styles.signOutButton}>Sign Out</button>
      </div>
      <p style={{ marginTop: '-10px', color: '#AAA' }}>Welcome, {user.email}</p>

      {/* --- Main Content Area (2-column layout) --- */}
      <div style={styles.mainContent}>
        
        {/* --- Left Column: Post Load --- */}
        <div style={styles.column}>
          <div style={styles.formContainer}>
            <h2>Post a New Load</h2>
            <form onSubmit={handlePostLoad} style={styles.form}>
              <input
                type="text"
                placeholder="Pickup Location (e.g., Surat)"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                required
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Dropoff Location (e.g., Jaipur)"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                required
                style={styles.input}
              />
              <input
                type="number"
                placeholder="Weight (in kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                style={styles.input}
              />
              <button type="submit" disabled={formLoading} style={styles.button}>
                {formLoading ? 'Posting...' : 'Post Load'}
              </button>
              {formError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{formError}</p>}
            </form>
          </div>
        </div>

        {/* --- Right Column: Load Lists --- */}
        <div style={styles.column}>
          
          {/* --- Current Loads Section --- */}
          <h2>Current Loads</h2>
          {loading ? <p>Loading...</p> : (
            currentLoads.length === 0 ? (
              <p style={{ color: '#888' }}>No active loads.</p>
            ) : (
              <div style={styles.loadList}>
                {currentLoads.map((load) => <LoadCard key={load.id} load={load} />)}
              </div>
            )
          )}

          {/* --- Past Loads Section --- */}
          <h2 style={{ marginTop: '2rem' }}>Past Loads</h2>
          {loading ? <p>Loading...</p> : (
            pastLoads.length === 0 ? (
              <p style={{ color: '#888' }}>No completed loads yet.</p>
            ) : (
              <div style={styles.loadList}>
                {pastLoads.map((load) => <LoadCard key={load.id} load={load} />)}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// --- All Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    maxWidth: '1200px',
    margin: 'auto',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333',
    paddingBottom: '1rem'
  },
  signOutButton: {
    height: '40px',
    padding: '0 1rem',
    cursor: 'pointer',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'row',
    gap: '2rem',
    marginTop: '2rem'
  },
  column: {
    flex: 1,
  },
  formContainer: {
    padding: '1.5rem',
    backgroundColor: '#222',
    borderRadius: '8px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    color: '#333',
    backgroundColor: '#FFF',
    border: '1px solid #CCC',
    borderRadius: '4px'
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  loadList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  card: {
    padding: '1rem',
    backgroundColor: '#2a2a2a',
    borderRadius: '8px',
    border: '1px solid #444'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #444',
    paddingBottom: '8px'
  },
  statusTag: {
    padding: '4px 8px',
    borderRadius: '12px',
    color: 'black',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  }
};