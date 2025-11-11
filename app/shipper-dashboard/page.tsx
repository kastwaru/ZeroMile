'use client';
import { createClient } from '@/app/_lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';

// ---------------- Types ----------------
type Load = {
  id: number;
  created_at: string;
  pickup_location_text: string;
  dropoff_location_text: string;
  load_weight_kg: number;
  status: string;
};

// ---------------- Helper ----------------
function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return '#F59E0B'; // Orange
    case 'matched': return '#FACC15'; // Yellow
    case 'accepted': return '#3B82F6'; // Blue
    case 'completed': return '#22C55E'; // Green
    default: return '#9CA3AF'; // Gray
  }
}

// ---------------- Load Card ----------------
function LoadCard({ load }: { load: Load }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h4 style={styles.cardTitle}>{load.pickup_location_text} ➔ {load.dropoff_location_text}</h4>
        <span style={{ ...styles.statusTag, backgroundColor: getStatusColor(load.status) }}>
          {load.status.toUpperCase()}
        </span>
      </div>
      <p style={styles.cardText}>Weight: {load.load_weight_kg} kg</p>
      <p style={styles.cardSubtext}>Posted: {new Date(load.created_at).toLocaleDateString()}</p>
    </div>
  );
}

// ---------------- Main Dashboard ----------------
export default function ShipperDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [allLoads, setAllLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [weight, setWeight] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Check user
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

  const fetchLoads = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('shipper_id', userId)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setAllLoads(data as Load[]);
    setLoading(false);
  };

  const currentLoads = useMemo(() => allLoads.filter(
    l => ['pending', 'matched', 'accepted'].includes(l.status)
  ), [allLoads]);
  const pastLoads = useMemo(() => allLoads.filter(l => l.status === 'completed'), [allLoads]);

  const handlePostLoad = async (e: FormEvent) => {
    e.preventDefault();
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
    if (error) setFormError(error.message);
    else {
      setPickup(''); setDropoff(''); setWeight('');
      fetchLoads(user.id);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/shipper-login');
  };

  if (!user) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🚚 Shipper Dashboard</h1>
        <button onClick={handleSignOut} style={styles.signOutButton}>Sign Out</button>
      </header>
      <p style={styles.welcome}>Welcome, {user.email}</p>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left - Form */}
        <div style={styles.leftColumn}>
          <div style={styles.formContainer}>
            <h2 style={styles.sectionTitle}>Post a New Load</h2>
            <form onSubmit={handlePostLoad} style={styles.form}>
              <input style={styles.input} value={pickup} onChange={e => setPickup(e.target.value)} placeholder="Pickup Location" required />
              <input style={styles.input} value={dropoff} onChange={e => setDropoff(e.target.value)} placeholder="Dropoff Location" required />
              <input style={styles.input} type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Weight (kg)" required />
              <button style={styles.submitButton} disabled={formLoading}>
                {formLoading ? 'Posting...' : 'Post Load'}
              </button>
              {formError && <p style={styles.error}>{formError}</p>}
            </form>
          </div>
        </div>

        {/* Right - Load Lists */}
        <div style={styles.rightColumn}>
          <section>
            <h2 style={styles.sectionTitle}>Current Loads</h2>
            {loading ? <p>Loading...</p> :
              currentLoads.length === 0 ? <p style={styles.emptyText}>No active loads.</p> :
                <div style={styles.loadList}>{currentLoads.map(load => <LoadCard key={load.id} load={load} />)}</div>
            }
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h2 style={styles.sectionTitle}>Past Loads</h2>
            {loading ? <p>Loading...</p> :
              pastLoads.length === 0 ? <p style={styles.emptyText}>No completed loads yet.</p> :
                <div style={styles.loadList}>{pastLoads.map(load => <LoadCard key={load.id} load={load} />)}</div>
            }
          </section>
        </div>
      </div>
    </div>
  );
}

// ---------------- Styles ----------------
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    backgroundColor: '#0B1120',
    minHeight: '100vh',
    color: '#E5E7EB',
    padding: '2rem',
    fontFamily: 'Inter, sans-serif',
  },
  header: {
    background: 'linear-gradient(90deg, #1E3A8A, #2563EB, #3B82F6)',
    padding: '1.2rem 2rem',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: 'white',
  },
  welcome: {
    marginTop: '0.8rem',
    color: '#9CA3AF',
  },
  signOutButton: {
    backgroundColor: '#F43F5E',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    padding: '0.6rem 1.2rem',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background 0.3s',
  },
  mainContent: {
    display: 'flex',
    gap: '2rem',
    marginTop: '2rem',
    flexWrap: 'wrap',
  },
  leftColumn: { flex: 1, minWidth: '300px' },
  rightColumn: { flex: 2, minWidth: '400px' },
  formContainer: {
    backgroundColor: '#1F2937',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
  },
  sectionTitle: {
    color: '#93C5FD',
    fontSize: '1.3rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '10px',
    color: '#E5E7EB',
    fontSize: '1rem',
    transition: 'border 0.2s',
  },
  submitButton: {
    background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
    border: 'none',
    color: 'white',
    fontSize: '1rem',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'transform 0.2s ease',
  },
  error: { color: '#F87171', fontSize: '0.9rem' },
  loadList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: {
    backgroundColor: '#111827',
    borderRadius: '12px',
    padding: '1.2rem',
    border: '1px solid #1F2937',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #1F2937',
    paddingBottom: '6px',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#E5E7EB',
  },
  cardText: { marginTop: '8px', color: '#D1D5DB' },
  cardSubtext: { color: '#9CA3AF', fontSize: '0.85rem', marginTop: '4px' },
  statusTag: {
    color: 'black',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  emptyText: { color: '#9CA3AF', fontStyle: 'italic' },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.5rem',
    color: '#60A5FA',
  },
};
