import React, { useState } from 'react';
import { Layers, Compass } from 'lucide-react';

export default function HealthcareMap({ language }) {
  const [scope, setScope] = useState('District');
  const [metric, setMetric] = useState('Diabetes');
  const [selectedSubdivision, setSelectedSubdivision] = useState('Rampur Block');

  const subdivisionsData = {
    'Rampur Block': { diabetes: 'High (14.2%)', hypertension: 'Medium (22.5%)', anemia: 'Very High (48.0%)', vaccination: '94%' },
    'Sundergarh Block': { diabetes: 'Medium (9.5%)', hypertension: 'High (28.4%)', anemia: 'Low (15.2%)', vaccination: '96%' },
    'Raipur Block': { diabetes: 'Low (4.2%)', hypertension: 'Medium (18.1%)', anemia: 'High (32.4%)', vaccination: '89%' },
    'Bilaspur Block': { diabetes: 'High (12.8%)', hypertension: 'Low (12.0%)', anemia: 'Medium (24.8%)', vaccination: '91%' },
    'Durg Block': { diabetes: 'Medium (8.4%)', hypertension: 'High (26.9%)', anemia: 'High (35.1%)', vaccination: '95%' }
  };

  const t = {
    title: language === 'en' ? 'Regional Epidemiological Heatmaps' : 'क्षेत्रीय महामारी विज्ञान हीटमैप',
    subtitle: language === 'en' ? 'Spatial analytics and disease mapping for healthcare administrators' : 'स्वास्थ्य प्रशासकों के लिए भौगोलिक बीमारी मैपिंग और स्थानिक विश्लेषण',
    district: language === 'en' ? 'District' : 'जिला',
    phc: language === 'en' ? 'PHC' : 'प्राथमिक स्वास्थ्य केंद्र',
    village: language === 'en' ? 'Village' : 'गाँव',
    diabetes: language === 'en' ? 'Diabetes' : 'मधुमेह',
    hypertension: language === 'en' ? 'Hypertension' : 'उच्च रक्तचाप',
    anemia: language === 'en' ? 'Anemia' : 'एनीमिया',
    vaccination: language === 'en' ? 'Vaccination' : 'टीकाकरण',
    profileTitle: language === 'en' ? 'Region Health Profile' : 'क्षेत्रीय स्वास्थ्य प्रोफ़ाइल',
    profileDesc: language === 'en' ? 'Primary Healthcare mapping sector' : 'प्राथमिक स्वास्थ्य मानचित्रण क्षेत्र',
    prevalence: language === 'en' ? 'Diabetes Prevalence' : 'मधुमेह प्रसार दर',
    hyperRate: language === 'en' ? 'Hypertension Rate' : 'उच्च रक्तचाप दर',
    anemiaIndex: language === 'en' ? 'Child Anemia Index' : 'बाल एनीमिया सूचकांक',
    vaccineRate: language === 'en' ? 'Vaccination Compliance' : 'टीकाकरण अनुपालन दर',
    overlayMsg: language === 'en' ? 'Map Overlay:' : 'मानचित्र परत:',
    footer: language === 'en' 
      ? 'Data streams are synchronized with regional electronic health record registry buffers.'
      : 'डेटा स्रोत क्षेत्रीय इलेक्ट्रॉनिक स्वास्थ्य रिकॉर्ड रजिस्ट्री बफर के साथ सिंक्रनाइज़ हैं।'
  };

  const getShadingColor = (subdivision, activeMetric) => {
    const data = subdivisionsData[subdivision];
    const val = activeMetric.toLowerCase();
    
    if (val === 'vaccination') {
      const num = parseInt(data.vaccination);
      if (num >= 95) return 'rgba(0, 128, 55, 0.7)';
      if (num >= 90) return 'rgba(0, 128, 55, 0.4)';
      return 'rgba(220, 38, 38, 0.5)';
    }
    
    const rating = data[val === 'diabetes' ? 'diabetes' : val === 'hypertension' ? 'hypertension' : 'anemia'];
    if (rating.includes('High') || rating.includes('Very High')) {
      return val === 'anemia' ? 'rgba(220, 38, 38, 0.7)' : 'rgba(241, 90, 36, 0.7)';
    }
    if (rating.includes('Medium')) {
      return 'rgba(15, 76, 129, 0.4)';
    }
    return 'rgba(15, 76, 129, 0.1)';
  };

  const getTranslatedBlock = (block) => {
    if (language === 'en') return block;
    return block
      .replace('Rampur Block', 'रामपुर ब्लॉक')
      .replace('Sundergarh Block', 'सुंदरगढ़ ब्लॉक')
      .replace('Raipur Block', 'रायपुर ब्लॉक')
      .replace('Bilaspur Block', 'बिलासपुर ब्लॉक')
      .replace('Durg Block', 'दुर्ग ब्लॉक')
      .replace('Sub-Centre', 'उप-केंद्र')
      .replace('Village', 'गाँव');
  };

  const getTranslatedRating = (rating) => {
    if (language === 'en') return rating;
    return rating
      .replace('High', 'उच्च')
      .replace('Very High', 'अत्यधिक उच्च')
      .replace('Medium', 'मध्यम')
      .replace('Low', 'निम्न');
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.subtitle}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* SVG Map Card */}
        <div className="dashboard-card" style={{ flex: 2, minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px', marginBottom: '20px' }}>
            {/* Scope Toggle */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface-muted)', padding: '4px', borderRadius: '4px' }}>
              {[
                { id: 'District', label: t.district },
                { id: 'PHC', label: t.phc },
                { id: 'Village', label: t.village }
              ].map(sc => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setScope(sc.id);
                    if (sc.id === 'PHC') setSelectedSubdivision('Rampur Sub-Centre');
                    else if (sc.id === 'Village') setSelectedSubdivision('Rampur Village 1');
                    else setSelectedSubdivision('Rampur Block');
                  }}
                  style={{
                    border: 'none',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: scope === sc.id ? 'white' : 'transparent',
                    boxShadow: scope === sc.id ? 'var(--shadow-sm)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                  className={language === 'hi' ? 'hindi-text' : ''}
                >
                  {sc.label}
                </button>
              ))}
            </div>

            {/* Metric Overlay */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'Diabetes', label: t.diabetes },
                { id: 'Hypertension', label: t.hypertension },
                { id: 'Anemia', label: t.anemia },
                { id: 'Vaccination', label: t.vaccination }
              ].map(met => (
                <button
                  key={met.id}
                  onClick={() => setMetric(met.id)}
                  className={`btn ${metric === met.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px' }}
                >
                  <span className={language === 'hi' ? 'hindi-text' : ''}>{met.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SVG Map */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '300px' }}>
            <svg viewBox="0 0 500 350" style={{ width: '100%', height: '100%', maxHeight: '320px' }}>
              <g stroke="#ffffff" strokeWidth="2.5" fill="var(--primary-light)">
                
                <path
                  d="M 50,50 L 220,30 L 240,160 L 90,180 Z"
                  fill={getShadingColor('Rampur Block', metric)}
                  style={{ cursor: 'pointer', transition: 'fill var(--transition-normal)' }}
                  onClick={() => setSelectedSubdivision(scope === 'District' ? 'Rampur Block' : scope === 'PHC' ? 'Rampur Sub-Centre' : 'Rampur Village 1')}
                />
                
                <path
                  d="M 220,30 L 420,50 L 450,150 L 240,160 Z"
                  fill={getShadingColor('Sundergarh Block', metric)}
                  style={{ cursor: 'pointer', transition: 'fill var(--transition-normal)' }}
                  onClick={() => setSelectedSubdivision(scope === 'District' ? 'Sundergarh Block' : scope === 'PHC' ? 'Sundergarh Sub-Centre' : 'Sundergarh Village 2')}
                />

                <path
                  d="M 90,180 L 240,160 L 200,320 L 60,280 Z"
                  fill={getShadingColor('Raipur Block', metric)}
                  style={{ cursor: 'pointer', transition: 'fill var(--transition-normal)' }}
                  onClick={() => setSelectedSubdivision(scope === 'District' ? 'Raipur Block' : scope === 'PHC' ? 'Raipur Sub-Centre' : 'Raipur Village 1')}
                />

                <path
                  d="M 240,160 L 450,150 L 410,290 L 330,310 L 200,320 Z"
                  fill={getShadingColor('Bilaspur Block', metric)}
                  style={{ cursor: 'pointer', transition: 'fill var(--transition-normal)' }}
                  onClick={() => setSelectedSubdivision(scope === 'District' ? 'Bilaspur Block' : scope === 'PHC' ? 'Bilaspur Sub-Centre' : 'Bilaspur Village 3')}
                />

                <path
                  d="M 450,150 L 480,240 L 410,290 Z"
                  fill={getShadingColor('Durg Block', metric)}
                  style={{ cursor: 'pointer', transition: 'fill var(--transition-normal)' }}
                  onClick={() => setSelectedSubdivision(scope === 'District' ? 'Durg Block' : scope === 'PHC' ? 'Durg Sub-Centre' : 'Durg Village 4')}
                />
              </g>

              {/* Text Labels on Map */}
              <text x="120" y="100" fill="var(--text-primary)" fontSize="11" fontWeight="700" textAnchor="middle" className={language === 'hi' ? 'hindi-text' : ''}>
                {scope === 'District' ? 'रामपुर ब्लॉक' : scope === 'PHC' ? 'रामपुर उप-केंद्र' : 'रामपुर गाँव 1'}
              </text>
              <text x="320" y="90" fill="var(--text-primary)" fontSize="11" fontWeight="700" textAnchor="middle" className={language === 'hi' ? 'hindi-text' : ''}>
                {scope === 'District' ? 'सुंदरगढ़ ब्लॉक' : scope === 'PHC' ? 'सुंदरगढ़ उप-केंद्र' : 'सुंदरगढ़ गाँव 2'}
              </text>
              <text x="140" y="240" fill="var(--text-primary)" fontSize="11" fontWeight="700" textAnchor="middle" className={language === 'hi' ? 'hindi-text' : ''}>
                {scope === 'District' ? 'रायपुर ब्लॉक' : scope === 'PHC' ? 'रायपुर उप-केंद्र' : 'रायपुर गाँव 1'}
              </text>
              <text x="310" y="230" fill="var(--text-primary)" fontSize="11" fontWeight="700" textAnchor="middle" className={language === 'hi' ? 'hindi-text' : ''}>
                {scope === 'District' ? 'बिलासपुर ब्लॉक' : stroke === 'PHC' ? 'बिलासपुर उप-केंद्र' : 'बिलासपुर गाँव 3'}
              </text>
              <text x="435" y="210" fill="var(--text-primary)" fontSize="9" fontWeight="700" textAnchor="middle" className={language === 'hi' ? 'hindi-text' : ''}>
                {scope === 'District' ? 'दुर्ग' : scope === 'PHC' ? 'दुर्ग उप-केंद्र' : 'दुर्ग गाँव 4'}
              </text>
            </svg>

            {/* Compass Legend */}
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '6px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              <Compass size={14} color="var(--text-secondary)" />
              <span>{t.overlayMsg} <strong>{t[metric.toLowerCase()]}</strong> ({t[scope.toLowerCase()]} {language === 'en' ? 'level' : 'स्तर'})</span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="dashboard-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
              <Layers size={20} />
              {t.profileTitle}
            </h4>
            
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
              <h5 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '4px' }}>
                {getTranslatedBlock(selectedSubdivision)}
              </h5>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
                {t.profileDesc}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.prevalence}</span>
                <strong>
                  {getTranslatedRating(
                    selectedSubdivision.includes('Sundergarh') ? subdivisionsData['Sundergarh Block'].diabetes :
                    selectedSubdivision.includes('Raipur') ? subdivisionsData['Raipur Block'].diabetes :
                    selectedSubdivision.includes('Bilaspur') ? subdivisionsData['Bilaspur Block'].diabetes :
                    selectedSubdivision.includes('Durg') ? subdivisionsData['Durg Block'].diabetes :
                    subdivisionsData['Rampur Block'].diabetes
                  )}
                </strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.hyperRate}</span>
                <strong>
                  {getTranslatedRating(
                    selectedSubdivision.includes('Sundergarh') ? subdivisionsData['Sundergarh Block'].hypertension :
                    selectedSubdivision.includes('Raipur') ? subdivisionsData['Raipur Block'].hypertension :
                    selectedSubdivision.includes('Bilaspur') ? subdivisionsData['Bilaspur Block'].hypertension :
                    selectedSubdivision.includes('Durg') ? subdivisionsData['Durg Block'].hypertension :
                    subdivisionsData['Rampur Block'].hypertension
                  )}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.anemiaIndex}</span>
                <strong style={{ color: 'var(--danger)' }}>
                  {getTranslatedRating(
                    selectedSubdivision.includes('Sundergarh') ? subdivisionsData['Sundergarh Block'].anemia :
                    selectedSubdivision.includes('Raipur') ? subdivisionsData['Raipur Block'].anemia :
                    selectedSubdivision.includes('Bilaspur') ? subdivisionsData['Bilaspur Block'].anemia :
                    selectedSubdivision.includes('Durg') ? subdivisionsData['Durg Block'].anemia :
                    subdivisionsData['Rampur Block'].anemia
                  )}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.vaccineRate}</span>
                <strong style={{ color: 'var(--gov-green)' }}>
                  {getTranslatedRating(
                    selectedSubdivision.includes('Sundergarh') ? subdivisionsData['Sundergarh Block'].vaccination :
                    selectedSubdivision.includes('Raipur') ? subdivisionsData['Raipur Block'].vaccination :
                    selectedSubdivision.includes('Bilaspur') ? subdivisionsData['Bilaspur Block'].vaccination :
                    selectedSubdivision.includes('Durg') ? subdivisionsData['Durg Block'].vaccination :
                    subdivisionsData['Rampur Block'].vaccination
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--surface-border)', paddingTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.footer}
          </div>
        </div>

      </div>
    </div>
  );
}
