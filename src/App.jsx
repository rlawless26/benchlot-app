import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './benchlot-component.jsx';
import SurveyPage from './SurveyComponent.jsx';
import ProductPage from './ProductPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/survey" element={<SurveyPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
    </Routes>
  );
}

export default App;