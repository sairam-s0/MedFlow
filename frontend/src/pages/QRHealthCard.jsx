import React from 'react';
import { Shield, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';

export default function QRHealthCard({ profile, language }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const t = {
    title: language === 'en' ? 'National Digital Health Card (Sample)' : 'राष्ट्रीय डिजिटल स्वास्थ्य कार्ड (नमूना)',
    subtitle: language === 'en' ? 'Secure clinic record check-in via ABDM Consent Gateway' : 'आभा सहमति गेटवे के माध्यम से सुरक्षित क्लिनिक चेक-इन',
    ministry: language === 'en' ? 'Ministry of Health & Family Welfare (Sample Card)' : 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय (नमूना कार्ड)',
    govIndia: language === 'en' ? 'VERIFIED ABHA' : 'सत्यापित आभा',
    citizenName: language === 'en' ? 'Citizen Name' : 'नागरिक का नाम',
    gender: language === 'en' ? 'Gender' : 'लिंग',
    blood: language === 'en' ? 'Blood Group' : 'रक्त समूह',
    abhaNum: language === 'en' ? 'ABHA Number' : 'आभा संख्या',
    footerLeft: language === 'en' ? 'Lifelong digital record ownership (Simulation)' : 'आजीवन डिजिटल रिकॉर्ड स्वामित्व (अनुकरण)',
    footerRight: language === 'en' ? 'ABDM Compliant' : 'आभा (ABDM) अनुपालन',
    offlineTitle: language === 'en' ? 'Rural India Offline Compatibility' : 'ग्रामीण भारत ऑफ़लाइन सुसंगतता',
    offlineDesc: language === 'en' ? 'This card can be printed physically for rural regions lacking continuous network access. Doctors scan the offline QR card to fetch cached clinical metadata instantly upon securing user consent.' : 'इस कार्ड को उन ग्रामीण क्षेत्रों के लिए प्रिंट किया जा सकता है जहां इंटरनेट की निरंतर पहुंच नहीं है। डॉक्टर उपचार सहमति प्राप्त करने के बाद रोगी चिकित्सा विवरण लोड करने के लिए इसे स्कैन कर सकते हैं।',
    male: language === 'en' ? 'Male' : 'पुरुष'
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '12px 0' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.subtitle}
        </p>
      </div>

      {/* Styled Physical ABHA Card */}
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
              <Shield size={20} /> MEDFLOW
            </h4>
            <p style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.ministry}
            </p>
          </div>
          <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.65rem' }} className={language === 'hi' ? 'badge hindi-text' : 'badge'}>
            {t.govIndia}
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
            boxShadow: 'var(--shadow-md)'
          }}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=medflow-patient-${profile.id}`} alt="ABHA QR Code" style={{ width: '130px', height: '130px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }} className={language === 'hi' ? 'hindi-text' : ''}>
            <div>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>{t.citizenName}</span>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: '1px' }}>{profile.name}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>{t.gender}</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{profile.gender === 'Male' ? t.male : profile.gender}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>{t.blood}</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gov-gold)' }}>{profile.bloodGroup}</p>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>{t.abhaNum}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
                <p style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>{profile.id}</p>
                <button 
                  onClick={handleCopyId} 
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7, padding: '2px' }}
                  title="Copy ABHA ID"
                >
                  {copied ? <Check size={14} color="var(--gov-green)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', opacity: 0.8 }} className={language === 'hi' ? 'hindi-text' : ''}>
          <span>{t.footerLeft}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="var(--gov-gold)" /> {t.footerRight}
          </span>
        </div>
      </div>

      {/* Info Card */}
      <div className="dashboard-card" style={{ backgroundColor: 'var(--warning-light)', borderColor: 'var(--warning)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h5 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#855100', marginBottom: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.offlineTitle}
            </h5>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.offlineDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
