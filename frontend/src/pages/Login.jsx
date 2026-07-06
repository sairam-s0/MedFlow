import React, { useState } from 'react';
import { Shield, User, HeartPulse, Building2, Key, Check, Smartphone, AlertCircle, FileText, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export default function Login({ onLogin, language }) {
  const [role, setRole] = useState('citizen'); // 'citizen' | 'doctor' | 'govt'
  
  // Citizen states
  const [authMethod, setAuthMethod] = useState('abha'); // 'abha' | 'phone'
  const [abhaId, setAbhaId] = useState('QR-12345-ABCD'); // Default demo ABHA ID
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  // Doctor states
  const [licenseNumber, setLicenseNumber] = useState('MCI-98472-A');
  const [doctorPass, setDoctorPass] = useState('••••••••');
  
  // Govt states
  const [govtId, setGovtId] = useState('GOV-IND-4820');
  const [govtPass, setGovtPass] = useState('••••••••');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const t = {
    title: language === 'en' ? 'National Health Authority' : 'राष्ट्रीय स्वास्थ्य प्राधिकरण',
    subtitle: language === 'en' ? 'Ayushman Bharat Digital Mission (ABDM)' : 'आयुष्मान भारत डिजिटल मिशन (ABDM)',
    loginTitle: language === 'en' ? 'Secure Clinical Access Gateway' : 'सुरक्षित नैदानिक पहुंच गेटवे',
    roleCitizen: language === 'en' ? 'Citizen (ABHA)' : 'नागरिक (आभा)',
    roleDoctor: language === 'en' ? 'Clinical Desk' : 'नैदानिक डेस्क',
    roleGovt: language === 'en' ? 'Govt Official' : 'सरकारी अधिकारी',
    
    abhaLabel: language === 'en' ? 'Enter ABHA Number / Health ID' : 'आभा नंबर / हेल्थ आईडी दर्ज करें',
    abhaPlaceholder: 'e.g. QR-12345-ABCD',
    phoneLabel: language === 'en' ? 'Registered Mobile Number' : 'पंजीकृत मोबाइल नंबर',
    phonePlaceholder: 'e.g. 9876543210',
    otpLabel: language === 'en' ? 'Enter 6-Digit One Time Password' : '6-अंकीय वन टाइम पासवर्ड (OTP) दर्ज करें',
    sendOtp: language === 'en' ? 'Send Mock OTP' : 'मॉक ओटीपी भेजें',
    verifyLogin: language === 'en' ? 'Verify & Login' : 'सत्यापित करें और लॉगिन करें',
    
    licenseLabel: language === 'en' ? 'Clinical License Number' : 'नैदानिक लाइसेंस संख्या',
    passLabel: language === 'en' ? 'Secured Passcode / PIN' : 'सुरक्षित पासकोड / पिन',
    govtLabel: language === 'en' ? 'Ministry Reference ID' : 'मंत्रालय संदर्भ आईडी',
    
    authError: language === 'en' ? 'Invalid Health ID or Credentials' : 'अमान्य स्वास्थ्य आईडी या क्रेडेंशियल्स',
    citizenHelper: language === 'en' 
      ? 'Use sample Health ID QR-12345-ABCD (Ramesh Kumar) or QR-67890-EFGH (Sita Devi) for the simulation.'
      : 'सिमुलेशन के लिए नमूना स्वास्थ्य आईडी QR-12345-ABCD (रमेश कुमार) या QR-67890-EFGH (सीता देवी) का उपयोग करें।',
    disclaimer: language === 'en'
      ? 'This is a secure gateway under sandbox regulations. All transactions are logged and signed under the national ABDM compliance frameworks.'
      : 'यह सैंडबॉक्स नियमों के तहत एक सुरक्षित गेटवे है। सभी लेनदेन लॉग किए जाते हैं और राष्ट्रीय ABDM अनुपालन ढांचे के तहत हस्ताक्षरित होते हैं।'
  };

  const handleSendOtp = () => {
    if (!phoneNumber) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setOtpCode('123456'); // Simulated default OTP
    }, 800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setLoading(false);
      if (role === 'citizen') {
        if (authMethod === 'abha') {
          const sanitizedId = abhaId.trim().toUpperCase();
          if (sanitizedId === 'QR-12345-ABCD' || sanitizedId === 'QR-67890-EFGH') {
            onLogin({ role: 'citizen', id: sanitizedId });
          } else {
            setErrorMsg(t.authError + ' (Try: QR-12345-ABCD or QR-67890-EFGH)');
          }
        } else {
          if (otpCode === '123456') {
            onLogin({ role: 'citizen', id: 'QR-12345-ABCD' });
          } else {
            setErrorMsg(language === 'en' ? 'Invalid OTP. Enter 123456' : 'अमान्य ओटीपी। 123456 दर्ज करें');
          }
        }
      } else if (role === 'doctor') {
        onLogin({ role: 'doctor', id: 'DR-RAMESH-SHARMA' });
      } else if (role === 'govt') {
        onLogin({ role: 'govt', id: 'GOVT-DELHI-HQ' });
      }
    }, 1000);
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
      
      {/* Left Pane - Branding & Stats (Hidden on smaller screens) */}
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
        {/* Subtle Background Mesh/Glow Details */}
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
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(241,90,36,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Brand identity area */}
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
                <path d="M 40,42 L 50,22 L 60,42 L 50,48 Z M 42,55 L 50,35 L 58,55 Z" fill="#ffffff" opacity="0.3" />
                <path d="M 45,20 H 55 L 50,10 Z" fill="var(--gov-gold)" />
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
                MEDFLOW
              </h1>
              <p style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: '3px'
              }}>
                {language === 'hi' ? 'आयुष्मान भारत डिजिटल मिशन' : 'Ayushman Bharat Digital Mission'}
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
          }} className={language === 'hi' ? 'hindi-text' : ''}>
            {language === 'en' ? 'Unified Lifelong Health Records' : 'एकीकृत आजीवन स्वास्थ्य रिकॉर्ड'}
          </h2>
          
          <p style={{
            color: '#94a3b8',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '40px'
          }} className={language === 'hi' ? 'hindi-text' : ''}>
            {language === 'en' 
              ? 'A secure, national infrastructure connecting citizens, clinical providers, and healthcare analytics under the National Health Authority.'
              : 'नागरिकों, स्वास्थ्य प्रदाताओं और स्वास्थ्य विश्लेषिकी को जोड़ने वाली राष्ट्रीय स्वास्थ्य प्राधिकरण के अंतर्गत एक सुरक्षित डिजिटल आधारभूत संरचना।'}
          </p>

          {/* Key Value Propositions with clean icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                backgroundColor: 'rgba(197,160,89,0.15)',
                padding: '10px',
                borderRadius: '12px',
                color: 'var(--gov-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={18} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  {language === 'en' ? 'ABHA Integrated Identity' : 'आभा एकीकृत पहचान'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  {language === 'en' ? 'Encrypted health lock compliance with ABDM standards.' : 'ABDM मानकों के अनुरूप एन्क्रिप्टेड डिजिटल हेल्थ लॉक।' }
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                backgroundColor: 'rgba(0,128,55,0.15)',
                padding: '10px',
                borderRadius: '12px',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HeartPulse size={18} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  {language === 'en' ? 'Clinical Decision Desk' : 'नैदानिक निर्णय डेस्क'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  {language === 'en' ? 'Enables clinical practitioners to retrieve structured history in seconds.' : 'चिकित्सकों को कुछ ही सेकंड में संरचित इतिहास प्राप्त करने में सक्षम बनाता है।'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                backgroundColor: 'rgba(241,90,36,0.15)',
                padding: '10px',
                borderRadius: '12px',
                color: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={18} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  {language === 'en' ? 'Gemini AI Ingestion' : 'जेमिनी एआई दस्तावेज़ पार्सर'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  {language === 'en' ? 'Instantly convert unstructured PDF prescriptions and lab reports.' : 'असंरचित पीडीएफ पर्चे और लैब रिपोर्ट को तुरंत डिजिटल डेटा में बदलें।'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted Stats area */}
        <div style={{
          display: 'flex',
          gap: '24px',
          paddingTop: '32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-gold)' }}>14.2 Lakhs</p>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {language === 'en' ? 'Registered Citizens' : 'पंजीकृत नागरिक'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>100% Secure</p>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {language === 'en' ? 'ABDM Compliant' : 'आभा (ABDM) अनुपालन'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f97316' }}>500+ PHCs</p>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {language === 'en' ? 'Active Clinics' : 'सक्रिय स्वास्थ्य केंद्र'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane - Form Card Area */}
      <div style={{
        flex: 0.9,
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'var(--surface)'
      }}>
        {/* Responsive Logo (Visible on mobile only) */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px', marginBottom: '32px' }} className="show-mobile">
          <div style={{ width: '32px', height: '44px', flexShrink: 0 }}>
            <svg viewBox="0 0 100 135" fill="none" style={{ width: '100%', height: '100%' }}>
              <ellipse cx="50" cy="115" rx="35" ry="10" fill="var(--gov-gold)" />
              <rect x="25" y="105" width="50" height="10" fill="var(--gov-gold)" />
              <path d="M 32,50 C 32,30 68,30 68,50 C 68,80 65,105 50,105 C 35,105 32,80 32,50 Z" fill="var(--gov-gold)" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-navy)' }}>MEDFLOW</h1>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>National Health Authority</p>
          </div>
        </div>

        <div>
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
            <Lock size={12} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.loginTitle}</span>
          </span>
          
          <h3 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            marginBottom: '32px'
          }} className={language === 'hi' ? 'hindi-text' : ''}>
            {language === 'en' ? 'Welcome to MedFlow Gateway' : 'मेडफ़्लो गेटवे में आपका स्वागत है'}
          </h3>

          {/* Role selector tabs styled as premium cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '32px'
          }}>
            <button
              type="button"
              onClick={() => { setRole('citizen'); setErrorMsg(''); }}
              style={{
                padding: '12px 6px',
                border: '1.5px solid ' + (role === 'citizen' ? 'var(--gov-gold)' : 'var(--surface-border)'),
                background: role === 'citizen' ? 'rgba(197,160,89,0.06)' : 'white',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: role === 'citizen' ? 'var(--gov-navy)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                boxShadow: role === 'citizen' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <User size={18} color={role === 'citizen' ? 'var(--gov-gold)' : 'var(--text-secondary)'} />
              <span className={language === 'hi' ? 'hindi-text' : ''}>{t.roleCitizen}</span>
            </button>
            
            <button
              type="button"
              onClick={() => { setRole('doctor'); setErrorMsg(''); }}
              style={{
                padding: '12px 6px',
                border: '1.5px solid ' + (role === 'doctor' ? 'var(--gov-navy)' : 'var(--surface-border)'),
                background: role === 'doctor' ? 'rgba(11,34,64,0.04)' : 'white',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: role === 'doctor' ? 'var(--gov-navy)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                boxShadow: role === 'doctor' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <HeartPulse size={18} color={role === 'doctor' ? 'var(--gov-navy)' : 'var(--text-secondary)'} />
              <span className={language === 'hi' ? 'hindi-text' : ''}>{t.roleDoctor}</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('govt'); setErrorMsg(''); }}
              style={{
                padding: '12px 6px',
                border: '1.5px solid ' + (role === 'govt' ? 'var(--gov-saffron)' : 'var(--surface-border)'),
                background: role === 'govt' ? 'rgba(241,90,36,0.05)' : 'white',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: role === 'govt' ? 'var(--gov-navy)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                boxShadow: role === 'govt' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Building2 size={18} color={role === 'govt' ? 'var(--gov-saffron)' : 'var(--text-secondary)'} />
              <span className={language === 'hi' ? 'hindi-text' : ''}>{t.roleGovt}</span>
            </button>
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex',
              gap: '10px',
              padding: '14px',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: 'var(--danger)',
              fontSize: '0.825rem',
              marginBottom: '24px',
              alignItems: 'center'
            }} className="animate-scale-in">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span className={language === 'hi' ? 'hindi-text' : ''}>{errorMsg}</span>
            </div>
          )}

          {/* Citizen Login Form */}
          {role === 'citizen' && (
            <form onSubmit={handleSubmit}>
              {/* Method toggles */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                backgroundColor: 'var(--surface-muted)', 
                padding: '4px', 
                borderRadius: '10px', 
                marginBottom: '24px'
              }}>
                <button
                  type="button"
                  onClick={() => setAuthMethod('abha')}
                  style={{
                    padding: '8px',
                    border: 'none',
                    borderRadius: '8px',
                    background: authMethod === 'abha' ? 'white' : 'transparent',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: authMethod === 'abha' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {language === 'en' ? 'ABHA Number' : 'आभा संख्या'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  style={{
                    padding: '8px',
                    border: 'none',
                    borderRadius: '8px',
                    background: authMethod === 'phone' ? 'white' : 'transparent',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: authMethod === 'phone' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {language === 'en' ? 'Mobile OTP' : 'मोबाइल ओटीपी'}
                </button>
              </div>

              {authMethod === 'abha' ? (
                <div className="form-group">
                  <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>
                    {t.abhaLabel}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t.abhaPlaceholder}
                      value={abhaId}
                      onChange={(e) => setAbhaId(e.target.value)}
                      required
                      style={{ paddingLeft: '44px', fontWeight: 600 }}
                    />
                    <Key size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>
                      {t.phoneLabel}
                    </label>
                    <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder={t.phonePlaceholder}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                          disabled={otpSent}
                          style={{ paddingLeft: '44px', fontWeight: 600 }}
                        />
                        <Smartphone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      </div>
                      {!otpSent && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleSendOtp}
                          disabled={loading || !phoneNumber}
                          style={{ borderRadius: '12px' }}
                        >
                          <span className={language === 'hi' ? 'hindi-text' : ''}>{t.sendOtp}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {otpSent && (
                    <div className="form-group animate-fade-in" style={{ marginBottom: 0 }}>
                      <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>
                        {t.otpLabel}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        maxLength={6}
                        required
                        style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.2em', fontWeight: 800, color: 'var(--primary)' }}
                      />
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '10px',
                        backgroundColor: '#f0fdf4',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0',
                        color: 'var(--gov-green)',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}>
                        <CheckCircle2 size={16} />
                        <span className={language === 'hi' ? 'hindi-text' : ''}>
                          {language === 'en' ? 'Mock OTP Sent. Use 123456 to bypass' : 'मॉक ओटीपी भेजा गया। बायपास करने के लिए 123456 का उपयोग करें'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '32px', padding: '14px', borderRadius: '12px', gap: '8px', fontSize: '1rem', backgroundColor: 'var(--gov-navy)' }}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <>
                    <Check size={18} />
                    <span className={language === 'hi' ? 'hindi-text' : ''}>{t.verifyLogin}</span>
                  </>
                )}
              </button>

              <div style={{
                marginTop: '24px',
                padding: '14px',
                backgroundColor: 'var(--surface-muted)',
                borderRadius: '12px',
                border: '1px solid var(--surface-border)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5'
              }} className={language === 'hi' ? 'hindi-text' : ''}>
                💡 <strong>Demo Helper:</strong> {t.citizenHelper}
              </div>
            </form>
          )}

          {/* Doctor Login Form */}
          {role === 'doctor' && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>
                  {t.licenseLabel}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. MCI-98472-A"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                  style={{ fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>
                  {t.passLabel}
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={doctorPass}
                  onChange={(e) => setDoctorPass(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '32px', padding: '14px', borderRadius: '12px', gap: '8px', fontSize: '1rem', backgroundColor: 'var(--gov-navy)' }}
                disabled={loading}
              >
                <HeartPulse size={18} />
                <span className={language === 'hi' ? 'hindi-text' : ''}>
                  {language === 'en' ? 'Launch Clinical Desk' : 'नैदानिक डेस्क खोलें'}
                </span>
              </button>
            </form>
          )}

          {/* Government Login Form */}
          {role === 'govt' && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>
                  {t.govtLabel}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. GOV-IND-4820"
                  value={govtId}
                  onChange={(e) => setGovtId(e.target.value)}
                  required
                  style={{ fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>
                  {t.passLabel}
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={govtPass}
                  onChange={(e) => setGovtPass(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '32px', padding: '14px', borderRadius: '12px', gap: '8px', fontSize: '1rem', backgroundColor: 'var(--gov-saffron)' }}
                disabled={loading}
              >
                <Building2 size={18} />
                <span className={language === 'hi' ? 'hindi-text' : ''}>
                  {language === 'en' ? 'Enter Operations Center' : 'संचालन केंद्र में प्रवेश करें'}
                </span>
              </button>
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
        }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.disclaimer}
        </div>
      </div>

      {/* Styled Responsive Classes (injecting directly) */}
      <style>{`
        @media (max-width: 860px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

// Simple local spinner detail helper
function RefreshCw(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || "24"}
      height={props.size || "24"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      style={{ animation: 'spin 1s linear infinite', ...props.style }}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}
