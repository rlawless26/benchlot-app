import React, { useState } from 'react';
import { Camera, Shield, Users, ChartSpline, LayoutList, BadgeCheck, CircleArrowRight, Wrench, Wallet } from 'lucide-react';
import { supabase } from '../supabaseClient';
import '../benchlot-styles.css';
import logo from '../assets/Benchlot.svg';
import { Analytics } from '@vercel/analytics/react';


const LandingPage = () => {
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
        <a href='benchlot.com' className="logo-container"> 
      <img 
        src={logo} 
        alt="Benchlot"
        className="logo-image" 
      />
    </a>
        </div>
      </header>
      
      {/* Hero Section with Form */}
      <section className="section">
        <div className="container">
          <h1 className="hero-title text-center">
          Buy and sell new and used woodworking tools
          </h1>
          <p className="hero-text text-center">
         The marketplace for woodworkers to buy and sell new, used, and vintage woodworking tools.
          </p>
          <div className="email-form">
            <div className="form-header">
              <h3 className="feature-title">Join Benchlot Today</h3>
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
                  {isSubmitting ? 'Creating Account...' : 'Sign Up'}
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
                <h3 className="feature-title">Verified Authenticity</h3>
                <p className="feature-text">
                We verify the condition, authenticity, and market value of all woodworking tools to ensure transparency and trust in every transaction.
                </p>
              </div>
            </div>
            
            <div className="feature">
              <ChartSpline className="feature-icon" />
              <div>
                <h3 className="feature-title">Transparent Pricing</h3>
                <p className="feature-text">
                Access real pricing data and market trends from actual transactions. Buy and sell with confidence knowing you're getting fair market value for your woodworking tools.
                </p>
              </div>
            </div>

            <div className="feature">
              <LayoutList className="feature-icon" />
              <div>
                <h3 className="feature-title">List Your Tools for Free</h3>
                <p className="feature-text">
                Sell your woodworking tools effortlessly. We assist you in listing, pricing, and showcasing your items to a dedicated community of woodworkers and craftsmen.
                </p>
              </div>
            </div>

            <div className="feature">
              <Users className="feature-icon" />
              <div>
                <h3 className="feature-title">Join Our Woodworking Community</h3>
                <p className="feature-text">
                Connect with passionate woodworkers and craftsmen who value quality tools. Share knowledge, get advice, and be part of a growing community.
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
              <h3 className="feature-title">Start Buying and Selling Today</h3>
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
                  {isSubmitting ? 'Joining...' : 'Join Benchlot'}
                </button>
                </div>
              </div>

              {submitStatus.message && (
                <div className={`submit-status ${submitStatus.type}`}>
                  {submitStatus.message}
                </div>
              )}
            </form>
            <p className="form-text">Benchlot is the leading online marketplace dedicated to buying and selling new, used, and vintage woodworking tools. Join us and discover the difference quality tools can make.</p>
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
<Analytics />
export default LandingPage;
