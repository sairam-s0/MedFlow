import React from 'react';
import { User, Activity, ShieldAlert, Heart, Calendar, ArrowRight, Pill, PhoneCall } from 'lucide-react';

export default function CitizenHome({ profile, setPage, language }) {
  if (!profile) return <div className="animate-fade-in">Loading Profile...</div>;

  const t = {
    title: language === 'en' ? 'Citizen Health Portal' : 'नागरिक स्वास्थ्य पोर्टल',
    subtitle: language === 'en' ? 'Demo lifelong medical identity' : 'डेमो आजीवन डिजिटल चिकित्सा पहचान',
    abhaId: language === 'en' ? 'Demo Health ID:' : 'डेमो हेल्थ आईडी:',
    bioGender: language === 'en' ? 'Age / Gender:' : 'आयु / लिंग:',
    bloodGroup: language === 'en' ? 'Blood Group:' : 'रक्त समूह:',
    secureQr: language === 'en' ? 'Secure QR Card' : 'सुरक्षित क्यूआर कार्ड',
    activeCond: language === 'en' ? 'Active Conditions' : 'सक्रिय रोग स्थितियां',
    currentMed: language === 'en' ? 'Current Medications' : 'सक्रिय दवाएं',
    allergies: language === 'en' ? 'Allergies & Emer.' : 'एलर्जी एवं आपातकालीन संपर्क',
    lastVisit: language === 'en' ? 'Last Healthcare Facility Visit' : 'अंतिम चिकित्सालय परामर्श विवरण',
    accessServices: language === 'en' ? 'Access Health Services' : 'डिजिटल स्वास्थ्य सेवाएं',
    doctorLabel: language === 'en' ? 'Attending Physician:' : 'उपचार चिकित्सक:',
    contactLabel: language === 'en' ? 'Emergency Contact:' : 'आपातकालीन संपर्क:',
    noCond: language === 'en' ? 'No documented active conditions' : 'कोई सक्रिय स्वास्थ्य जटिलता दर्ज नहीं',
    noMed: language === 'en' ? 'No active medications' : 'कोई सक्रिय दवा निर्धारित नहीं',
    noAll: language === 'en' ? 'No known allergies' : 'कोई ज्ञात एलर्जी नहीं',
    years: language === 'en' ? 'yrs' : 'वर्ष',
    recordsBtn: language === 'en' ? 'Medical Records' : 'चिकित्सा रिकॉर्ड',
    recordsDesc: language === 'en' ? 'DigiLocker diagnostic reports' : 'डिजिलॉकर से जुड़े सत्यापित चिकित्सा प्रमाण-पत्र',
    timelineBtn: language === 'en' ? 'Health Timeline' : 'स्वास्थ्य समय-रेखा',
    timelineDesc: language === 'en' ? 'Chronological health journey' : 'आजीवन स्वास्थ्य इतिहास कालानुक्रमिक चार्ट',
    qrBtn: language === 'en' ? 'Secure QR Card' : 'डिजिटल क्यूआर कार्ड',
    qrDesc: language === 'en' ? 'Provider record consent lookup' : 'चिकित्सक सहमति गेटवे हेतु त्वरित कार्ड',
    uploadBtn: language === 'en' ? 'Upload Record' : 'दस्तावेज़ अपलोड',
    uploadDesc: language === 'en' ? 'OCR & Gemini ingestion pipeline' : 'पर्चा और रिपोर्ट एआई के माध्यम से इनपुट करें'
  };

  const getTranslatedCondition = (cond) => {
    if (language === 'en') return cond;
    if (cond === 'Type 2 Diabetes') return 'टाइप 2 मधुमेह';
    if (cond === 'Mild Hypertension') return 'हल्का उच्च रक्तचाप';
    return cond;
  };

  const getTranslatedMed = (med) => {
    if (language === 'en') return med;
    if (med === 'Metformin') return 'मेटफॉर्मिन';
    if (med === 'Amlodipine') return 'एम्लोडिपाइन';
    if (med === 'Vitamin D3') return 'विटामिन डी3';
    return med;
  };

  const getTranslatedFreq = (freq) => {
    if (language === 'en') return freq;
    if (freq === 'Once daily') return 'दिन में एक बार';
    if (freq === 'Once weekly') return 'सप्ताह में एक बार';
    return freq;
  };

  const getTranslatedAllergy = (all) => {
    if (language === 'en') return all;
    if (all === 'Penicillin') return 'पेनिसिलिन';
    return all;
  };

  return (
    <div className="animate-fade-in" style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.subtitle}
          </p>
        </div>
        <div className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} className={language === 'hi' ? 'badge badge-primary hindi-text' : 'badge badge-primary'}>
          {t.abhaId} {profile.id}
        </div>
      </div>

      {/* Main Medical Profile Summary Card */}
      <div className="dashboard-card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #ffffff 0%, #f1f7fc 100%)', borderLeft: '6px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <User size={40} />
            </div>
            <div className={language === 'hi' ? 'hindi-text' : ''}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{profile.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <strong>{t.bioGender}</strong> {profile.age} {t.years} / {profile.gender === 'Male' && language === 'hi' ? 'पुरुष' : profile.gender}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <strong>{t.bloodGroup}</strong> <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{profile.bloodGroup}</span>
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ border: '1px solid var(--surface-border)', padding: '6px', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' }} onClick={() => setPage('qr')}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=medflow-patient-${profile.id}`} alt="Health QR" style={{ width: '64px', height: '64px' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.secureQr}</span>
          </div>
        </div>
      </div>

      {/* Key Health Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Conditions Card */}
        <div className="dashboard-card animate-cascade-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--primary)' }}>
            <Activity size={24} />
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.activeCond}</h4>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {profile.currentConditions.map((cond, idx) => (
              <span key={idx} className="badge badge-saffron" style={{ fontSize: '0.8rem' }} className={language === 'hi' ? 'badge badge-saffron hindi-text' : 'badge badge-saffron'}>
                {getTranslatedCondition(cond)}
              </span>
            ))}
            {profile.currentConditions.length === 0 && <span style={{ color: 'var(--text-muted)' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.noCond}</span>}
          </div>
        </div>

        {/* Medications Card */}
        <div className="dashboard-card animate-cascade-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--green)' }}>
            <Pill size={24} />
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.currentMed}</h4>
          </div>
          <ul style={{ listStyle: 'none' }}>
            {profile.currentMedications.map((med, idx) => (
              <li key={idx} style={{ padding: '4px 0', borderBottom: idx < profile.currentMedications.length - 1 ? '1px solid var(--surface-border)' : 'none', fontSize: '0.9rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
                <strong>{getTranslatedMed(med.name)}</strong> ({med.dose}) - <span style={{ color: 'var(--text-secondary)' }}>{getTranslatedFreq(med.freq)}</span>
              </li>
            ))}
            {profile.currentMedications.length === 0 && <span style={{ color: 'var(--text-muted)' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.noMed}</span>}
          </ul>
        </div>

        {/* Allergies & emergency Card */}
        <div className="dashboard-card animate-cascade-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--danger)' }}>
            <ShieldAlert size={24} />
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.allergies}</h4>
          </div>
          <div style={{ marginBottom: '12px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>{language === 'en' ? 'Allergies:' : 'एलर्जी विवरण:'}</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
              {profile.allergies.map((all, idx) => (
                <span key={idx} className="badge badge-danger" style={{ fontSize: '0.75rem' }} className={language === 'hi' ? 'badge badge-danger hindi-text' : 'badge badge-danger'}>
                  {getTranslatedAllergy(all)}
                </span>
              ))}
              {profile.allergies.length === 0 && <span style={{ color: 'var(--text-muted)' }}>{t.noAll}</span>}
            </div>
          </div>
          <div className={language === 'hi' ? 'hindi-text' : ''}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PhoneCall size={14} /> {t.contactLabel}
            </strong>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              {profile.emergencyContact}
            </p>
          </div>
        </div>

      </div>

      {/* Last Visit Summary */}
      <div className="dashboard-card animate-cascade-4" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--warning)' }}>
          <Calendar size={24} />
          <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.lastVisit}</h4>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }} className={language === 'hi' ? 'hindi-text' : ''}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>{language === 'hi' ? profile.lastVisit.facility.replace('PHC', 'प्राथमिक स्वास्थ्य केंद्र') : profile.lastVisit.facility}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.doctorLabel} {profile.lastVisit.doctor}</p>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
            {profile.lastVisit.date}
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
        {t.accessServices}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="dashboard-card animate-cascade-5" style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setPage('records')}>
          <div className={language === 'hi' ? 'hindi-text' : ''}>
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{t.recordsBtn}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.recordsDesc}</p>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </div>

        <div className="dashboard-card animate-cascade-5" style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setPage('timeline')}>
          <div className={language === 'hi' ? 'hindi-text' : ''}>
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{t.timelineBtn}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.timelineDesc}</p>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </div>

        <div className="dashboard-card animate-cascade-5" style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setPage('qr')}>
          <div className={language === 'hi' ? 'hindi-text' : ''}>
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{t.qrBtn}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.qrDesc}</p>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </div>

        <div className="dashboard-card animate-cascade-5" style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setPage('upload')}>
          <div className={language === 'hi' ? 'hindi-text' : ''}>
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{t.uploadBtn}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.uploadDesc}</p>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </div>

      </div>
    </div>
  );
}
