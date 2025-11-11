// app/page.tsx
import Link from "next/link";
import { Truck, Box, Users } from "lucide-react";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "white",
        padding: "60px 20px 100px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            backdrop-filter: blur(10px);
            transition: all 0.4s ease;
            cursor: pointer;
            animation: fadeIn 0.8s ease forwards;
          }

          .card:hover {
            transform: translateY(-10px);
            background: rgba(255, 255, 255, 0.12);
          }

          .card p {
            color: #cbd5e1;
            transition: color 0.3s ease;
          }

          .card:hover p {
            color: white;
          }

          .glow {
            text-shadow: 0 0 10px rgba(59,130,246,0.8), 0 0 20px rgba(59,130,246,0.6);
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 30px;
            width: 100%;
            max-width: 1100px;
          }

          @media (min-width: 768px) {
            .grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          .hover-blue:hover { box-shadow: 0 0 20px rgba(59,130,246,0.4); }
          .hover-green:hover { box-shadow: 0 0 20px rgba(34,197,94,0.4); }
          .hover-orange:hover { box-shadow: 0 0 20px rgba(249,115,22,0.4); }
        `}
      </style>

      {/* --- Header Section --- */}
      <div style={{ textAlign: "center", marginBottom: "60px", animation: "fadeIn 1s ease" }}>
        <h1
          className="glow"
          style={{
            fontSize: "4.5rem",
            fontWeight: "800",
            marginBottom: "16px",
            letterSpacing: "1px",
            background: "linear-gradient(to right, #60a5fa, #22c55e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ZeroMile
        </h1>
        <p style={{ fontSize: "1.5rem", color: "#94a3b8" }}>
          Driving Towards <span style={{ color: "#38bdf8" }}>Sustainable Logistics</span>.
        </p>
      </div>

      {/* --- Card Section --- */}
      <div className="grid">
        {/* Shipper Card */}
        <Link href="/shipper-login" passHref>
          <div className="card hover-blue">
            <Box size={60} color="#60a5fa" style={{ marginBottom: "20px" }} />
            <h2 style={{ fontSize: "1.8rem", fontWeight: "600", marginBottom: "10px" }}>Shipper</h2>
            <p>I have goods to ship. Post a load and find a truck.</p>
          </div>
        </Link>

        {/* Fleet Operator Card */}
        <Link href="/operator-login" passHref>
          <div className="card hover-green">
            <Users size={60} color="#4ade80" style={{ marginBottom: "20px" }} />
            <h2 style={{ fontSize: "1.8rem", fontWeight: "600", marginBottom: "10px" }}>
              Fleet Operator
            </h2>
            <p>I own trucks. Manage my fleet and track performance.</p>
          </div>
        </Link>

        {/* Driver Card */}
        <Link href="/driver-login" passHref>
          <div className="card hover-orange">
            <Truck size={60} color="#fb923c" style={{ marginBottom: "20px" }} />
            <h2 style={{ fontSize: "1.8rem", fontWeight: "600", marginBottom: "10px" }}>Driver</h2>
            <p>I drive a truck. Find jobs and manage deliveries.</p>
          </div>
        </Link>
      </div>

      {/* --- Optional Footer --- */}
      <footer style={{ marginTop: "80px", color: "#64748b", fontSize: "0.9rem" }}>
        © {new Date().getFullYear()} Zeo_Mile • Built for a Greener Tomorrow 🌱
      </footer>
    </main>
  );
}
