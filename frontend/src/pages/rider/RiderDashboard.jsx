import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import MapComponent from '../../components/MapComponent';
import { MapPin, Navigation, Compass, ShieldCheck, Zap, Car, X, Clock, Search } from 'lucide-react';

// ─── Autocomplete Input (Uber-style) ────────────────────────────────────────
const LocationInput = ({ label, placeholder, icon: Icon, iconColor, value, onChange, onSelect, coords }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 3) { setSuggestions([]); return; }
    setLoadingSuggestions(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=6&addressdetails=1`
      );
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (e) { console.error(e); }
    finally { setLoadingSuggestions(false); }
  }, []);

  const handleChange = (val) => {
    onChange(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(val), 400);
  };

  const handleSelect = (item) => {
    const coords = [parseFloat(item.lat), parseFloat(item.lon)];
    const name = item.display_name.split(',').slice(0, 3).join(', ');
    onChange(name);
    onSelect(coords, name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="block text-[11px] font-bold tracking-widest text-gray-400 uppercase ml-1">{label}</label>
      <div className="relative group/input">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="premium-input pl-12 pr-10"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          autoComplete="off"
        />
        {coords && (
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full shadow-[0_0_8px] ${iconColor === 'text-green-400' ? 'bg-green-500 shadow-green-500' : 'bg-blue-500 shadow-blue-500'}`}></div>
        )}
        {value && (
          <button
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            onClick={() => { onChange(''); onSelect(null, ''); setSuggestions([]); }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-gray-700/70 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          {loadingSuggestions && (
            <div className="px-4 py-3 flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-3 h-3 border border-gray-500 border-t-blue-400 rounded-full animate-spin"></div>
              Searching...
            </div>
          )}
          {suggestions.map((item, i) => (
            <button
              key={i}
              className="w-full text-left px-4 py-3.5 hover:bg-white/5 flex items-start gap-3 border-b border-gray-800/50 last:border-0 transition-colors"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
            >
              <div className="bg-gray-800 p-1.5 rounded-lg mt-0.5 flex-shrink-0">
                <MapPin size={14} className="text-gray-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">
                  {item.display_name.split(',')[0]}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {item.display_name.split(',').slice(1, 4).join(',')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main RiderDashboard ─────────────────────────────────────────────────────
const RiderDashboard = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const navigate = useNavigate();

  // Auto-detect user's location as pickup
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setPickupCoords([lat, lng]);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
          const data = await res.json();
          const short = data.display_name?.split(',').slice(0, 3).join(', ');
          setPickupLocation(short || 'Your Location');
        } catch { setPickupLocation('Your Location'); }
      }, () => console.warn("Location denied"));
    }
  }, []);

  // Fetch active ride
  useEffect(() => {
    const fetchActiveRide = async () => {
      try {
        const response = await api.get('/rides/my-rides');
        const ongoing = response.data.find(r =>
          ['REQUESTED', 'ACCEPTED', 'DRIVER_ARRIVED', 'ONGOING'].includes(r.status)
        );
        if (ongoing) setActiveRide(ongoing);
      } catch (e) { console.error(e); }
    };
    fetchActiveRide();
  }, []);

  // Map click handlers
  const handleMapPickup = useCallback((coords, name) => {
    setPickupCoords(coords);
    if (name) setPickupLocation(name);
  }, []);

  const handleMapDropoff = useCallback((coords, name) => {
    setDropCoords(coords);
    if (name) setDropLocation(name);
  }, []);

  // Haversine formula for exact distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  const distanceEstimate = calculateDistance(pickupCoords?.[0], pickupCoords?.[1], dropCoords?.[0], dropCoords?.[1]);
  const fareEstimate = distanceEstimate > 0 ? Math.round(50 + (parseFloat(distanceEstimate) * 15)) : 0;

  const handleBookRide = async (e) => {
    e.preventDefault();
    if (!pickupCoords || !dropCoords) {
      toast.error("Please set both pickup and drop locations!");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/rides/book', {
        pickupLocation, pickupLat: pickupCoords[0], pickupLng: pickupCoords[1],
        dropLocation, dropLat: dropCoords[0], dropLng: dropCoords[1]
      });
      toast.success("🚗 Ride requested!");
      setActiveRide(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book ride");
    } finally {
      setLoading(false);
    }
  };

  // ── ACTIVE RIDE VIEW ──
  if (activeRide) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="glass-card rounded-2xl p-8 border border-gray-700/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-3xl font-extrabold text-white">Active Ride</h2>
            <div className="bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-sm font-bold text-blue-400 tracking-wider uppercase">{activeRide.status.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 relative z-10">
            <div className="w-full lg:w-5/12 space-y-6">
              <div className="bg-black/40 border border-gray-700/50 p-6 rounded-2xl space-y-5">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500/20 p-2 rounded-full border border-green-500/30"><MapPin className="text-green-400" size={20} /></div>
                  <div>
                    <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Pickup</p>
                    <p className="font-medium text-gray-200 mt-0.5 text-sm">{activeRide.pickupLocation}</p>
                  </div>
                </div>
                <div className="ml-5 border-l-2 border-dashed border-gray-700 h-8"></div>
                <div className="flex items-start gap-4">
                  <div className="bg-red-500/20 p-2 rounded-full border border-red-500/30"><Navigation className="text-red-400" size={20} /></div>
                  <div>
                    <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Dropoff</p>
                    <p className="font-medium text-gray-200 mt-0.5 text-sm">{activeRide.dropLocation}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 border border-gray-700/50 p-5 rounded-2xl text-center">
                  <Compass className="text-gray-400 mb-2 mx-auto opacity-50" size={20} />
                  <p className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Distance</p>
                  <p className="text-2xl font-bold text-white mt-1">{activeRide.distanceKm} <span className="text-sm text-gray-400">km</span></p>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/20 p-5 rounded-2xl text-center">
                  <Zap className="text-blue-400 mb-2 mx-auto" size={20} />
                  <p className="text-[11px] font-bold tracking-widest text-blue-400/70 uppercase">Fare</p>
                  <p className="text-2xl font-bold text-white mt-1">₹{activeRide.estimatedFare}</p>
                </div>
              </div>

              {activeRide.status === 'COMPLETED' && (
                <button onClick={() => navigate(`/payment/${activeRide.id}`)} className="premium-btn w-full">Complete Payment</button>
              )}
            </div>
            <div className="w-full lg:w-7/12 h-[500px] rounded-2xl overflow-hidden border border-gray-700/50">
              <MapComponent pickup={[activeRide.pickupLat, activeRide.pickupLng]} dropoff={[activeRide.dropLat, activeRide.dropLng]} height="100%" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── BOOKING VIEW ──
  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="text-center mb-10 mt-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
          Where to?
        </h1>
        <p className="text-gray-400 mt-3 flex items-center justify-center gap-2">
          <ShieldCheck size={18} className="text-blue-500" /> Search an address or click on the map to set your locations
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Booking Panel */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="glass-card rounded-3xl p-7 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl"></div>

            <form onSubmit={handleBookRide} className="space-y-5 relative z-10">
              {/* Map interaction hint */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-blue-300 font-medium">
                <Clock size={14} />
                Tip: Search below OR click directly on the map to set locations
              </div>

              <LocationInput
                label="Pickup Location"
                placeholder="Search your pickup address..."
                icon={MapPin}
                iconColor="text-green-400"
                value={pickupLocation}
                onChange={setPickupLocation}
                onSelect={handleMapPickup}
                coords={pickupCoords}
              />

              <div className="flex justify-center -my-2 relative z-20">
                <button
                  type="button"
                  onClick={() => {
                    const tmpC = pickupCoords; const tmpL = pickupLocation;
                    setPickupCoords(dropCoords); setPickupLocation(dropLocation);
                    setDropCoords(tmpC); setDropLocation(tmpL);
                  }}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full p-2 shadow-lg transition-colors"
                  title="Swap locations"
                >
                  <Navigation className="h-4 w-4 text-gray-400 rotate-180" />
                </button>
              </div>

              <LocationInput
                label="Drop-off Destination"
                placeholder="Search your destination..."
                icon={Navigation}
                iconColor="text-blue-400"
                value={dropLocation}
                onChange={setDropLocation}
                onSelect={handleMapDropoff}
                coords={dropCoords}
              />

              {/* Fare Preview */}
              {distanceEstimate > 0 && (
                <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-5 rounded-2xl border border-blue-500/20 flex justify-between items-center relative overflow-hidden">
                  <div>
                    <p className="text-xs text-blue-300 font-bold tracking-widest uppercase">Estimated Fare</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Compass size={12} /> {distanceEstimate} km · {Math.round(parseFloat(distanceEstimate) * 2.5)} min
                    </p>
                  </div>
                  <p className="text-3xl font-black text-white">₹{fareEstimate}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !pickupCoords || !dropCoords}
                className="premium-btn w-full flex justify-center items-center gap-2 text-lg"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><Car size={20} /> Request Ride</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map Panel */}
        <div className="flex-grow">
          <div className="glass-card rounded-3xl p-2 border border-gray-700/50 shadow-2xl relative overflow-hidden" style={{ height: '580px' }}>
            {/* Map hint overlay when no pickup */}
            {!pickupCoords && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/50 backdrop-blur-sm rounded-3xl">
                <Search className="text-gray-500 animate-bounce mb-4" size={40} />
                <p className="text-gray-300 font-medium">Fetching your current location...</p>
              </div>
            )}

            {/* Interactive instruction */}
            {pickupCoords && !dropCoords && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl">
                🖱️ Click on map to set drop-off location
              </div>
            )}

            <div className="h-full w-full rounded-[1.25rem] overflow-hidden">
              <MapComponent
                pickup={pickupCoords}
                dropoff={dropCoords}
                height="100%"
                interactive={true}
                onPickup={handleMapPickup}
                onDropoff={handleMapDropoff}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RiderDashboard;
