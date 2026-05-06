import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Car, LogOut, User, Sparkles, Sun, Moon, History } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-300">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
              CabBook <span style={{ color: 'var(--accent)' }}>Premium</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="relative p-2.5 rounded-xl border transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-secondary)',
              }}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-indigo-500" />
              )}
            </button>

            {user ? (
              <>
                {/* History Link */}
                <Link
                  to="/history"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{ color: 'var(--text-secondary)', background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
                >
                  <History size={15} />
                  History
                </Link>

                {/* User Badge */}
                <div
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-full"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
                >
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] rounded-full">
                    <div className="rounded-full p-1" style={{ background: 'var(--bg-main)' }}>
                      <User className="h-3.5 w-3.5" style={{ color: 'var(--text-secondary)' }} />
                    </div>
                  </div>
                  <span className="font-semibold text-sm hidden sm:block" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>
                    <Sparkles size={9} /> {user.role}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-300"
                  style={{
                    color: '#f87171',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                >
                  <LogOut size={15} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Sign In
                </Link>
                <Link to="/register" className="premium-btn text-sm" style={{ padding: '0.6rem 1.2rem' }}>
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
