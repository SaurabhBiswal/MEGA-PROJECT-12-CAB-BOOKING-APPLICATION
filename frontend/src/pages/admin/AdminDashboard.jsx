import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Car, Shield, CheckCircle, XCircle, AlertTriangle, TrendingUp, Activity, MessageSquare, Image, Eye } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass-card rounded-2xl p-6 border flex flex-col gap-3 relative overflow-hidden group hover:-translate-y-0.5 transition-transform"
    style={{ borderColor: 'var(--card-border)' }}>
    <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[60px] opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: color }}></div>
    <div className="p-2.5 rounded-xl w-max" style={{ background: `${color}20` }}>
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-3xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes, driversRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/drivers/pending'),
        api.get('/admin/drivers'),
        // api.get('/admin/complaints') // Coming soon
      ]);
      setStats(statsRes.data);
      setPendingDrivers(pendingRes.data);
      setAllDrivers(driversRes.data);
      // Simulate complaints
      setComplaints([
        { id: 1, user: 'Rahul Kumar', type: 'Rider', subject: 'Overcharged', status: 'PENDING', date: '2 mins ago' },
        { id: 2, user: 'Amit Singh', type: 'Driver', subject: 'App Crashing', status: 'RESOLVED', date: '1 hour ago' },
      ]);
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerify = async (driverId, approve) => {
    setActionLoading(driverId);
    try {
      await api.put(`/admin/drivers/${driverId}/verify?approve=${approve}`);
      toast.success(approve ? '✅ Driver Approved!' : '❌ Driver Rejected');
      fetchData(); // refresh
      setSelectedDocs(null);
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'pending', label: `Pending Review (${pendingDrivers.length})`, icon: AlertTriangle },
    { id: 'drivers', label: 'All Drivers', icon: Car },
    { id: 'support', label: 'Support Center', icon: MessageSquare },
  ];

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 relative">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <Shield size={28} className="text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Admin Control Centre</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage platform safety, verification, and support</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 glass-card p-1.5 rounded-2xl w-max overflow-x-auto" style={{ border: '1px solid var(--card-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
            style={{
              background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              boxShadow: activeTab === tab.id ? '0 0 20px var(--accent-glow)' : 'none',
            }}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="#3b82f6" />
            <StatCard icon={Car} label="Total Drivers" value={stats.totalDrivers} color="#22c55e" />
            <StatCard icon={Activity} label="Total Rides" value={stats.totalRides} color="#8b5cf6" />
            <StatCard icon={CheckCircle} label="Completed Rides" value={stats.completedRides} color="#f59e0b" />
          </div>
          <div className="glass-card rounded-3xl p-12 border border-blue-500/10 flex flex-col items-center text-center">
             <TrendingUp size={48} className="text-blue-500/20 mb-4" />
             <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Platform Insights</h3>
             <p className="max-w-md mx-auto mt-2" style={{ color: 'var(--text-muted)' }}>
               You are currently managing <b>{stats.totalDrivers} drivers</b> and <b>{stats.totalUsers} users</b>. 
               Platform growth is up 12% this month.
             </p>
          </div>
        </div>
      )}

      {/* Pending Verification Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          {pendingDrivers.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center" style={{ border: '1px solid var(--card-border)' }}>
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500 opacity-60" />
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>All Clear!</h3>
              <p style={{ color: 'var(--text-muted)' }}>No drivers pending verification.</p>
            </div>
          ) : pendingDrivers.map(driver => (
            <div key={driver.id} className="glass-card rounded-2xl p-6 border relative overflow-hidden"
              style={{ borderColor: 'rgba(234,179,8,0.2)' }}>
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 rounded-l-2xl"></div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-600 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white/10">
                    {driver.user?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{driver.user?.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{driver.user?.email} · {driver.user?.phone}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {driver.vehicleModel}
                      </span>
                      <span className="text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10 px-2.5 py-1 rounded-lg font-mono">
                        {driver.vehicleNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:ml-auto">
                   <button 
                     onClick={() => setSelectedDocs(driver)}
                     className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-white/10 hover:bg-white/5"
                     style={{ color: 'var(--text-primary)' }}
                   >
                     <Eye size={14} /> View Documents
                   </button>
                  <div className="w-px h-8 bg-white/10 hidden lg:block mx-1"></div>
                  <button
                    onClick={() => handleVerify(driver.id, false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-red-400 border border-red-500/20 hover:bg-red-500/5 transition-all"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => handleVerify(driver.id, true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-green-500 text-white shadow-lg shadow-green-500/20 hover:scale-105 transition-all"
                  >
                    <CheckCircle size={14} /> Approve Driver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="glass-card rounded-2xl p-6 border border-red-500/10 bg-red-500/5 mb-6">
             <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest mb-1">
               <AlertTriangle size={14} /> Urgent Attention
             </div>
             <p className="text-sm text-red-300/80">You have 2 unresolved complaints from riders regarding overcharging.</p>
          </div>
          
          <div className="glass-card rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--card-border)' }}>
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-white/5 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                 {complaints.map(c => (
                   <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{c.user}</p>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{c.type}</p>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{c.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                          c.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-medium">{c.date}</td>
                      <td className="px-6 py-4">
                        <button className="text-blue-400 hover:text-blue-300 text-xs font-bold transition-colors">Resolve →</button>
                      </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* Driver List Tab */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          {allDrivers.map(driver => (
            <div key={driver.id} className="glass-card rounded-2xl p-5 border flex items-center justify-between"
              style={{ border: '1px solid var(--card-border)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-500">
                  {driver.user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{driver.user?.name}</p>
                  <p className="text-[10px] font-mono text-gray-500">{driver.vehicleNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                   <span className="text-xs font-bold text-yellow-500">⭐ {driver.avgRating?.toFixed(1)}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                  driver.verified ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                }`}>
                  {driver.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DOCUMENT VIEWER MODAL */}
      {selectedDocs && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedDocs(null)}></div>
           <div className="glass-card w-full max-w-4xl rounded-3xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                 <div className="flex items-center gap-3">
                    <Image size={24} className="text-blue-500" />
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Verification Documents</h2>
                      <p className="text-xs text-gray-400">Reviewing {selectedDocs.user?.name}'s identity</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedDocs(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <XCircle size={24} className="text-gray-500" />
                 </button>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                       <Shield size={14} /> Driving Licence
                    </div>
                    <div className="aspect-[1.6/1] rounded-2xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center group relative">
                       {selectedDocs.licenseImageUrl ? (
                         <img src={selectedDocs.licenseImageUrl} alt="Licence" className="w-full h-full object-cover" />
                       ) : (
                         <div className="text-center p-6">
                            <Image size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-[10px] text-gray-600">No Image Provided<br/>(System Prototype Placeholder)</p>
                         </div>
                       )}
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-lg">Expand View</button>
                       </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Licence Number</p>
                       <p className="text-lg font-mono font-bold text-blue-400">{selectedDocs.licenseNumber || 'NOT PROVIDED'}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                       <Users size={14} /> Driver Selfie
                    </div>
                    <div className="aspect-square rounded-2xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center group relative">
                       {selectedDocs.selfieImageUrl ? (
                         <img src={selectedDocs.selfieImageUrl} alt="Selfie" className="w-full h-full object-cover" />
                       ) : (
                         <div className="text-center p-6">
                            <Users size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-[10px] text-gray-600">No Selfie Provided<br/>(System Prototype Placeholder)</p>
                         </div>
                       )}
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="text-xs font-bold text-white bg-blue-600 px-4 py-2 rounded-lg">Expand View</button>
                       </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Face Match Status</p>
                       <p className="text-xs font-bold text-green-400 flex items-center gap-1">
                          <CheckCircle size={12} /> Verification System Ready
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/10 flex gap-4">
                 <button 
                   onClick={() => handleVerify(selectedDocs.id, false)}
                   className="flex-1 py-4 rounded-2xl font-black text-sm text-red-400 border border-red-500/20 hover:bg-red-500/5 transition-all"
                 >
                   REJECT DOCUMENTS
                 </button>
                 <button 
                   onClick={() => handleVerify(selectedDocs.id, true)}
                   className="flex-[2] py-4 rounded-2xl font-black text-sm bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                   APPROVE DRIVER ACCOUNT
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
