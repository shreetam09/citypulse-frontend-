import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { User, Shield, Wrench, ArrowRight, Building2, CheckCircle2, KeyRound, Phone, MapPin, Mail, AlertCircle } from 'lucide-react';
import { INDIA_CITIES } from '../lib/india-cities.js';
import { customFetch } from '@workspace/api-client-react';

export function LoginPage() {
  const [, setLocation] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('citizen'); // 'citizen' | 'operator' | 'officer'
  const [city, setCity] = useState('mumbai');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error' | 'success'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const selectedCity = INDIA_CITIES[city] || INDIA_CITIES.mumbai;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      if (isRegister) {
        // Register Citizen
        const regData = await customFetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || 'Citizen User',
            email,
            phone: phone || '+919876543210',
            password
          })
        });

        // Auto login after registration
        const loginData = await customFetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        localStorage.setItem('cp_access_token', loginData.accessToken);
        if (loginData.refreshToken) {
          localStorage.setItem('cp_refresh_token', loginData.refreshToken);
        }
        localStorage.setItem('cp_citizen_auth', 'true');
        setStatus('success');
        setTimeout(() => setLocation('/portal'), 500);
      } else {
        // Login
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
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.data?.message || (isRegister ? 'Registration failed. Email may already exist.' : 'Invalid email or password'));
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
          <h2>{isRegister ? 'Create Citizen Account' : 'Municipal Access Portal'}</h2>
          <p>{isRegister ? 'Register your account to report and track civic issues' : 'Select your city & role to access Indian civic services'}</p>
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

        {/* Mode Toggle (Sign In / Register) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--muted, #f1f5f9)', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: !isRegister ? '600' : '400',
              background: !isRegister ? '#fff' : 'transparent',
              boxShadow: !isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => { setIsRegister(false); setErrorMsg(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: isRegister ? '600' : '400',
              background: isRegister ? '#fff' : 'transparent',
              boxShadow: isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => { setIsRegister(true); setRole('citizen'); setErrorMsg(''); }}
          >
            Register (Citizen)
          </button>
        </div>

        {/* Role Tabs (Only for login) */}
        {!isRegister && (
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
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="login-form">
          {status === 'error' && (
            <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '14px', background: '#fef2f2', border: '1px solid #fee2e2', padding: '10px 14px', borderRadius: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {isRegister && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={16} />
                  <input 
                    type="text" 
                    placeholder="Ravi Kumar" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={16} />
                  <input 
                    type="tel" 
                    placeholder="+919876543210" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
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
            <label>Password</label>
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
              <span><CheckCircle2 size={18} /> Processing...</span>
            ) : isRegister ? (
              <span>Create Account & Continue <ArrowRight size={16} /></span>
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
