import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { History as HistoryIcon, Download, Star, MapPin, Navigation, Car } from 'lucide-react';

const History = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/rides/my-rides');
        // Only show completed/cancelled rides in history
        const historyRides = response.data.filter(r => 
          ['COMPLETED', 'CANCELLED'].includes(r.status)
        );
        setRides(historyRides.reverse()); // Newest first
      } catch (error) {
        toast.error("Failed to load ride history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const downloadReceipt = async (rideId) => {
    try {
      const response = await api.get(`/receipts/download/${rideId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${rideId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Receipt downloaded!");
    } catch (error) {
      toast.error("Failed to download receipt");
    }
  };

  const submitRating = async (rideId, rating) => {
    try {
      await api.post(`/ratings`, { rideId, rating, comment: "Great ride!" });
      toast.success("Rating submitted successfully!");
      // Realistically you'd update the UI state here to show it's rated
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit rating");
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
          <HistoryIcon className="text-blue-500" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Ride History</h1>
          <p className="text-gray-400 mt-1">Your past trips and receipts</p>
        </div>
      </div>

      {rides.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-gray-700/50 flex flex-col items-center">
          <Car size={48} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No history yet</h3>
          <p className="text-gray-400">Take your first premium ride to see it here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rides.map((ride) => (
            <div key={ride.id} className="glass-card rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] -z-10 group-hover:bg-blue-500/10 transition-colors"></div>
              
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      ride.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {ride.status}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">Trip #{ride.id.substring(0,8).toUpperCase()}</span>
                  </div>

                  <div className="space-y-4 relative">
                    <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gray-700"></div>
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-black border-2 border-green-500 flex items-center justify-center mt-0.5">
                        <MapPin size={10} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pickup</p>
                        <p className="text-sm text-gray-200 mt-0.5">{ride.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-black border-2 border-red-500 flex items-center justify-center mt-0.5">
                        <Navigation size={10} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Dropoff</p>
                        <p className="text-sm text-gray-200 mt-0.5">{ride.dropLocation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between min-w-[150px] border-t md:border-t-0 md:border-l border-gray-700/50 pt-4 md:pt-0 md:pl-6">
                  <div className="text-right w-full mb-4 md:mb-0">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Amount</p>
                    <p className="text-3xl font-black text-white">₹{ride.estimatedFare}</p>
                    <p className="text-xs text-gray-400 mt-1">{ride.distanceKm} km</p>
                  </div>
                  
                  {ride.status === 'COMPLETED' && (
                    <div className="flex flex-col gap-2 w-full">
                      <button 
                        onClick={() => downloadReceipt(ride.id)}
                        className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download size={16} /> Receipt
                      </button>
                      
                      <div className="flex items-center justify-center gap-1 bg-gray-800/50 py-2 rounded-lg border border-gray-700/50 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            onClick={() => submitRating(ride.id, star)}
                            className="text-gray-500 hover:text-yellow-400 transition-colors"
                          >
                            <Star size={18} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
