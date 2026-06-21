import React from 'react';
import { Construction } from 'lucide-react';

const SkeletonPage = ({ title, description }) => {
  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '80px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ padding: '24px', background: 'rgba(0,210,255,0.1)', borderRadius: '50%', marginBottom: '24px', display: 'inline-flex' }}>
        <Construction size={48} color="var(--accent-blue)" />
      </div>
      <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '500px', lineHeight: 1.6 }}>
        {description || "This module is currently under development in the prototype phase."}
      </p>
      <button className="btn-primary mt-8" style={{ width: 'auto' }} onClick={() => window.history.back()}>
        Go Back
      </button>
    </div>
  );
};

export default SkeletonPage;
