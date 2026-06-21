import React from 'react';
import Illustration from './Illustration';

const AuthLayout = ({ children }) => {
  return (
    <div className="app-container">
      {/* Left side: Dynamic Forms */}
      <div className="auth-content">
        <div style={{ width: '100%', maxWidth: '440px' }} className="animate-fade-in">
          <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '20px'
            }}>
              EQ
            </div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>EquiWork</h2>
          </div>
          
          {children}
          
        </div>
      </div>

      {/* Right side: Illustration & Branding */}
      <div className="auth-sidebar">
        <div className="glow-node primary"></div>
        <div className="glow-node secondary"></div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
          <Illustration />
          
          <div className="text-center" style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }} className="text-gradient">Intelligence at Work</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.6' }}>
              Connect with an AI-driven talent network that aligns skills, market shifts, and workforce growth into one clear operating picture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
