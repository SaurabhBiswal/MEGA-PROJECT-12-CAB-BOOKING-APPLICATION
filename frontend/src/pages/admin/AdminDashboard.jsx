import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Car, Shield, CheckCircle, XCircle, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes, driversRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/drivers/pending'),
        api.get('/admin/drivers'),
      ]);
      setStats(statsRes.data);
      setPendingDrivers(pendingRes.data);
      setAllDrivers(driversRes.data);
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
  ];

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <Shield size={28} className="text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Admin Control Centre</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage drivers, verify identities, and monitor the platform</p>
        </div>
        {pendingDrivers.length > 0 && (
          <div className="ml-auto bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
            <AlertTriangle size={16} />
            {pendingDrivers.length} driver{pendingDrivers.length > 1 ? 's' : ''} awaiting review
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 glass-card p-1.5 rounded-2xl w-max" style={{ border: '1px solid var(--card-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
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
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="#3b82f6" />
            <StatCard icon={Car} label="Total Drivers" value={stats.totalDrivers} color="#22c55e" />
            <StatCard icon={Activity} label="Total Rides" value={stats.totalRides} color="#8b5cf6" />
            <StatCard icon={CheckCircle} label="Completed Rides" value={stats.completedRides} color="#f59e0b" />
          </div>
          <div className="glass-card rounded-2xl p-8 text-center" style={{ border: '1px solid var(--card-border)' }}>
            <p style={{ color: 'var(--text-muted)' }}>More analytics coming soon — Rides graph, Revenue charts, Driver heatmaps</p>
          </div>
        </div>
      )}

      {/* Pending Verification Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
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

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-600 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {driver.user?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{driver.user?.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{driver.user?.email} · {driver.user?.phone}</p>
                    <div className="flex gap-3 mt-2 flex-wrap">
                      <span className="text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                        🚗 {driver.vehicleModel || 'N/A'}
                      </span>
                      <span className="text-[11px] font-bold bg-white/5 px-2.5 py-1 rounded-lg border font-mono"
                        style={{ color: 'var(--text-primary)', borderColor: 'var(--card-border)' }}>
                        {driver.vehicleNumber}
                      </span>
                      {driver.licenseNumber && (
                        <span className="text-[11px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
                          📋 Licence: {driver.licenseNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pl-3 md:pl-0">
                  <button
                    onClick={() => handleVerify(driver.id, false)}
                    disabled={actionLoading === driver.id}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                  >
                    <XCircle size={16} /> Reject
                  </button>
                  <button
                    onClick={() => handleVerify(driver.id, true)}
                    disabled={actionLoading === driver.id}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}
                  >
                    {actionLoading === driver.id ? (
                      <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Drivers Tab */}
      {activeTab === 'drivers' && (
        <div className="space-y-3">
          {allDrivers.map(driver => (
            <div key={driver.id} className="glass-card rounded-xl px-5 py-4 flex items-center justify-between gap-4"
              style={{ border: '1px solid var(--card-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-sm">
                  {driver.user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{driver.user?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{driver.vehicleNumber} · {driver.vehicleModel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: driver.verified ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                    color: driver.verified ? '#4ade80' : '#fbbf24',
                    border: `1px solid ${driver.verified ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`,
                  }}>
                  {driver.verified ? '✓ Verified' : '⏳ Pending'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>⭐ {driver.avgRating?.toFixed(1)}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{driver.totalRides} rides</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
