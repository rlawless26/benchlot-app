// src/App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Existing components
import LandingPage from './Pages/benchlot-component.jsx';
import SurveyPage from './Pages/SurveyComponent.jsx';
import ProductPage from './Pages/ProductPage.jsx';
import LandingPage2 from './Pages/LandingPage.jsx';
import MarketplacePage from './Pages/MarketplacePage';
import ToolDetailPage from './Pages/ToolDetailPage';
import ToolListingForm from './components/ToolListingForm';
import UserProfile from './components/UserProfile';
import AuthPage from './Pages/AuthPage';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on page load
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/2" element={<LandingPage2 />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/tool/:id" element={<ToolDetailPage />} />
        <Route path="/listtool" element={<ToolListingForm />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
      </Routes>
    
  );
}

export default App;