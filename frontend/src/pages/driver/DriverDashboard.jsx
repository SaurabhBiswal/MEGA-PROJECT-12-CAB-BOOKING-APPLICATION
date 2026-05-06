import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { MapPin, Navigation, CheckCircle, Clock, Zap, Wallet, Star } from 'lucide-react';
import MapComponent from '../../components/MapComponent';

const DriverDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/driver/dashboard');
      setStats(statsRes.data);

      const historyRes = await api.get('/driver/my-rides');
      const active = historyRes.data.find(r => 
        ['ACCEPTED', 'DRIVER_ARRIVED', 'ONGOING'].includes(r.status)
      );

      if (active) setActiveRide(active);
      else {
        const reqRes = await api.get('/driver/requests');
        setRequests(reqRes.data);
      }
    } catch (error) {
      console.error("Failed to load driver data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (!activeRide) fetchData();
    }, 10000); 
    return () => clearInterval(interval);
  }, [activeRide]);

  const handleAcceptRide = async (rideId) => {
    try {
      const response = await api.post(`/driver/accept/${rideId}`);
      toast.success("Ride accepted!");
      setActiveRide(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept ride");
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      const response = await api.put(`/driver/ride/${activeRide.id}/status?status=${status}`);
      toast.success(`Status updated to ${status}`);
      
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        setActiveRide(null);
        fetchData();
      } else {
        setActiveRide(response.data);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const toggleAvailability = async () => {
    try {
      const response = await api.put('/driver/availability');
      setStats({ ...stats, isAvailable: response.data.available });
      toast.success(`You are now ${response.data.available ? 'online' : 'offline'}`);
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  // ── NOT VERIFIED SCREEN ──────────────────────────────
  if (stats && !stats.isVerified) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 flex flex-col items-center text-center">
        <div className="glass-card rounded-3xl p-12 border border-yellow-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <span className="text-5xl">⏳</span>
            </div>
            <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Verification Pending</h2>
            <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>Your account is currently under review by our safety team.</p>
            <div className="bg-black/20 rounded-2xl p-6 text-left space-y-3 mb-8">
              <p className="font-bold text-yellow-400 text-sm uppercase tracking-widest mb-3">Verification Checklist</p>
              {[
                { done: true,  label: 'Account Created' },
                { done: true,  label: 'Documents Submitted' },
                { done: false, label: 'Background Check' },
                { done: false, label: 'Admin Approval' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    item.done ? 'bg-green-500 text-white' : 'border-2 border-gray-600 text-gray-600'
                  }`}>
                    {item.done ? '✓' : ''}
                  </div>
                  <span className={item.done ? 'text-gray-300' : 'text-gray-500'}>{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Typically takes 24–48 hours. You'll be notified once approved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      
      {/* Top Floating HUD Stats */}
      {stats && (
        <div className="glass-card rounded-2xl p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden z-10 border border-gray-700/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
          
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-green-500 to-emerald-700 p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <div className="h-full w-full bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">
                {stats.name.charAt(0)}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{stats.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold px-2 py-0.5 bg-white/10 text-gray-300 rounded border border-white/5 uppercase tracking-wider">{stats.vehicleModel}</span>
                <span className="text-xs text-gray-400 font-mono bg-black/50 px-2 py-0.5 rounded">{stats.vehicleNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-gray-400 mb-1">
                <Wallet size={14} /> <span className="text-[10px] font-bold tracking-widest uppercase">Earnings</span>
              </div>
              <p className="text-2xl font-black text-green-400">₹{stats.totalEarnings}</p>
            </div>
            
            <div className="h-10 border-l border-gray-700/50"></div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-gray-400 mb-1">
                <Star size={14} /> <span className="text-[10px] font-bold tracking-widest uppercase">Rating</span>
              </div>
              <p className="text-2xl font-black text-yellow-400">{stats.avgRating || '5.0'}</p>
            </div>

            <div className="h-10 border-l border-gray-700/50 hidden md:block"></div>

            <button 
              onClick={toggleAvailability}
              className={`relative overflow-hidden px-6 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-lg ${
                stats.isAvailable 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                : 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
              }`}
            >
              {stats.isAvailable ? (
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> ONLINE</span>
              ) : (
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div> OFFLINE</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Ride HUD vs Map */}
      {activeRide ? (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3">
            <div className="glass-card rounded-2xl p-6 border border-gray-700/50 shadow-2xl relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white">Live Ride</h2>
                <div className="bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                   <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                   <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">{activeRide.status.replace('_', ' ')}</span>
                </div>
              </div>
              
              <div className="bg-black/40 rounded-xl p-5 border border-gray-700/50 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 m-2"><User size={40} /></div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Passenger</p>
                <p className="text-lg font-bold text-white flex items-center gap-2">
                  {activeRide.rider.name}
                  <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-300 font-mono">⭐ 5.0</span>
                </p>
              </div>

              <div className="space-y-6 mb-8 relative">
                <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-green-500/50 to-red-500/50"></div>
                
                <div className="flex gap-4 relative z-10">
                  <div className="bg-black rounded-full p-1 border border-green-500/50 z-10 h-max mt-0.5">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pickup</p>
                    <p className="text-gray-200 text-sm font-medium mt-1 leading-relaxed">{activeRide.pickupLocation}</p>
                  </div>
                </div>

                <div className="flex gap-4 relative z-10">
                  <div className="bg-black rounded-full p-1 border border-red-500/50 z-10 h-max mt-0.5">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Dropoff</p>
                    <p className="text-gray-200 text-sm font-medium mt-1 leading-relaxed">{activeRide.dropLocation}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Distance</p>
                  <p className="text-xl font-bold text-white">{activeRide.distanceKm} <span className="text-sm font-normal text-gray-400">km</span></p>
                </div>
                <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20 text-center">
                  <p className="text-[10px] text-green-500/70 font-bold uppercase tracking-widest mb-1">Est. Fare</p>
                  <p className="text-xl font-bold text-green-400">₹{activeRide.estimatedFare}</p>
                </div>
              </div>

              <div className="mt-auto">
                {activeRide.status === 'ACCEPTED' && (
                  <button onClick={() => handleUpdateStatus('DRIVER_ARRIVED')} className="premium-btn w-full">I Have Arrived</button>
                )}
                {activeRide.status === 'DRIVER_ARRIVED' && (
                  <button onClick={() => handleUpdateStatus('ONGOING')} className="premium-btn w-full !from-green-600 !to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]">Start Trip</button>
                )}
                {activeRide.status === 'ONGOING' && (
                  <button onClick={() => handleUpdateStatus('COMPLETED')} className="premium-btn w-full !from-gray-700 !to-gray-900 flex justify-center items-center gap-2"><CheckCircle size={20}/> Complete Trip</button>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-2/3 h-[700px]">
            <div className="glass-card h-full rounded-2xl border border-gray-700/50 overflow-hidden relative shadow-2xl">
              <div className="absolute top-4 left-4 z-[400] glass-card px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Navigation</span>
              </div>
              <MapComponent pickup={[activeRide.pickupLat, activeRide.pickupLng]} dropoff={[activeRide.dropLat, activeRide.dropLng]} height="100%" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-2xl font-bold text-white">Ride Radar</h2>
             <div className="flex items-center gap-2 text-gray-400 text-sm">
               <Zap size={16} className="text-blue-500"/> Finding nearby riders...
             </div>
          </div>

          {!stats?.isAvailable ? (
            <div className="glass-card border-yellow-500/30 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 border border-yellow-500/20">
                <Clock className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">You are Offline</h3>
              <p className="text-gray-400">Go online to start receiving ride requests and earning money.</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="glass-card border-blue-500/10 p-16 rounded-2xl text-center relative overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border border-blue-500/20 animate-ping opacity-20"></div>
                <div className="absolute w-32 h-32 rounded-full border border-blue-500/30 animate-ping opacity-40" style={{animationDelay: '0.5s'}}></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">Scanning Area...</h3>
              <p className="text-gray-400 relative z-10">No immediate requests. Stay active, you're in a high-demand zone.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map(ride => (
                <div key={ride.id} className="glass-card rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] -z-10 group-hover:bg-blue-500/10 transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold">
                        {ride.rider.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{ride.rider.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">⭐ 4.9</p>
                      </div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                      <span className="text-green-400 font-bold">₹{ride.estimatedFare}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 relative">
                    <div className="absolute left-[7px] top-4 bottom-4 w-px bg-gray-700"></div>
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="w-4 h-4 rounded-full bg-black border-2 border-green-500 mt-0.5"></div>
                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{ride.pickupLocation}</p>
                    </div>
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="w-4 h-4 rounded-full bg-black border-2 border-red-500 mt-0.5"></div>
                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{ride.dropLocation}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-5">
                    <div className="bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50 flex items-center gap-1">
                      <Navigation size={12} className="text-blue-400" />
                      <span className="text-xs text-gray-300 font-medium">{ride.distanceKm} km trip</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAcceptRide(ride.id)}
                    className="w-full bg-white text-black hover:bg-blue-50 hover:text-blue-700 font-bold py-3 rounded-xl transition-colors shadow-lg text-sm"
                  >
                    Accept Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
