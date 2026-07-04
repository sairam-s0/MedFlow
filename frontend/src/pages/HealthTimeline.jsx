import React from 'react';
import { Award, Activity, ClipboardList, ShieldAlert, Sparkles } from 'lucide-react';

export default function HealthTimeline({ timeline, language }) {
  
  const getEventIcon = (type) => {
    const t = type.toLowerCase();
    if (t.includes('diagnosis')) return <ShieldAlert size={16} color="white" />;
    if (t.includes('vaccination')) return <Award size={16} color="white" />;
    if (t.includes('prescription') || t.includes('medication')) return <Activity size={16} color="white" />;
    return <ClipboardList size={16} color="white" />;
  };

  const getEventColor = (type) => {
    const t = type.toLowerCase();
    if (t.includes('diagnosis')) return 'var(--danger)';
    if (t.includes('vaccination')) return 'var(--gov-green)';
    if (t.includes('prescription') || t.includes('medication')) return 'var(--gov-navy)';
    return 'var(--warning)';
  };

  const t = {
    title: language === 'en' ? 'Lifelong Health History' : 'आजीवन स्वास्थ्य इतिहास',
    subtitle: language === 'en' ? 'Chronological progression of structured medical events' : 'संरचित चिकित्सा घटनाओं की कालानुक्रमिक प्रगति',
    aiBadge: language === 'en' ? 'AI Event Extraction Active' : 'एआई क्लिनिकल निष्कर्षण सक्रिय',
    facility: language === 'en' ? 'Facility:' : 'चिकित्सालय:',
    clinician: language === 'en' ? 'Attending Doctor:' : 'उपचार चिकित्सक:'
  };

  const getTranslatedEventTitle = (title) => {
    if (language === 'en') return title;
    if (title.includes('Typhoid Hospitalization')) return 'टायफाइड के कारण भर्ती';
    if (title.includes('Covid-19 Vaccination')) return 'कोविड-19 टीकाकरण';
    if (title.includes('Type 2 Diabetes Diagnosis')) return 'टाइप 2 मधुमेह निदान';
    if (title.includes('Metformin Dosage Maintained')) return 'मेटफॉर्मिन खुराक जारी';
    if (title.includes('HbA1c Control Improved')) return 'एचबीए1सी नियंत्रण में सुधार';
    if (title.includes('Hypertension Metformin Adjustment')) return 'उच्च रक्तचाप एवं मेटफॉर्मिन समायोजन';
    if (title.includes('Consultation:')) return title.replace('Consultation:', 'परामर्श:');
    if (title.includes('Processed File:')) return title.replace('Processed File:', 'संसाधित दस्तावेज़:');
    return title;
  };

  const getTranslatedEventDetails = (details) => {
    if (language === 'en') return details;
    if (details.includes('enteric fever')) return 'आंत्र ज्वर (टाइफाइड) के लिए अस्पताल में भर्ती। 5 दिन IV एंटीबायोटिक्स। पूर्ण स्वस्थ।';
    if (details.includes('Completed 2-dose')) return 'कोविशील्ड का दो-खुराक टीकाकरण कार्यक्रम पूर्ण किया।';
    if (details.includes('HbA1c of 8.2%')) return 'रूटिन रक्त जांच में एचबीए1सी 8.2% मिलने पर मधुमेह का निदान। मेटफॉर्मिन 500mg दैनिक निर्देशित।';
    if (details.includes('HbA1c improved to 7.4%')) return 'एचबीए1सी में सुधार होकर 7.4% हुआ। मेटफॉर्मिन का शरीर पर अच्छा असर। खान-पान नियंत्रण पर बल।';
    if (details.includes('HbA1c down to 6.8%')) return 'एचबीए1सी नियंत्रण में सुधार (6.8%)। रक्तचाप थोड़ा बढ़ा हुआ (140/90) देखा गया।';
    if (details.includes('Amlodipine 5mg added')) return 'रक्तचाप प्रबंधन के लिए एम्लोडिपाइन 5 मिलीग्राम जोड़ा गया। फास्टिंग शुगर स्थिर (128 mg/dL)।';
    return details;
  };

  const getTranslatedType = (type) => {
    if (language === 'en') return type;
    if (type.includes('Discharge Summary')) return 'डिस्चार्ज सारांश';
    if (type.includes('Vaccination')) return 'टीकाकरण';
    if (type.includes('Diagnosis')) return 'रोग निदान';
    if (type.includes('Medication Adjustment')) return 'खुराक समायोजन';
    if (type.includes('Lab Follow-up')) return 'प्रयोगशाला अनुवर्ती';
    if (type.includes('Prescription')) return 'पर्चा';
    return type;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.subtitle}
          </p>
        </div>
        <div className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}>
          <Sparkles size={14} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.aiBadge}</span>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
        {/* Timeline Path */}
        <div style={{
          position: 'absolute',
          left: '25px',
          top: '0',
          bottom: '0',
          width: '4px',
          backgroundColor: 'var(--surface-border)',
          borderRadius: '2px'
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {timeline.map((event, index) => {
            const color = getEventColor(event.type);
            const delayClass = `animate-cascade-${(index % 5) + 1}`;
            
            return (
              <div 
                key={index} 
                className={delayClass} 
                style={{ display: 'flex', gap: '24px', position: 'relative' }}
              >
                {/* Node */}
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: '6px solid var(--background)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  flexShrink: 0
                }}>
                  {getEventIcon(event.type)}
                </div>

                {/* Event Card */}
                <div className="dashboard-card" style={{ flex: 1, padding: '20px', marginTop: '2px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: color, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em' 
                      }} className={language === 'hi' ? 'hindi-text' : ''}>
                        {getTranslatedType(event.type)}
                      </span>
                      <h4 style={{ 
                        fontSize: '1.15rem', 
                        fontWeight: 700, 
                        fontFamily: 'var(--font-display)',
                        marginTop: '2px'
                      }}>
                        {getTranslatedEventTitle(event.title)}
                      </h4>
                    </div>
                    
                    <div style={{
                      backgroundColor: 'var(--surface-muted)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)'
                    }}>
                      {event.year}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }} className={language === 'hi' ? 'hindi-text' : ''}>
                    {getTranslatedEventDetails(event.details)}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)',
                    borderTop: '1px solid var(--surface-border)',
                    paddingTop: '12px' 
                  }} className={language === 'hi' ? 'hindi-text' : ''}>
                    <span><strong>{t.facility}</strong> {language === 'hi' ? event.facility.replace('PHC', 'प्राथमिक स्वास्थ्य केंद्र') : event.facility}</span>
                    <span><strong>{t.clinician}</strong> {event.doctor}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
