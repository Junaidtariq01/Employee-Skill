import React from 'react';
import { Brain, Network, Activity, LineChart, Cpu } from 'lucide-react';

const Illustration = () => {
  return (
    <div className="illustration-wrapper glass-panel" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
      <div className="glow-node primary" style={{ top: '-20%', right: '-20%', width: '300px', height: '300px' }}></div>
      <div className="glow-node secondary" style={{ bottom: '-20%', left: '-20%', width: '200px', height: '200px' }}></div>
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Activity color="#00d2ff" size={32} />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Network color="#3a7bd5" size={32} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <div style={{ 
            position: 'relative', 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, rgba(0,210,255,0.2) 0%, rgba(58,123,213,0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(0,210,255,0.5)',
            boxShadow: '0 0 40px rgba(0,210,255,0.2)'
          }}>
            <Brain color="#fff" size={48} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Cpu color="#3a7bd5" size={32} />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <LineChart color="#00d2ff" size={32} />
          </div>
        </div>
      </div>

      {/* Connection Lines (Abstract) */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <path d="M 80,80 Q 200,100 250,180" fill="none" stroke="rgba(0,210,255,0.3)" strokeWidth="2" strokeDasharray="5,5" />
        <path d="M 380,80 Q 300,150 250,180" fill="none" stroke="rgba(58,123,213,0.3)" strokeWidth="2" strokeDasharray="5,5" />
        <path d="M 80,350 Q 150,250 250,180" fill="none" stroke="rgba(58,123,213,0.3)" strokeWidth="2" strokeDasharray="5,5" />
        <path d="M 380,350 Q 300,250 250,180" fill="none" stroke="rgba(0,210,255,0.3)" strokeWidth="2" strokeDasharray="5,5" />
      </svg>
    </div>
  );
};

export default Illustration;
