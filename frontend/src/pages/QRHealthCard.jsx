import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, AlertCircle, Copy, Check, Download, RefreshCw } from 'lucide-react';
import { apiStub } from '../services/apiStub';

export default function QRHealthCard({ profile, language, t }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);

  const fetchToken = async () => {
    setLoading(true);
    try {
      const data = await apiStub.generateQRToken();
      setTokenData(data);
      setLoading(false);
    } catch (err) {
      console.error("Error generating QR verification token:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  const handleCopyId = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenCard = () => {
    if (!tokenData) return;
    window.open(tokenData.url, '_blank');
  };

  if (!profile) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading profile...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '12px 0' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.qr.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.qr.subtitle}
        </p>
      </div>

      {/* Styled physical health card */}
      <div className="dashboard-card animate-scale-in" style={{
        background: 'linear-gradient(135deg, #0b2240 0%, #1e293b 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 20px 40px rgba(11, 34, 64, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--gov-gold)',
        marginBottom: '24px'
      }}>
        {/* Decorative Tricolor Strip */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #f15a24 0%, #ffffff 50%, #008037 100%)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', color: 'var(--gov-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={20} /> {t.brand.title}
            </h4>
            <p style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.brand.subtitle}
            </p>
          </div>
          <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.65rem' }} className={language === 'hi' ? 'badge hindi-text' : 'badge'}>
            {t.qr.active}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* QR Code */}
          <div style={{
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            minWidth: '140px',
            minHeight: '140px'
          }}>
            {loading ? (
              <RefreshCw className="animate-spin" size={24} color="var(--primary)" />
            ) : tokenData ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(tokenData.url)}&ecc=H`}
                alt="Secure verification token"
                style={{ width: '130px', height: '130px' }}
              />
            ) : (
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>Failed to generate QR</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }} className={language === 'hi' ? 'hindi-text' : ''}>
            <div>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>{language === 'en' ? 'Citizen Name' : 'नागरिक का नाम'}</span>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: '1px' }}>{profile.name}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>{language === 'en' ? 'Gender' : 'लिंग'}</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{profile.gender === 'Male' && language === 'hi' ? 'पुरुष' : (profile.gender === 'Female' && language === 'hi' ? 'महिला' : profile.gender)}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>{language === 'en' ? 'Blood Group' : 'रक्त समूह'}</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gov-gold)' }}>{profile.bloodGroup}</p>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>{t.citizen.healthId}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
                <p style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>{profile.id}</p>
                <button 
                  onClick={handleCopyId} 
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7, padding: '2px' }}
                  title="Copy Health ID"
                >
                  {copied ? <Check size={14} color="var(--gov-green)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', opacity: 0.8 }} className={language === 'hi' ? 'hindi-text' : ''}>
          <span>{t.qr.scanPrompt}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="var(--gov-gold)" /> ABDM Compliant
          </span>
        </div>
      </div>

      {/* Info Card */}
      <div className="dashboard-card" style={{ backgroundColor: 'var(--warning-light)', borderColor: 'var(--warning)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h5 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#855100', marginBottom: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              Security Token Policy
            </h5>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.qr.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Regenerate Token Button */}
      <button
        onClick={fetchToken}
        className="btn btn-secondary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '14px',
          fontWeight: 700,
          fontSize: '1rem',
          borderRadius: '12px',
          marginBottom: '8px'
        }}
        disabled={loading}
      >
        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        <span className={language === 'hi' ? 'hindi-text' : ''}>
          {t.qr.regenerate}
        </span>
      </button>

      {/* Open Printable Card Button */}
      <button
        onClick={handleOpenCard}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '14px',
          background: 'linear-gradient(135deg, #0b2240 0%, #1e3a5f 100%)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1rem',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(11,34,64,0.2)'
        }}
        disabled={loading || !tokenData}
      >
        <Download size={18} />
        <span className={language === 'hi' ? 'hindi-text' : ''}>
          {t.qr.printable}
        </span>
      </button>
    </div>
  );
}
