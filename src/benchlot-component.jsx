import React from 'react';
import { Camera, Shield, Users } from 'lucide-react';
import './benchlot-styles.css';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-base)' }}>
      {/* Main Header */}
      <header className="main-header">
        <div className="container header-content">
          <a href="/" className="logo">BENCHLOT</a>
          <nav className="nav-links">
            <a href="/browse" className="nav-link">Browse</a>
            <a href="/sell" className="nav-link">Sell</a>
            <a href="/about" className="nav-link">About</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <header className="section">
        <div className="container">
          <h1 className="hero-title">
            A marketplace for exceptional tools
          </h1>
          <p className="hero-text">
            BENCHLOT connects Boston's finest craftsmen with quality tools, 
            bringing trust and verification to the secondary tool market.
          </p>
          <div className="button-container">
            <button className="button button-primary">
              List Your Tools
            </button>
            <button className="button button-secondary">
              Browse Collection
            </button>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="section section-alternate">
        <div className="container">
          <h2 className="hero-title text-center mb-16">
            A new standard for buying and selling tools
          </h2>
          <div className="features">
            <div className="feature">
              <Shield className="feature-icon" />
              <div>
                <h3 className="feature-title">Expert Verification</h3>
                <p className="feature-text">
                  Every tool is personally inspected and authenticated by our team of experts.
                  We verify condition, authenticity, and market value to ensure transparency.
                </p>
              </div>
            </div>
            
            <div className="feature">
              <Camera className="feature-icon" />
              <div>
                <h3 className="feature-title">Professional Documentation</h3>
                <p className="feature-text">
                  We provide professional photography and detailed condition reports
                  for every tool, giving buyers complete confidence in their purchase.
                </p>
              </div>
            </div>

            <div className="feature">
              <Users className="feature-icon" />
              <div>
                <h3 className="feature-title">Verified Community</h3>
                <p className="feature-text">
                  Our marketplace is built on trust. Every member is verified through
                  our partnership network of Boston's premier makerspaces.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
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
      </section>

      {/* CTA Section */}
      <section className="section section-alternate">
        <div className="container text-center">
          <h2 className="hero-title">Join Our Community</h2>
          <p className="feature-text mb-8">
            Experience a new standard in buying and selling quality tools.
          </p>
          <button className="button button-primary">
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3 className="footer-title">BENCHLOT</h3>
              <p className="footer-text">
                The trusted marketplace for premium tools
              </p>
            </div>
            <div>
              <h3 className="footer-title">Contact</h3>
              <p className="footer-text">hello@benchlot.com</p>
              <p className="footer-text">617-555-0123</p>
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