import React, { useState } from 'react';
import { Camera, Shield, Users, ChartSpline, LayoutList, BadgeCheck, CircleArrowRight, Wrench, Wallet } from 'lucide-react';
import { supabase } from './supabaseClient';
import '/Users/robertlawless/Documents/benchlot-app/src/benchlot-styles.css';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './benchlot-component.jsx';
import SurveyPage from './SurveyComponent.jsx'

const App = () => {
  return (
     <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/survey" element={<SurveyPage />} />
      </Routes>
     </>
  );
};

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const { data, error } = await supabase
        .from('waitlist')
        .insert([
          {
            email,
            signed_up_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      setSubmitStatus({
        type: 'success',
        message: 'Thanks for joining! We\'ll keep you updated.'
      });
      setEmail('');
      
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message === 'duplicate key value violates unique constraint' 
          ? 'This email is already on our waitlist!'
          : 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-base)' }}>
      {/* Header */}
      <header className="main-header">
        <div className="header-content">
          <a href='MainLayout' className="logo">BENCHLOT</a>
        </div>
      </header>
      
      {/* Hero Section with Form */}
      <section className="section">
        <div className="container">
          <h1 className="hero-title text-center">
          The marketplace for woodworkers
          </h1>
          <p className="hero-text text-center">
          Buy and sell new, used, and vintage tools
          </p>

          <div className="email-form">
            <div className="form-header">
              <h3 className="feature-title">Join the waitlist</h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : 'Join Now'}
                </button>
              </div>

              {submitStatus.message && (
                <div className={`submit-status ${submitStatus.type}`}>
                  {submitStatus.message}
                </div>
              )}
            </form>
         <p className="form-text">We're building the new standard for buying and selling tools</p>
            </div>
            </div>
            </section>
      {/* Features */}
      <section className="section section-alternate">
        <div className="container">
          <h2 className="hero-title text-center mb-16">
            Purpose built for buying and selling tools
          </h2>
          <div className="features">
            <div className="feature">
            <BadgeCheck className="feature-icon" />
              <div>
                <h3 className="feature-title">Authentication</h3>
                <p className="feature-text">
                  We verify condition, authenticity, and market value to ensure transparency.
                </p>
              </div>
            </div>
            
            <div className="feature">
              <ChartSpline className="feature-icon" />
              <div>
                <h3 className="feature-title">Price Transparency</h3>
                <p className="feature-text">
                  Price reporting and trends from real transactions, giving you confidence in every transaction.
                </p>
              </div>
            </div>

            <div className="feature">
              <LayoutList className="feature-icon" />
              <div>
                <h3 className="feature-title">Free to list</h3>
                <p className="feature-text">
                Tell us what you’re selling and we’ll help you list it, price it, and get it in front of a community of makers.
                </p>
              </div>
            </div>

            <div className="feature">
              <Users className="feature-icon" />
              <div>
                <h3 className="feature-title">Knowledgeable Community</h3>
                <p className="feature-text">
                  Bringing together a dedicated community of craftspeople who understand the value of a quality tool.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section 
      <section className="section section-accent">
        <div className="container">
          <h2 className="hero-title text-center">Trusted by Boston's Maker Community</h2>
          <p className="feature-text text-center mb-16">
            We've partnered with the region's leading makerspaces and craft institutions
            to build a marketplace that serves their communities.
          </p>
          <div className="partner-grid">
            {['Artisans Asylum', 'The Maker Guild', 'Boston Woodworkers', 'Makers Junction'].map((space) => (
              <div key={space} className="partner-card">
                {space}
              </div>
            ))}
          </div>
        </div>
      </section>*/}

      {/* CTA Section */}
      <section className="section section-signup">
        <div className="container text-center">
        <section className="section">
        <div className="container">
          <div className="email-form">
            <div className="form-header">
              <h3 className="feature-title">Join the waitlist</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <div>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : 'Join Now'}
                </button>
                </div>
              </div>

              {submitStatus.message && (
                <div className={`submit-status ${submitStatus.type}`}>
                  {submitStatus.message}
                </div>
              )}
            </form>
            <p className="form-text">Benchlot is the online marketplace dedicated to buying and selling new, used, and vintage tools.</p>
            </div>
            </div>
            </section>
        </div>
      </section>
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3 className="footer-title">Benchlot</h3>
              <p className="footer-text">
                The trusted marketplace for tools
              </p>
            </div>
            <div>
              <h3 className="footer-title">Contact</h3>
              <p className="footer-text">hello@benchlot.com</p>
              <p className="footer-text">781-960-3998</p>
            </div>
            <div>
              <h3 className="footer-title">Location</h3>
              <p className="footer-text">Greater Boston Area</p>
            </div>
          </div>
          </div>
      </footer>
    </div>
  ); 
}