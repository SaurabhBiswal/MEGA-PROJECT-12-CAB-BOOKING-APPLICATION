import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import RiderDashboard from './pages/rider/RiderDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PaymentPage from './pages/Payment';
import History from './pages/History';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to home or unauthorized page
  }

  return children;
};

const DefaultRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'RIDER') return <Navigate to="/rider" replace />;
  if (user.role === 'DRIVER') return <Navigate to="/driver" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<DefaultRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/rider/*" 
                element={
                  <ProtectedRoute allowedRoles={['RIDER']}>
                    <RiderDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/driver/*" 
                element={
                  <ProtectedRoute allowedRoles={['DRIVER']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/payment/:rideId" 
                element={
                  <ProtectedRoute allowedRoles={['RIDER']}>
                    <PaymentPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute allowedRoles={['RIDER', 'DRIVER']}>
                    <History />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
