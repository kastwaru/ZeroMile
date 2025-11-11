'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect, useTransition } from 'react';
import { Loader2, User, Phone, Building, FileText, Truck } from 'lucide-react';

const SUPABASE_URL = "https://eprfdgapbuabrzvgkjzr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcmZkZ2FwYnVqcnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQzMDIsImV4cCI6MjA3ODM3MDMwMn0.GM6oLy0I7foAV9w8F2q0p10gAE4lR60bp55CoxZX9dg";

export default function DriverProfileSetupPage() {
  const supabase = createClientComponentClient({ supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_ANON_KEY });
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fleetId, setFleetId] = useState('');
  const [govtId, setGovtId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/driver-login');
    };
    checkUser();
  }, [supabase, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/driver-login');
      return;
    }

    const { error: dbError } = await supabase.from('user_profiles').upsert({
      id: user.id,
      role: 'driver',
      full_name: fullName,
      phone_number: phoneNumber,
      fleet_id: fleetId,
      govt_id_number: govtId,
      license_number: licenseNumber,
      truck_registrations: vehicleNumber,
    });

    if (dbError) { setError(dbError.message); setLoading(false); return; }

    setLoading(false);
    startTransition(() => { router.push('/driver-dashboard'); });
  };

  return (
    <main className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">Complete Your Driver Profile</h2>
        <form onSubmit={handleSubmit} className="profile-form">

          <label className="profile-label"><User size={18}/> Personal Info</label>
          <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required/>
          <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required/>

          <label className="profile-label"><Building size={18}/> Fleet Information</label>
          <input type="text" placeholder="Fleet ID (Get from Operator)" value={fleetId} onChange={e => setFleetId(e.target.value)} required/>

          <label className="profile-label"><FileText size={18}/> Documents</label>
          <input type="text" placeholder="Government ID (Aadhaar / PAN)" value={govtId} onChange={e => setGovtId(e.target.value)} required/>
          <input type="text" placeholder="Driving License Number" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} required/>

          <label className="profile-label"><Truck size={18}/> Vehicle Details</label>
          <input type="text" placeholder="Vehicle Number (Optional)" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)}/>

          <button type="submit" disabled={loading || isPending} className="btn-save">
            {loading || isPending ? <><Loader2 size={20} className="loader-spin"/> Saving...</> : 'Save Profile & Go to Dashboard'}
          </button>

          {error && <p className="error-text">{error}</p>}
        </form>
      </div>

      <style>{`
        body, html { margin:0; padding:0; font-family: 'Segoe UI', sans-serif; background:#f4f5f7; }
        .profile-container {
          display:flex;
          justify-content:center;
          align-items:center;
          min-height:100vh;
          padding:20px;
        }
        .profile-card {
          width:100%;
          max-width:500px;
          background:white;
          padding:30px;
          border-radius:20px;
          box-shadow:0 8px 20px rgba(0,0,0,0.1);
          border:1px solid #E5E7EB;
        }
        .profile-title {
          font-size:28px;
          font-weight:bold;
          text-align:center;
          margin-bottom:25px;
          color:#1F2937;
        }
        .profile-form { display:flex; flex-direction:column; gap:15px; }
        .profile-label {
          font-weight:600;
          margin-top:15px;
          display:flex;
          align-items:center;
          gap:8px;
          color:#374151;
        }
        .profile-form input {
          padding:12px;
          border-radius:10px;
          border:1px solid #D1D5DB;
          font-size:16px;
        }
        .profile-form input:focus {
          outline:none;
          border-color:#3B82F6;
          box-shadow:0 0 0 2px rgba(59,130,246,0.2);
        }
        .btn-save {
          margin-top:20px;
          padding:14px;
          background:#10B981;
          color:white;
          font-weight:bold;
          border:none;
          border-radius:12px;
          cursor:pointer;
          display:flex;
          justify-content:center;
          align-items:center;
          gap:10px;
          transition:all 0.2s;
        }
        .btn-save:hover { background:#059669; }
        .btn-save:disabled { background:#9CA3AF; cursor:not-allowed; }
        .loader-spin { animation:spin 1s linear infinite; }
        @keyframes spin { 0%{ transform:rotate(0deg);} 100%{ transform:rotate(360deg);} }
        .error-text {
          color:#DC2626;
          text-align:center;
          margin-top:10px;
          font-size:14px;
        }
      `}</style>
    </main>
  );
}
