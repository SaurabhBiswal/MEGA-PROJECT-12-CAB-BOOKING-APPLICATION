import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, User, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b-0 border-white/5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] transition-all duration-300">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                CabBook <span className="text-blue-500">Premium</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/history" className="text-gray-300 hover:text-white font-medium text-sm transition-colors">
                  Ride History
                </Link>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-full">
                    <div className="bg-black rounded-full p-1">
                      <User className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                  <span className="font-medium text-sm text-gray-200">{user.name}</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                    <Sparkles size={10} /> {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="premium-btn text-sm !py-2.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
