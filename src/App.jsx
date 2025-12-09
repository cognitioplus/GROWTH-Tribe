import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Landing from './pages/Landing';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import MainApp from './pages/MainApp';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <img 
            src="https://appimize.app/assets/apps/user_1097/images/2d5cb5dadead_225_1097.png" 
            alt="GROWTH Tribe Logo" 
            className="w-16 h-16 rounded-lg mx-auto mb-4 animate-pulse"
          />
          <div className="text-lg font-semibold text-emerald-600">Loading GROWTH Tribe...</div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the main app
  if (user) {
    return <MainApp />;
  }

  // If showing login form
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="https://appimize.app/assets/apps/user_1097/images/2d5cb5dadead_225_1097.png" 
              alt="GROWTH Tribe Logo" 
              className="w-16 h-16 rounded-lg mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Welcome Back to GROWTH Tribe
            </h1>
          </div>
          <LoginForm 
            onBack={() => setShowLogin(false)}
            onSwitchToSignup={() => {
              setShowLogin(false);
              setShowSignup(true);
            }}
          />
        </div>
      </div>
    );
  }

  // If showing signup form
  if (showSignup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="https://appimize.app/assets/apps/user_1097/images/2d5cb5dadead_225_1097.png" 
              alt="GROWTH Tribe Logo" 
              className="w-16 h-16 rounded-lg mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Join GROWTH Tribe
            </h1>
          </div>
          <RegisterForm 
            onBack={() => setShowSignup(false)}
            onSwitchToLogin={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
          />
        </div>
      </div>
    );
  }

  // Default: show landing page
  return (
    <Landing 
      onShowLogin={() => setShowLogin(true)}
      onShowSignup={() => setShowSignup(true)}
    />
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
