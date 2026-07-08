import React, { useState } from 'react';
import { Shield, User, HeartPulse, Building2, Key, Check, Smartphone, AlertCircle, Lock, ArrowRight, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { apiStub } from '../services/apiStub';

export default function Login({ onLogin, language, t }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState('citizen'); // 'citizen' | 'doctor' | 'govt'
  const [showPassword, setShowPassword] = useState(false);

  // Login form states
  const [username, setUsername] = useState(''); // can be ABHA ID, contact, License, or Govt ID
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Citizen registration states
  const [registerForm, setRegisterForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    dob: '',
    blood_group: 'O+',
    height: '',
    weight: '',
    contact: '',
    address: '',
    district: '',
    state: '',
    emergency_contact: '',
    existing_conditions: '',
    allergies: '',
    password: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('All fields are required.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const user = await apiStub.login(username.trim(), password, role);
      setLoading(false);
      onLogin(user);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || t.login.authError);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const user = await apiStub.register(registerForm);
      setLoading(false);
      onLogin(user);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Registration failed. Check details.');
    }
  };

  const handleRegisterFieldChange = (field, val) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: val
    }));
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      minHeight: '680px',
      backgroundColor: 'var(--surface)',
      borderRadius: '24px',
      boxShadow: '0 20px 50px rgba(11, 34, 64, 0.15)',
      border: '1px solid var(--surface-border)',
      display: 'flex',
      overflow: 'hidden',
      alignSelf: 'center',
      margin: '0 auto'
    }} className="animate-scale-in">
      
      {/* Left Pane - Branding & Stats (Hidden on mobile) */}
      <div style={{
        flex: 1.1,
        background: 'linear-gradient(135deg, #0b2240 0%, #17253a 50%, #1e293b 100%)',
        padding: '48px',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }} className="hide-mobile">
        {/* Subtle Background Mesh Details */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197,160,89,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Brand Identity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ width: '42px', height: '56px', flexShrink: 0 }}>
              <svg viewBox="0 0 100 135" fill="none" style={{ width: '100%', height: '100%' }}>
                <ellipse cx="50" cy="115" rx="35" ry="10" fill="var(--gov-gold)" />
                <rect x="25" y="105" width="50" height="10" fill="var(--gov-gold)" />
                <circle cx="50" cy="105" r="5" fill="#ffffff" />
                <circle cx="50" cy="105" r="7" stroke="#0b2240" strokeWidth="2" />
                <path d="M 28,103 Q 22,95 25,105 Z" fill="var(--gov-gold)" />
                <path d="M 72,103 Q 78,95 75,105 Z" fill="var(--gov-gold)" />
                <path d="M 32,50 C 32,30 68,30 68,50 C 68,80 65,105 50,105 C 35,105 32,80 32,50 Z" fill="var(--gov-gold)" />
                <path d="M 30,52 C 22,50 20,62 30,68 Z" fill="var(--gov-gold)" />
                <path d="M 70,52 C 78,50 80,62 70,68 Z" fill="var(--gov-gold)" />
                <path d="M 40,42 L 50,22 L 60,42 L 50,48 Z" fill="#ffffff" opacity="0.3" />
              </svg>
            </div>
            <div>
              <h1 style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.04em',
                lineHeight: 1.1,
                color: 'var(--gov-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {t.brand.title}
              </h1>
              <p style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: '3px'
              }}>
                {t.brand.subtitle}
              </p>
            </div>
          </div>

          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            lineHeight: 1.25,
            marginBottom: '16px',
            background: 'linear-gradient(to right, #ffffff, #e2e8f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {language === 'en' ? 'Unified Lifelong Health Records' : 'एकीकृत आजीवन स्वास्थ्य रिकॉर्ड'}
          </h2>
          
          <p style={{
            color: '#94a3b8',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '40px'
          }}>
            {t.brand.inspired}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'rgba(197,160,89,0.15)', padding: '10px', borderRadius: '12px', color: 'var(--gov-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                  {language === 'en' ? 'ABHA Integrated Identity' : 'आभा एकीकृत पहचान'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  {language === 'en' ? 'Encrypted health lock compliance with ABDM standards.' : 'ABDM मानकों के अनुरूप एन्क्रिप्टेड डिजिटल हेल्थ लॉक.' }
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'rgba(0,128,55,0.15)', padding: '10px', borderRadius: '12px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartPulse size={18} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                  {language === 'en' ? 'Clinical Decision Desk' : 'नैदानिक निर्णय डेस्क'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  {language === 'en' ? 'Enables clinical practitioners to retrieve structured history in seconds.' : 'चिकित्सकों को कुछ ही सेकंड में संरचित इतिहास प्राप्त करने में सक्षम बनाता है।'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted Stats */}
        <div style={{
          display: 'flex',
          gap: '24px',
          paddingTop: '32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-gold)' }}>50+ Profiles</p>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {language === 'en' ? 'Live DB Patients' : 'सक्रिय डेटाबेस रोगी'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>100% Data-Driven</p>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {language === 'en' ? 'Real Queries' : 'वास्तविक डेटाबेस प्रश्न'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane - Form Card Area */}
      <div style={{
        flex: 0.9,
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isRegistering ? 'flex-start' : 'center',
        backgroundColor: 'var(--surface)',
        overflowY: 'auto',
        maxHeight: '90vh'
      }}>
        {/* Responsive Logo (Mobile only) */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px', marginBottom: '24px' }} className="show-mobile">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-navy)' }}>{t.brand.title}</h1>
        </div>

        <div>
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
            <Lock size={12} /> <span>{t.brand.gateway}</span>
          </span>
          
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            marginBottom: '24px'
          }}>
            {isRegistering ? t.login.registerTitle : t.login.title}
          </h3>

          {/* Role selector tabs (Only if not registering) */}
          {!isRegistering && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginBottom: '24px'
            }}>
              {[
                { id: 'citizen', label: t.roles.citizen, icon: <User size={16} /> },
                { id: 'doctor', label: t.roles.doctor, icon: <HeartPulse size={16} /> },
                { id: 'govt', label: t.roles.govt, icon: <Building2 size={16} /> }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setRole(r.id); setErrorMsg(''); }}
                  style={{
                    padding: '12px 6px',
                    border: '1.5px solid ' + (role === r.id ? 'var(--gov-navy)' : 'var(--surface-border)'),
                    background: role === r.id ? 'rgba(11,34,64,0.04)' : 'white',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: role === r.id ? 'var(--gov-navy)' : 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          )}

          {errorMsg && (
            <div style={{
              display: 'flex',
              gap: '10px',
              padding: '14px',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: 'var(--danger)',
              fontSize: '0.8rem',
              marginBottom: '20px',
              alignItems: 'center'
            }} className="animate-scale-in">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {isRegistering ? (
            /* Citizen Registration Form */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.fullName}</label>
                  <input type="text" className="form-control" value={registerForm.name} onChange={e => handleRegisterFieldChange('name', e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.dob}</label>
                  <input type="date" className="form-control" value={registerForm.dob} onChange={e => {
                    handleRegisterFieldChange('dob', e.target.value);
                    if(e.target.value) {
                      const dobYear = new Date(e.target.value).getFullYear();
                      const currYear = new Date().getFullYear();
                      handleRegisterFieldChange('age', currYear - dobYear);
                    }
                  }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.gender}</label>
                  <select className="form-control" value={registerForm.gender} onChange={e => handleRegisterFieldChange('gender', e.target.value)}>
                    <option value="Male">{language === 'en' ? 'Male' : 'पुरुष'}</option>
                    <option value="Female">{language === 'en' ? 'Female' : 'महिला'}</option>
                    <option value="Other">{language === 'en' ? 'Other' : 'अन्य'}</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.bloodGroup}</label>
                  <select className="form-control" value={registerForm.blood_group} onChange={e => handleRegisterFieldChange('blood_group', e.target.value)}>
                    {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.age}</label>
                  <input type="number" className="form-control" value={registerForm.age} onChange={e => handleRegisterFieldChange('age', e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.height}</label>
                  <input type="number" className="form-control" value={registerForm.height} onChange={e => handleRegisterFieldChange('height', e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.weight}</label>
                  <input type="number" className="form-control" value={registerForm.weight} onChange={e => handleRegisterFieldChange('weight', e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.mobileNumber}</label>
                  <input type="tel" className="form-control" placeholder="e.g. 9876543210" value={registerForm.contact} onChange={e => handleRegisterFieldChange('contact', e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.emergencyContact}</label>
                  <input type="tel" className="form-control" value={registerForm.emergency_contact} onChange={e => handleRegisterFieldChange('emergency_contact', e.target.value)} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t.login.address}</label>
                <input type="text" className="form-control" value={registerForm.address} onChange={e => handleRegisterFieldChange('address', e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.district}</label>
                  <input type="text" className="form-control" value={registerForm.district} onChange={e => handleRegisterFieldChange('district', e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.state}</label>
                  <input type="text" className="form-control" value={registerForm.state} onChange={e => handleRegisterFieldChange('state', e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.existingConditions}</label>
                  <input type="text" className="form-control" placeholder="e.g. Diabetes, Hypertension" value={registerForm.existing_conditions} onChange={e => handleRegisterFieldChange('existing_conditions', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.allergies}</label>
                  <input type="text" className="form-control" placeholder="e.g. Penicillin, Dust" value={registerForm.allergies} onChange={e => handleRegisterFieldChange('allergies', e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t.login.password}</label>
                <input type="password" className="form-control" value={registerForm.password} onChange={e => handleRegisterFieldChange('password', e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '14px', borderRadius: '12px', backgroundColor: 'var(--gov-navy)' }} disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" size={18} /> : t.login.registerBtn}
              </button>

              <button type="button" className="btn btn-secondary" onClick={() => { setIsRegistering(false); setErrorMsg(''); }} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 700, padding: 0, marginTop: '8px', cursor: 'pointer' }}>
                {t.login.loginLink}
              </button>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  {role === 'citizen' ? (language === 'en' ? 'ABHA Health ID / Mobile Number' : 'आभा हेल्थ आईडी / मोबाइल नंबर') : 
                   role === 'doctor' ? t.login.licenseLabel : t.login.govtLabel}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={role === 'citizen' ? t.login.abhaPlaceholder : (role === 'doctor' ? 'e.g. MCI-98472-A' : 'e.g. GOV-IND-4820')}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  style={{ fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.login.passLabel}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder={t.login.passPlaceholder}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px', padding: '14px', borderRadius: '12px', gap: '8px', fontSize: '1rem', backgroundColor: 'var(--gov-navy)' }}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <>
                    <Check size={18} />
                    <span>{t.login.verifyLogin}</span>
                  </>
                )}
              </button>

              {role === 'citizen' && (
                <button type="button" className="btn btn-secondary" onClick={() => { setIsRegistering(true); setErrorMsg(''); }} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 700, padding: 0, marginTop: '8px', cursor: 'pointer' }}>
                  {t.login.registerLink}
                </button>
              )}
            </form>
          )}
        </div>

        {/* Disclaimer footer */}
        <div style={{
          marginTop: '32px',
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: '1.5',
          paddingTop: '20px',
          borderTop: '1px solid var(--surface-border)'
        }}>
          {t.login.disclaimer}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
