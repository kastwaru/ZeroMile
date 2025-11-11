// app/page.tsx
import Link from 'next/link';
import { Truck, Box, Users } from 'lucide-react'; // We need these icons

export default function HomePage() {
  return (
    // Use a light gray background for a clean, modern feel
    <main className="flex min-h-screen flex-col items-center justify-center p-12 md:p-24 bg-gray-100 text-gray-900">
      
      {/* --- Header --- */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
          Zeo_Mile
        </h1>
        <p className="text-2xl text-gray-600">
          Driving Towards Sustainable Logistics.
        </p>
      </div>

      {/* --- Card Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        
        {/* Shipper Card */}
        <Link href="/shipper-login" passHref>
          {/* White card with a bright shadow and hover effect */}
          <div className="block p-8 bg-white border border-gray-200 rounded-xl shadow-lg 
                          transition-all duration-300 hover:scale-105 hover:shadow-blue-200 
                          group cursor-pointer">
            
            <Box size={48} className="mb-4 text-blue-600" />
            <h2 className="text-3xl font-semibold mb-2 text-gray-900">
              Shipper
            </h2>
            <p className="text-gray-500 transition-colors duration-300 group-hover:text-gray-800">
              I have goods to ship. Post a load and find a truck.
            </p>
          </div>
        </Link>

        {/* Operator Card */}
        <Link href="/operator-login" passHref>
          {/* White card with a bright shadow and hover effect */}
          <div className="block p-8 bg-white border border-gray-200 rounded-xl shadow-lg 
                          transition-all duration-300 hover:scale-105 hover:shadow-green-200 
                          group cursor-pointer">
            
            <Users size={48} className="mb-4 text-green-600" />
            <h2 className="text-3xl font-semibold mb-2 text-gray-900">
              Fleet Operator
            </h2>
            <p className="text-gray-500 transition-colors duration-300 group-hover:text-gray-800">
              I own trucks. Manage my fleet and track performance.
            </p>
          </div>
        </Link>

        {/* Driver Card */}
        <Link href="/driver-app" passHref>
          {/* White card with a bright shadow and hover effect */}
          <div className="block p-8 bg-white border border-gray-200 rounded-xl shadow-lg 
                          transition-all duration-300 hover:scale-105 hover:shadow-orange-200 
                          group cursor-pointer">
            
            <Truck size={48} className="mb-4 text-orange-600" />
            <h2 className="text-3xl font-semibold mb-2 text-gray-900">
              Driver
            </h2>
            <p className="text-gray-500 transition-colors duration-300 group-hover:text-gray-800">
              I drive a truck. Find jobs and manage deliveries.
            </p>
          </div>
        </Link>
        
      </div>
    </main>
  );
}