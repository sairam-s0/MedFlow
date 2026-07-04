import React from 'react';
import { Shield, TrendingUp, TrendingDown, Package, Activity, CheckSquare } from 'lucide-react';

export default function GovtDashboard({ metrics, language }) {
  if (!metrics) return <div>Loading...</div>;

  const t = {
    title: language === 'en' ? 'National Healthcare Operations' : 'राष्ट्रीय स्वास्थ्य सेवा संचालन',
    subtitle: language === 'en' ? 'Anonymized public health intelligence and clinical infrastructure analytics' : 'अनाम जनस्वास्थ्य डेटा और नैदानिक ​​बुनियादी ढांचा विश्लेषण',
    nodeBadge: language === 'en' ? 'National Health Authority Node' : 'राष्ट्रीय स्वास्थ्य प्राधिकरण नोड (NHA)',
    citizens: language === 'en' ? 'Registered Citizens' : 'पंजीकृत नागरिक',
    citizensSub: language === 'en' ? '+12,408 registered today' : 'आज +12,408 नए पंजीकृत',
    chronic: language === 'en' ? 'Active Chronic Patients' : 'सक्रिय पुराने रोगी',
    chronicSub: language === 'en' ? 'Diabetes, Hypertension focus' : 'मधुमेह, उच्च रक्तचाप पर ध्यान',
    compliance: language === 'en' ? 'Follow-up Compliance' : 'दवा अनुपालन दर',
    complianceSub: language === 'en' ? 'Avg. prescription adherence' : 'औसत चिकित्सक पर्ची पालन',
    pregnancy: language === 'en' ? 'Pregnancy Tracking (ANC)' : 'गर्भावस्था ट्रैकिंग (ANC)',
    pregnancySub: language === 'en' ? 'Active antenatal care cases' : 'सक्रिय प्रसव पूर्व देखभाल मामले',
    vaccination: language === 'en' ? 'Vaccination Coverage' : 'टीकाकरण कवरेज',
    vaccinationSub: language === 'en' ? 'Universal immunization rate' : 'सार्वभौमिक टीकाकरण दर',
    diseasePrev: language === 'en' ? 'Chronic Disease Prevalence' : 'गंभीर बीमारियों का क्षेत्रीय प्रसार',
    trendingTitle: language === 'en' ? 'Epidemic Transmission Trends' : 'संक्रामक महामारी संचरण रुझान',
    stockTitle: language === 'en' ? 'Clinical Stock Logistics' : 'आवश्यक नैदानिक ​​स्टॉक रसद',
    rising: language === 'en' ? 'Rising' : 'बढ़ रहा है',
    receding: language === 'en' ? 'Receding' : 'घट रहा है',
    stable: language === 'en' ? 'Stable' : 'स्थिर आपूर्ति',
    lowStock: language === 'en' ? 'Low Stock Alert' : 'कम स्टॉक चेतावनी',
    highSupply: language === 'en' ? 'High Supply' : 'भरपूर आपूर्ति',
    followUpTitle: language === 'en' ? 'Clinic Follow-up Compliance Queue' : 'स्थानीय क्लिनिक अनुवर्ती अनुपालन कतार',
    followUpDesc: language === 'en' 
      ? `Currently ${metrics.pendingFollowUps} patients in the district are flagged for missed medications. Local PHC workers scheduled for house checks.`
      : `वर्तमान में जिले के ${metrics.pendingFollowUps} रोगियों को उनकी आवश्यक दवाएं छूटने के कारण चिह्नित किया गया है। आशा कार्यकर्ताओं को गृह जांच के लिए निर्देशित किया गया है।`
  };

  const getTranslatedDisease = (name) => {
    if (language === 'en') return name;
    if (name === 'Diabetes') return 'मधुमेह (Diabetes)';
    if (name === 'Hypertension') return 'उच्च रक्तचाप (Hypertension)';
    if (name === 'Anemia') return 'एनीमिया (Anemia)';
    if (name === 'Asthma') return 'अस्थमा (Asthma)';
    return name;
  };

  const getTranslatedTrendDisease = (name) => {
    if (language === 'en') return name;
    if (name === 'Dengue') return 'डेंगू (Dengue)';
    if (name === 'Viral Fever') return 'वायरल बुखार (Viral Fever)';
    if (name === 'Malaria') return 'मलेरिया (Malaria)';
    return name;
  };

  const getTranslatedMed = (name) => {
    if (language === 'en') return name;
    if (name.includes('Insulin')) return 'इंसुलिन इंजेक्शन (Insulin)';
    if (name.includes('Paracetamol')) return 'पैरासिटामोल 500mg (Paracetamol)';
    if (name.includes('Iron')) return 'आयरन फोलिक एसिड टैबलेट (Iron)';
    return name;
  };

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.subtitle}
          </p>
        </div>
        <div className="badge badge-saffron" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }} className={language === 'hi' ? 'badge badge-saffron hindi-text' : 'badge badge-saffron'}>
          <Shield size={14} /> {t.nodeBadge}
        </div>
      </div>

      {/* Grid statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <div className="dashboard-card animate-cascade-1" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.citizens}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)', marginTop: '4px' }}>
            {metrics.registeredCitizens.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.citizensSub}</p>
        </div>

        <div className="dashboard-card animate-cascade-2" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.chronic}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gov-saffron)', marginTop: '4px' }}>
            {metrics.activeChronicPatients.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.chronicSub}</p>
        </div>

        <div className="dashboard-card animate-cascade-3" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.compliance}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gov-green)', marginTop: '4px' }}>
            {metrics.followUpCompliance}%
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.complianceSub}</p>
        </div>

        <div className="dashboard-card animate-cascade-4" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.pregnancy}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)', marginTop: '4px' }}>
            {metrics.pregnancyTracking.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.pregnancySub}</p>
        </div>

        <div className="dashboard-card animate-cascade-5" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.vaccination}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gov-green)', marginTop: '4px' }}>
            {metrics.vaccinationCoverage}%
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.vaccinationSub}</p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Chronic Disease Card */}
        <div className="dashboard-card animate-cascade-3">
          <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            <Activity size={20} color="var(--primary)" />
            {t.diseasePrev}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {metrics.commonDiseases.map((dis, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  <strong>{getTranslatedDisease(dis.name)}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{dis.count.toLocaleString()} {language === 'en' ? 'cases' : 'मामले'}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dis.pct}%`, backgroundColor: idx % 2 === 0 ? 'var(--primary)' : 'var(--gov-saffron)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Epidemics & Logistics column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Epidemics */}
          <div className="dashboard-card animate-cascade-4" style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              <TrendingUp size={20} color="var(--danger)" />
              {t.trendingTitle}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {metrics.trendingDiseases.map((trend, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{getTranslatedTrendDisease(trend.name)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: trend.trend === 'up' ? 'var(--danger)' : 'var(--gov-green)' }}>
                      {trend.trend === 'up' ? '+' : ''}{trend.pct}%
                    </span>
                    {trend.trend === 'up' ? (
                      <span className="badge badge-danger" style={{ padding: '2px 6px', fontSize: '0.65rem' }} className={language === 'hi' ? 'badge badge-danger hindi-text' : 'badge badge-danger'}><TrendingUp size={10} /> {t.rising}</span>
                    ) : (
                      <span className="badge badge-green" style={{ padding: '2px 6px', fontSize: '0.65rem' }} className={language === 'hi' ? 'badge badge-green hindi-text' : 'badge badge-green'}><TrendingDown size={10} /> {t.receding}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics */}
          <div className="dashboard-card animate-cascade-5" style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              <Package size={20} color="var(--warning)" />
              {t.stockTitle}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {metrics.medicineDemand.map((med, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{getTranslatedMed(med.name)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
                      {language === 'en' ? 'Stock Level:' : 'भंडार स्तर:'} <strong>{med.stock}%</strong>
                    </div>
                    <span className={`badge ${
                      med.status.includes('Low') ? 'badge-danger' : 'badge-green'
                    }`} style={{ fontSize: '0.65rem', padding: '4px 8px' }} className={language === 'hi' ? 'badge hindi-text' : 'badge'}>
                      {med.status.includes('Low') ? t.lowStock : med.status.includes('Stable') ? t.stable : t.highSupply}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Compliance Box */}
      <div className="dashboard-card" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', backgroundColor: 'var(--primary-light)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <CheckSquare size={20} color="var(--primary)" />
          <div>
            <h5 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.followUpTitle}</h5>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.followUpDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
