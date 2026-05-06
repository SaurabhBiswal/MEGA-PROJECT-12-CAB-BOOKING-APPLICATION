import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Mail, Lock, Phone, User, Truck, Sparkles } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'RIDER',
    vehicleNumber: '', vehicleModel: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(formData);
      if (user.role === 'RIDER') navigate('/rider');
      else if (user.role === 'DRIVER') navigate('/driver');
    } catch (error) {
      // handled via toast
    } finally {
      setLoading(false);
    }
  };

  const isDriver = formData.role === 'DRIVER';

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-10">
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-4 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.4)] mb-5">
            <Car className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Join <span className="text-blue-400">CabBook</span></h1>
          <p className="text-gray-400 mt-2 font-light">Create your free account today</p>
        </div>

        {/* Role Toggle */}
        <div className="flex gap-3 mb-6">
          {['RIDER', 'DRIVER'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFormData({ ...formData, role: r })}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 border ${
                formData.role === r
                  ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                  : 'bg-white/5 text-gray-400 border-gray-700/50 hover:border-gray-600'
              }`}
            >
              {r === 'RIDER' ? <User size={16} /> : <Truck size={16} />}
              {r === 'RIDER' ? 'I\'m a Rider' : 'I\'m a Driver'}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <input type="text" name="name" required placeholder="Saurabh Biswal"
                    className="premium-input pl-10 text-sm" value={formData.name} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <input type="email" name="email" required placeholder="you@email.com"
                    className="premium-input pl-10 text-sm" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Password + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-500" />
                  </div>
                  <input type="password" name="password" required placeholder="••••••••"
                    className="premium-input pl-10 text-sm" value={formData.password} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-500" />
                  </div>
                  <input type="tel" name="phone" placeholder="9876543210"
                    className="premium-input pl-10 text-sm" value={formData.phone} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Driver-only fields */}
            {isDriver && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 space-y-4 mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={14} className="text-blue-400" />
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Vehicle Details</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">Vehicle Number</label>
                    <input type="text" name="vehicleNumber" required={isDriver} placeholder="DL 01 AB 1234"
                      className="premium-input text-sm" value={formData.vehicleNumber} onChange={handleChange} />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">Vehicle Model</label>
                    <input type="text" name="vehicleModel" required={isDriver} placeholder="Swift Dzire"
                      className="premium-input text-sm" value={formData.vehicleModel} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="premium-btn w-full flex justify-center items-center gap-2 text-base mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><Sparkles size={18} /> Create Account</>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign In →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
