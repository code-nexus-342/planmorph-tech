import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import PricingPage from './pages/PricingPage';
import QuoteRequestPage from './pages/QuoteRequestPage';
import SupportPage from './pages/SupportPage';
import CareersPage from './pages/CareersPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import TalentDashboard from './pages/admin/TalentDashboard';
import SupportDashboard from './pages/admin/SupportDashboard';
import ForgotPasswordPage from './pages/admin/ForgotPasswordPage';
import ResetPasswordPage from './pages/admin/ResetPasswordPage';
import SignupPage from './pages/admin/SignupPage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Public Routes with Navbar */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="flex-1 pt-20 sm:pt-24">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/quote" element={<QuoteRequestPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/careers" element={<CareersPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />

          {/* Admin Routes without Navbar */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/signup" element={<SignupPage />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/talent" 
            element={
              <ProtectedRoute>
                <TalentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/support" 
            element={
              <ProtectedRoute>
                <SupportDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
