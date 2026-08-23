import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { User, Shield, Wrench, ArrowRight, Building2, CheckCircle2, KeyRound, Phone, MapPin, Mail, AlertCircle } from 'lucide-react';
import { INDIA_CITIES } from '../lib/india-cities.js';
import { customFetch } from '@workspace/api-client-react';

export function LoginPage() {
  const [, setLocation] = useLocation();
  const [role, setRole] = useState('citizen'); // 'citizen' | 'operator' | 'officer'
  const [city, setCity] = useState('mumbai');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const selectedCity = INDIA_CITIES[city] || INDIA_CITIES.mumbai;

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    
    try {
      const data = await customFetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      localStorage.setItem('cp_access_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('cp_refresh_token', data.refreshToken);
      }
      
      const userRole = data.user?.role;
      
      if (userRole === 'OPERATOR' || userRole === 'ADMIN') {
        localStorage.setItem('cp_operator_auth', 'true');
        setLocation('/admin');
      } else if (userRole === 'FIELD_OFFICER') {
        localStorage.setItem('cp_officer_auth', 'true');
        setLocation('/officer');
      } else {
        localStorage.setItem('cp_citizen_auth', 'true');
        setLocation('/portal');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <Link href="/" className="login-brand">
            <span className="brand-mark"><span /></span>
            <span>CityPulse 🇮🇳</span>
          </Link>
          <h2>Municipal Access Portal</h2>
          <p>Select your city & role to access Indian civic services</p>
        </div>

        {/* City Selector */}
        <div className="login-city-selector">
          <label className="city-label">
            <Building2 size={16} /> Select Municipal Corporation:
          </label>
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            className="city-dropdown"
          >
            {Object.values(INDIA_CITIES).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.shortBody} ({c.body})
              </option>
            ))}
          </select>
        </div>

        {/* Role Tabs */}
        <div className="login-role-tabs">
          <button 
            type="button"
            className={`role-tab ${role === 'citizen' ? 'active' : ''}`}
            onClick={() => setRole('citizen')}
          >
            <User size={16} />
            <span>Citizen</span>
          </button>

          <button 
            type="button"
            className={`role-tab ${role === 'operator' ? 'active' : ''}`}
            onClick={() => setRole('operator')}
          >
            <Shield size={16} />
            <span>Command Center</span>
          </button>

          <button 
            type="button"
            className={`role-tab ${role === 'officer' ? 'active' : ''}`}
            onClick={() => setRole('officer')}
          >
            <Wrench size={16} />
            <span>Field Officer</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="login-form">
          {status === 'error' && (
            <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '14px', background: '#fef2f2', border: '1px solid #fee2e2', padding: '10px 14px', borderRadius: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} />
              <input 
                type="email" 
                placeholder="user@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Municipal Secure Password</label>
            <div className="input-with-icon">
              <KeyRound size={16} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={status === 'loading'}>
            {status === 'loading' ? (
              <span><CheckCircle2 size={18} /> Authenticating...</span>
            ) : (
              <span>Login to {selectedCity.shortBody} {role === 'citizen' ? 'User Portal' : role === 'operator' ? 'Command Center' : 'Field Worklist'} <ArrowRight size={16} /></span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="login-footer">
          <MapPin size={14} />
          <span>Active in {selectedCity.name}: Helpline {selectedCity.helpline}</span>
        </div>
      </div>
    </div>
  );
}
