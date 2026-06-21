import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { supabase } from '../lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Fetch user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role === 'hr' || profile.role === 'admin') {
        navigate('/hr/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '36px', marginBottom: '12px' }}>Login to EquiWork</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '16px' }}>
          Enter your credentials to access the EquiWork Portal.
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} size={20} />
              <input 
                type="email" 
                className="glass-input" 
                style={{ width: '100%', paddingLeft: '48px' }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="flex justify-between items-center">
              <label className="input-label">Password</label>
              <a href="#" style={{ color: 'var(--accent-blue)', fontSize: '14px', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} size={20} />
              <input 
                type="password" 
                className="glass-input" 
                style={{ width: '100%', paddingLeft: '48px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="remember" style={{ accentColor: 'var(--accent-blue)', width: '16px', height: '16px', cursor: 'pointer' }} />
            <label htmlFor="remember" style={{ color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer' }}>Remember me</label>
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '14px' }}>{error}</div>}

          <button type="submit" className="btn-primary mt-4" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In to Portal'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 text-center" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <button 
            onClick={() => navigate('/signup')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-blue)', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Create an account
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
