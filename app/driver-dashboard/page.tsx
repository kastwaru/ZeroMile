'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { Loader2, Truck, MapPin, LogOut, Plus, Check, X } from 'lucide-react';
import './DriverDashboard.css'; // Import the CSS file

type Load = {
  id: string;
  created_at: string;
  pickup_location_text: string;
  dropoff_location_text: string;
  load_weight_kg: number;
  status: string;
};

const SUPABASE_URL = "https://eprfdgapbuabrzvgkjzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcmZkZ2FwYnVhYnJ6dmdranpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQzMDIsImV4cCI6MjA3ODM3MDMwMn0.GM6oLy0I7foAV9w8F2q0p10gAE4lR60bp55CoxZX9dg";

export default function DriverDashboard() {
  const supabase = createClientComponentClient({ supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY });
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchedLoads, setMatchedLoads] = useState<Load[]>([]);
  const [activeJob, setActiveJob] = useState<Load | null>(null);
  const [showPostTripModal, setShowPostTripModal] = useState(false);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/driver-login');
        return;
      }
      setUser(user);
      const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'driver') {
        alert('Access Denied: This page is for Drivers only.');
        await supabase.auth.signOut();
        router.push('/');
        return;
      }
      fetchData(user.id);
      setLoading(false);

      const loadsChannel = supabase.channel('driver-loads-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'loads', filter: `matched_driver_id=eq.${user.id}` },
            () => fetchData(user.id)
        ).subscribe();
      return () => supabase.removeChannel(loadsChannel);
    };
    checkUserAndFetchData();
  }, [supabase, router]);

  const fetchData = async (driverId: string) => {
    const { data: matchedData } = await supabase.from('loads').select('*').eq('matched_driver_id', driverId).eq('status', 'matched');
    if (matchedData) setMatchedLoads(matchedData as Load[]);
    const { data: activeData } = await supabase.from('loads').select('*').eq('matched_driver_id', driverId).eq('status', 'accepted').limit(1).single();
    if (activeData) setActiveJob(activeData as Load);
    else setActiveJob(null);
  };

  const handleAcceptJob = async (loadId: string) => {
    if (!user) return;
    try {
      const { data: truckRes, error: truckError } = await supabase.from('truck_trips').select('id').eq('driver_id', user.id).eq('status', 'matched').limit(1).single();
      if (truckError) throw truckError;
      await supabase.from('loads').update({ status: 'accepted' }).eq('id', loadId);
      await supabase.from('truck_trips').update({ status: 'accepted' }).eq('id', truckRes.id);
      fetchData(user.id);
    } catch (e: any) { setError(`Error accepting job: ${e.message}`); }
  };

  const handleCompleteJob = async (loadId: string) => {
    if (!user) return;
    try {
      const { data: truckRes, error: truckError } = await supabase.from('truck_trips').select('id').eq('driver_id', user.id).eq('status', 'accepted').limit(1).single();
      if (truckError) throw truckError;
      await supabase.from('loads').update({ status: 'completed' }).eq('id', loadId);
      await supabase.from('truck_trips').update({ status: 'completed' }).eq('id', truckRes.id);
      fetchData(user.id);
    } catch (e: any) { setError(`Error completing job: ${e.message}`); }
  };

  const handleCheckIn = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const locationString = `POINT(${longitude} ${latitude})`;
      const { error } = await supabase.from('user_profiles').update({ last_location: locationString }).eq('id', user!.id);
      if (error) setError(`Location check-in failed: ${error.message}`); else alert('Checked In!');
    }, () => setError('Unable to get location.'));
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (loading || !user) return (
    <div className="loader-container">
      <Loader2 size={48} className="loader-spin"/>
    </div>
  );

  return (
    <>
      <div className="dashboard">
        <header className="dashboard-header">
          <h1 className="dashboard-title"><Truck size={32}/> Driver Dashboard</h1>
          <button onClick={handleSignOut} className="btn-red"><LogOut size={18}/> Sign Out</button>
        </header>

        <main className="dashboard-main">
          <p className="welcome-text">Welcome, <b>{user.email}</b></p>

          <div className="action-buttons">
            <button onClick={handleCheckIn} className="btn-green"><MapPin size={22}/> Check In Location</button>
            <button onClick={() => setShowPostTripModal(true)} className="btn-blue"><Plus size={22}/> Post Empty Trip</button>
          </div>
          {error && <p className="error-text">{error}</p>}

          <div className="jobs-grid">
            {/* Active Job */}
            <div>
              <h2 className="section-title">Active Job</h2>
              {activeJob ? (
                <div className="job-card">
                  <h3>{activeJob.pickup_location_text} ➔ {activeJob.dropoff_location_text}</h3>
                  <p>Weight: {activeJob.load_weight_kg} kg</p>
                  <button onClick={() => handleCompleteJob(activeJob.id)} className="btn-green"> <Check size={20}/> Complete Job</button>
                </div>
              ) : <p className="no-job-text">No active jobs</p>}
            </div>

            {/* New Offers */}
            <div>
              <h2 className="section-title">New Offers ({matchedLoads.length})</h2>
              {matchedLoads.length === 0 ? (
                <p className="no-job-text">No new offers available</p>
              ) : (
                <div className="offer-cards">
                  {matchedLoads.map(load => (
                    <div key={load.id} className="job-card">
                      <h3>{load.pickup_location_text} ➔ {load.dropoff_location_text}</h3>
                      <p>Weight: {load.load_weight_kg} kg</p>
                      <button onClick={() => handleAcceptJob(load.id)} className="btn-blue">Accept Job</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showPostTripModal && <PostTripModal onClose={() => setShowPostTripModal(false)} userId={user.id}/>}
    </>
  );
}

function PostTripModal({ onClose, userId }: { onClose: ()=>void, userId:string }) {
  const supabase = createClientComponentClient({ supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY });
  const [start,setStart] = useState(''); const [end,setEnd] = useState(''); const [capacity,setCapacity] = useState('');
  const [loading,setLoading] = useState(false); const [error,setError] = useState('');

  const handlePost = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const { data: profile } = await supabase.from('user_profiles').select('fleet_id').eq('id', userId).single();
    const { error: tripError } = await supabase.from('truck_trips').insert({ driver_id:userId, start_location_text:start, end_location_text:end, truck_capacity_kg:parseInt(capacity), available_date:new Date().toISOString(), status:'available', fleet_id:profile?.fleet_id || null });
    setLoading(false); if(tripError) setError(tripError.message); else { alert('Trip posted!'); onClose(); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Post an Empty Trip</h2>
          <button onClick={onClose}><X size={24}/></button>
        </div>
        <form onSubmit={handlePost} className="modal-form">
          <input type="text" placeholder="Start Location" value={start} onChange={e=>setStart(e.target.value)} required/>
          <input type="text" placeholder="End Location" value={end} onChange={e=>setEnd(e.target.value)} required/>
          <input type="number" placeholder="Capacity (kg)" value={capacity} onChange={e=>setCapacity(e.target.value)} required/>
          <button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Trip'}</button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}
