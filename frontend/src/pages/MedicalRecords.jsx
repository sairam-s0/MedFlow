import React, { useState } from 'react';
import { Folder, FileText, CheckCircle2, Eye, LayoutGrid } from 'lucide-react';

export default function MedicalRecords({ records, language }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const categories = [
    { id: 'All', en: 'All', hi: 'सभी' },
    { id: 'Lab Reports', en: 'Lab Reports', hi: 'लैब रिपोर्ट' },
    { id: 'Prescriptions', en: 'Prescriptions', hi: 'पर्चे' },
    { id: 'Discharge Summaries', en: 'Discharge Summaries', hi: 'डिस्चार्ज सारांश' },
    { id: 'Radiology', en: 'Radiology', hi: 'रेडियोलॉजी' },
    { id: 'Vaccination Records', en: 'Vaccination Records', hi: 'टीकाकरण रिकॉर्ड' },
    { id: 'Operations', en: 'Operations', hi: 'ऑपरेशन रिकॉर्ड' }
  ];

  const t = {
    title: language === 'en' ? 'Medical DigiLocker' : 'चिकित्सा डिजीलॉकर',
    subtitle: language === 'en' ? 'Verified and structured digital health documents' : 'सत्यापित और संरचित डिजिटल स्वास्थ्य दस्तावेज',
    verified: language === 'en' ? 'Demo Verified' : 'डेमो सत्यापित',
    facility: language === 'en' ? 'Hospital:' : 'चिकित्सालय:',
    clinician: language === 'en' ? 'Doctor:' : 'चिकित्सक:',
    date: language === 'en' ? 'Date:' : 'दिनांक:',
    eventTitle: language === 'en' ? 'Extracted Medical Event' : 'संरचित नैदानिक तथ्य',
    originalBtn: language === 'en' ? 'Open Original' : 'मूल फाइल खोलें',
    summaryBtn: language === 'en' ? 'Clinical Summary' : 'नैदानिक ​​सारांश',
    pdfTitle: language === 'en' ? 'Original Document Preview' : 'मूल दस्तावेज़ (स्कैन)',
    extractedTitle: language === 'en' ? 'Gemini AI Clinical Extraction' : 'जेमिनी एआई नैदानिक ​​अन्वेषण',
    noRecords: language === 'en' ? 'No records found in this folder' : 'इस फ़ोल्डर में कोई रिकॉर्ड नहीं मिला',
    keyMetrics: language === 'en' ? 'Extracted Key Metrics' : 'मुख्य स्वास्थ्य संकेतक',
    notes: language === 'en' ? 'Normalized Clinical Notes' : 'चिकित्सक टिप्पणियां',
    recs: language === 'en' ? 'Treatment Recommendations' : 'चिकित्सा सिफारिशें',
    close: language === 'en' ? 'Close' : 'बंद करें'
  };

  const filteredRecords = activeCategory === 'All'
    ? records
    : records.filter(rec => rec.category === activeCategory);

  const getTranslatedCategory = (catId) => {
    const found = categories.find(c => c.id === catId);
    return language === 'hi' ? found?.hi : found?.en;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.subtitle}
        </p>
      </div>

      {/* Folders Navigation */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px', scrollbarWidth: 'none' }}>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(cat.id)}
            className={`btn ${activeCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-full)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {cat.id === 'All' ? <LayoutGrid size={16} /> : <Folder size={16} />}
            <span className={language === 'hi' ? 'hindi-text' : ''}>
              {language === 'hi' ? cat.hi : cat.en}
            </span>
          </button>
        ))}
      </div>

      {/* Records Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredRecords.map((rec) => (
          <div key={rec.id} className="dashboard-card animate-scale-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '260px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span className={`badge ${
                  rec.category === 'Prescriptions' ? 'badge-primary' :
                  rec.category === 'Lab Reports' ? 'badge-saffron' :
                  rec.category === 'Discharge Summaries' ? 'badge-danger' :
                  'badge-green'
                }`} className={language === 'hi' ? 'badge hindi-text' : 'badge'}>
                  {getTranslatedCategory(rec.category)}
                </span>
                {rec.verified && (
                  <span className="badge badge-green" style={{ textTransform: 'none', padding: '4px 8px', fontSize: '0.7rem' }}>
                    <CheckCircle2 size={12} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.verified}</span>
                  </span>
                )}
              </div>

              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--primary)" />
                {language === 'hi' && rec.title === 'General OPD Prescription' ? 'सामान्य ओपीडी पर्चा' :
                 language === 'hi' && rec.title === 'HbA1c Blood Panel Report' ? 'एचबीए1सी ब्लड पैनल रिपोर्ट' :
                 language === 'hi' && rec.title === 'Typhoid Care Discharge Summary' ? 'टायफाइड केयर डिस्चार्ज सारांश' :
                 language === 'hi' && rec.title === 'Adult Covid-19 Vaccination Certificate' ? 'वयस्क कोविड-19 टीकाकरण प्रमाणपत्र' : rec.title}
              </h4>
              
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                <p><strong>{t.facility}</strong> {language === 'hi' ? rec.hospital.replace('PHC', 'प्राथमिक स्वास्थ्य केंद्र') : rec.hospital}</p>
                <p><strong>{t.clinician}</strong> {rec.doctor}</p>
                <p><strong>{t.date}</strong> {rec.date}</p>
              </div>

              {/* Structured AI Summary box */}
              <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)', marginBottom: '16px', fontSize: '0.8rem' }}>
                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  {t.eventTitle}
                </strong>
                <p style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>
                  "{language === 'hi' && rec.structuredSummary.keyMetrics.includes('Blood Pressure') ? 'रक्तचाप: 135/85 mmHg, फास्टिंग शुगर: 128 mg/dL' :
                    language === 'hi' && rec.structuredSummary.keyMetrics.includes('HbA1c') ? 'एचबीए1सी: 6.8%, फास्टिंग ग्लूकोज: 118 mg/dL' :
                    language === 'hi' && rec.structuredSummary.keyMetrics.includes('Widal') ? 'महत्वपूर्ण लक्षण स्थिर, विडाल टेस्ट: सकारात्मक' :
                    language === 'hi' && rec.structuredSummary.keyMetrics.includes('COVISHIELD') ? 'टीका: कोविशील्ड, खुराक: दूसरी खुराक' : rec.structuredSummary.keyMetrics}"
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => setSelectedRecord({ ...rec, showPdf: true })}>
                <Eye size={14} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.originalBtn}</span>
              </button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => setSelectedRecord({ ...rec, showPdf: false })}>
                <span className={language === 'hi' ? 'hindi-text' : ''}>{t.summaryBtn}</span>
              </button>
            </div>
          </div>
        ))}
        {filteredRecords.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <Folder size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
            <p className={language === 'hi' ? 'hindi-text' : ''}>{t.noRecords}</p>
          </div>
        )}
      </div>

      {/* Modal Box for PDF / Clinical Summary Viewer */}
      {selectedRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11, 34, 64, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} className="animate-fade-in">
          <div className="dashboard-card" style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1.25rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
                {selectedRecord.showPdf ? t.pdfTitle : t.extractedTitle}
              </h3>
              <button onClick={() => setSelectedRecord(null)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            {selectedRecord.showPdf ? (
              <div style={{ backgroundColor: 'var(--surface-muted)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--text-muted)', height: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '24px', textAlign: 'center' }}>
                <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <p style={{ fontWeight: 600 }}>[MOCK PDF] {selectedRecord.title}.pdf</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  {language === 'en' ? 'Original scans are represented here as demo placeholders for the prototype.' : 'मूल स्कैन इस प्रोटोटाइप में डेमो प्लेसहोल्डर के रूप में दिखाए गए हैं।'}
                </p>
                <span className="badge badge-green" style={{ marginTop: '16px' }}>
                  <CheckCircle2 size={12} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{language === 'en' ? 'Digital Hash Verified' : 'डिजिटल हैश सत्यापित'}</span>
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '12px' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.keyMetrics}</span>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>
                    {language === 'hi' && selectedRecord.structuredSummary.keyMetrics.includes('Blood Pressure') ? 'रक्तचाप: 135/85 mmHg, फास्टिंग ब्लड शुगर: 128 mg/dL' :
                     language === 'hi' && selectedRecord.structuredSummary.keyMetrics.includes('HbA1c') ? 'एचबीए1सी: 6.8% (लक्ष्य < 6.5%), फास्टिंग ग्लूकोज: 118 mg/dL' :
                     language === 'hi' && selectedRecord.structuredSummary.keyMetrics.includes('Widal') ? 'महत्वपूर्ण लक्षण स्थिर, विडाल टेस्ट: सकारात्मक' :
                     language === 'hi' && selectedRecord.structuredSummary.keyMetrics.includes('COVISHIELD') ? 'टीका: कोविशील्ड, खुराक: दूसरी खुराक' : selectedRecord.structuredSummary.keyMetrics}
                  </p>
                </div>
                
                <div style={{ borderLeft: '4px solid var(--gov-saffron)', paddingLeft: '12px' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.notes}</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                    {language === 'hi' && selectedRecord.structuredSummary.clinicalNotes.includes('BP observed') ? 'रक्तचाप प्रबंधन के लिए एम्लोडिपाइन 5 मिलीग्राम जोड़ा गया।' :
                     language === 'hi' && selectedRecord.structuredSummary.clinicalNotes.includes('Glycemic') ? 'मधुमेह नियंत्रण में सुधार। मेटफॉर्मिन अनुपालन अच्छा है।' :
                     language === 'hi' && selectedRecord.structuredSummary.clinicalNotes.includes('Ceftriaxone') ? 'IV सेफ्ट्रिएक्सोन से प्रबंधित। 7 दिन की एंटीबायोटिक पाठ्यक्रम।' :
                     language === 'hi' && selectedRecord.structuredSummary.clinicalNotes.includes('received') ? 'कोविशील्ड की दूसरी खुराक दी गई। कोई प्रतिकूल प्रतिक्रिया नहीं।' : selectedRecord.structuredSummary.clinicalNotes}
                  </p>
                </div>

                <div style={{ borderLeft: '4px solid var(--gov-green)', paddingLeft: '12px' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.recs}</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                    {language === 'hi' && selectedRecord.structuredSummary.recommendations.includes('Limit salt') ? 'नमक का सेवन सीमित करें, शर्करा की दैनिक निगरानी करें, 3 महीने में लौटें।' :
                     language === 'hi' && selectedRecord.structuredSummary.recommendations.includes('Maintain current') ? 'वर्तमान उपचार जारी रखें। 6 महीने में परीक्षण दोहराएं।' :
                     language === 'hi' && selectedRecord.structuredSummary.recommendations.includes('Complete') ? '7 दिनों का मौखिक एंटीबायोटिक कोर्स पूरा करें, हल्का भोजन लें।' :
                     language === 'hi' && selectedRecord.structuredSummary.recommendations.includes('protocols') ? 'मानक सुरक्षा प्रोटोकॉल जारी रखें।' : selectedRecord.structuredSummary.recommendations}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  <span>{t.clinician} {selectedRecord.doctor}</span>
                  <span>{t.facility} {language === 'hi' ? selectedRecord.hospital.replace('PHC', 'प्राथमिक स्वास्थ्य केंद्र') : selectedRecord.hospital}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
                <span className={language === 'hi' ? 'hindi-text' : ''}>{t.close}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
