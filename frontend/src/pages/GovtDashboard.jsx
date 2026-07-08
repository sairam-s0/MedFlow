import React from 'react';
import { Shield, TrendingUp, TrendingDown, Package, Activity, CheckSquare } from 'lucide-react';

export default function GovtDashboard({ metrics, language, t }) {
  if (!metrics) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Govt Operations Portal...</div>;

  const getTranslatedDisease = (name) => {
    if (language === 'en') return name;
    if (name === 'Diabetes' || name === 'Type 2 Diabetes') return 'मधुमेह (Diabetes)';
    if (name === 'Hypertension') return 'उच्च रक्तचाप (Hypertension)';
    if (name === 'Iron Deficiency Anemia') return 'एनीमिया (Anemia)';
    if (name === 'Asthma') return 'अस्थमा (Asthma)';
    if (name === 'High Cholesterol') return 'उच्च कोलेस्ट्रॉल (Cholesterol)';
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
    if (name.includes('Metformin')) return 'मेटफॉर्मिन (Metformin)';
    if (name.includes('Amlodipine')) return 'एम्लोडिपाइन (Amlodipine)';
    if (name.includes('Ferrous') || name.includes('Iron')) return 'आयरन फोलिक एसिड (Iron)';
    return name;
  };

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.govt.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.govt.subtitle}
          </p>
        </div>
        <div className="badge badge-saffron" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }} className={language === 'hi' ? 'badge badge-saffron hindi-text' : 'badge badge-saffron'}>
          <Shield size={14} /> {t.govt.nodeBadge}
        </div>
      </div>

      {/* Grid statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <div className="dashboard-card animate-cascade-1" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.govt.citizens}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)', marginTop: '4px' }}>
            {metrics.registeredCitizens.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {language === 'en' ? 'Active database nodes' : 'सक्रिय डेटाबेस नोड्स'}
          </p>
        </div>

        <div className="dashboard-card animate-cascade-2" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.govt.chronic}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gov-saffron)', marginTop: '4px' }}>
            {metrics.activeChronicPatients.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {language === 'en' ? 'Clinically monitored cases' : 'चिकित्सकीय रूप से निगरानी मामले'}
          </p>
        </div>

        <div className="dashboard-card animate-cascade-3" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.govt.compliance}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gov-green)', marginTop: '4px' }}>
            {metrics.followUpCompliance}%
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {language === 'en' ? 'National adherence avg' : 'औसत राष्ट्रीय अनुपालन'}
          </p>
        </div>

        <div className="dashboard-card animate-cascade-4" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.govt.pregnancy}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)', marginTop: '4px' }}>
            {metrics.pregnancyTracking.toLocaleString()}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {language === 'en' ? 'Active antenatal care' : 'सक्रिय प्रसव पूर्व देखभाल'}
          </p>
        </div>

        <div className="dashboard-card animate-cascade-5" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.govt.vaccination}</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gov-green)', marginTop: '4px' }}>
            {metrics.vaccinationCoverage}%
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {language === 'en' ? 'Immunized database citizens' : 'टीकाकृत डेटाबेस नागरिक'}
          </p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Chronic Disease Card */}
        <div className="dashboard-card animate-cascade-3">
          <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            <Activity size={20} color="var(--primary)" />
            {t.govt.diseasePrev}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {metrics.commonDiseases.map((dis, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  <strong>{getTranslatedDisease(dis.name)}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{dis.count.toLocaleString()} {language === 'en' ? 'cases' : 'मामले'}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dis.pct || 5}%`, backgroundColor: idx % 2 === 0 ? 'var(--primary)' : 'var(--gov-saffron)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
            {metrics.commonDiseases.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No clinical diseases logs in database.</span>}
          </div>
        </div>

        {/* Epidemics & Logistics column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Epidemics */}
          <div className="dashboard-card animate-cascade-4" style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              <TrendingUp size={20} color="var(--danger)" />
              {t.govt.trendingTitle}
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
                      <span className="badge badge-danger" style={{ padding: '2px 6px', fontSize: '0.65rem' }} className={language === 'hi' ? 'badge badge-danger hindi-text' : 'badge badge-danger'}><TrendingUp size={10} /> {t.govt.rising}</span>
                    ) : (
                      <span className="badge badge-green" style={{ padding: '2px 6px', fontSize: '0.65rem' }} className={language === 'hi' ? 'badge badge-green hindi-text' : 'badge badge-green'}><TrendingDown size={10} /> {t.govt.receding}</span>
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
              {t.govt.stockTitle}
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
                      med.stock < 40 ? 'badge-danger' : 'badge-green'
                    }`} style={{ fontSize: '0.65rem', padding: '4px 8px' }} className={language === 'hi' ? 'badge hindi-text' : 'badge'}>
                      {med.stock < 40 ? t.govt.lowStock : t.govt.highSupply}
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
            <h5 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.govt.followUpTitle}</h5>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.govt.followUpDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
