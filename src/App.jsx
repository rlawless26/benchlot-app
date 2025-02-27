import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './benchlot-component.jsx';
import SurveyPage from './SurveyComponent.jsx';
import ProductPage from './ProductPage.jsx';
import ListingForm from './ListingForm.jsx';
import { Analytics } from '@vercel/analytics/react';


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/survey" element={<SurveyPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/list-tool" element={<ListingForm />} />
    </Routes>
  );
}

export default App;