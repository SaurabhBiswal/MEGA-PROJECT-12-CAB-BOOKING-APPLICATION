import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowLeft, Car, MapPin, Navigation } from 'lucide-react';

const stripePromise = loadStripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');

const CheckoutForm = ({ clientSecret, amount, rideId, rideDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: 'Premium Rider' },
      },
    });

    if (result.error) {
      toast.error(result.error.message);
      setLoading(false);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        try {
          await api.post(`/payments/confirm?paymentIntentId=${result.paymentIntent.id}`);
          toast.success('Payment successful!');
          navigate('/rider'); // Should navigate to receipt page eventually
        } catch (err) {
          toast.error('Payment confirmed but failed to update status');
          setLoading(false);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Payment details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
            <input type="email" placeholder="rider@example.com" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-gray-900" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
            <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-gray-400 transition-colors">
              <CardElement options={{
                style: {
                  base: {
                    fontSize: '16px',
                    fontFamily: '"Outfit", sans-serif',
                    color: '#111827',
                    '::placeholder': { color: '#9ca3af' },
                    iconColor: '#111827',
                  },
                  invalid: { color: '#ef4444', iconColor: '#ef4444' },
                },
              }}/>
            </div>
          </div>
        </div>
      </div>

      <button 
        disabled={!stripe || loading}
        className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-all shadow-xl hover:shadow-2xl flex justify-center items-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          `Pay ₹${amount}`
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
        Powered by <span className="font-bold text-indigo-600 tracking-tighter text-lg">stripe</span>
      </div>
    </form>
  );
};

const PaymentPage = () => {
  const { rideId } = useParams();
  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();

  // Mock ride details for the UI side (would fetch from API in real scenario)
  const [rideDetails] = useState({
    pickup: "EIL APPARTMENTS, SECTOR 1A DWARKA",
    dropoff: "SECTOR 12 DWARKA, NEW DELHI",
    driverName: "Ram Kumar",
    vehicle: "Toyota Innova Crysta"
  });

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const response = await api.post(`/payments/create-intent/${rideId}`);
        setClientSecret(response.data.clientSecret);
        setAmount(response.data.amount);
      } catch (error) {
        toast.error('Failed to initialize payment');
      }
    };
    fetchPaymentIntent();
  }, [rideId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8 font-sans" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      <button onClick={() => navigate(-1)} className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-colors">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Receipt & Summary (Dark Premium) */}
        <div className="w-full md:w-5/12 bg-gray-900 p-8 md:p-12 text-white relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
          
          <div className="flex items-center gap-3 mb-12 relative z-10">
            <div className="bg-white p-2 rounded-lg">
               <Car size={24} className="text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">CabBook Premium</span>
          </div>

          <div className="mb-12 relative z-10">
            <p className="text-gray-400 font-medium mb-2">Total Amount</p>
            <h1 className="text-5xl font-black">₹{amount || '---'}</h1>
          </div>

          <div className="space-y-6 flex-grow relative z-10">
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Trip Details</p>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{rideDetails.pickup}</p>
                </div>
                <div className="ml-2 border-l border-dashed border-gray-600 h-4"></div>
                <div className="flex gap-3">
                  <Navigation size={18} className="text-gray-400 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{rideDetails.dropoff}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold">
                {rideDetails.driverName.charAt(0)}
              </div>
              <div>
                <p className="font-bold">{rideDetails.driverName}</p>
                <p className="text-xs text-gray-400">{rideDetails.vehicle}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm relative z-10">
            <ShieldCheck size={16} className="text-green-400" />
            <span>Secure 256-bit SSL encryption</span>
          </div>
        </div>

        {/* Right Side: Stripe Checkout Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white">
          <div className="max-w-md mx-auto h-full flex flex-col justify-center">
            
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Checkout</h2>
              <p className="text-gray-500">Pay securely using your preferred method.</p>
            </div>

            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} amount={amount} rideId={rideId} rideDetails={rideDetails} />
              </Elements>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Initializing secure payment gateway...</p>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;
