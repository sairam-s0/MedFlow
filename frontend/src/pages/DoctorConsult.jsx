import React, { useState } from 'react';
import { QrCode, ShieldAlert, Pill, FileText, CheckCircle2, Save, RefreshCw } from 'lucide-react';
import { apiStub } from '../services/apiStub';

export default function DoctorConsult({ profile, records, timeline, reloadData, language }) {
  const [isScanning, setIsScanning] = useState(true);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientLoaded, setPatientLoaded] = useState(false);

  // Form states
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const t = {
    title: language === 'en' ? 'Clinical Provider Desk' : 'नैदानिक चिकित्सक डेस्क',
    subtitle: language === 'en' ? 'Secure clinic desk for doctor consultation and record entry' : 'डॉक्टर परामर्श और रिकॉर्ड प्रविष्टि के लिए सुरक्षित क्लिनिक डेस्क',
    scanTitle: language === 'en' ? 'Scan Patient ID QR' : 'रोगी स्वास्थ्य आईडी क्यूआर स्कैन करें',
    scanDesc: language === 'en' ? "Position the patient's digital health QR code card inside the camera frame to retrieve records." : 'रोगी का डिजिटल स्वास्थ्य क्यूआर कोड कार्ड कैमरा फ्रेम के भीतर रखें जिससे चिकित्सा रिकॉर्ड प्राप्त किया जा सके।',
    scanBtn: language === 'en' ? 'Simulate QR Scan' : 'क्यूआर कोड स्कैन सिमुलेट करें',
    decrypting: language === 'en' ? 'Decrypting Digital Health Lock...' : 'डिजिटल हेल्थ लॉक डिक्रिप्ट किया जा रहा है...',
    decryptingDesc: language === 'en' ? 'Retrieving clinical tokens and checking citizen consent status' : 'नैदानिक ​​टोकन प्राप्त किए जा रहे हैं और नागरिक सहमति स्थिति जांची जा रही है',
    disconnect: language === 'en' ? 'Disconnect Patient' : 'रोगी सत्र बंद करें',
    sessionBadge: language === 'en' ? 'Active Scanned Session' : 'सक्रिय स्कैन सत्र',
    patientLabel: language === 'en' ? 'Patient' : 'रोगी',
    bioLabel: language === 'en' ? 'Bio' : 'विवरण',
    bloodLabel: language === 'en' ? 'Blood Group' : 'रक्त समूह',
    abhaLabel: language === 'en' ? 'Demo Health ID' : 'डेमो हेल्थ आईडी',
    risksTitle: language === 'en' ? 'Clinical Risks & Vitals' : 'नैदानिक ​​जोखिम और वाइटल्स',
    allergies: language === 'en' ? 'Allergies' : 'एलर्जी',
    conditions: language === 'en' ? 'Current Conditions' : 'सक्रिय रोग स्थितियां',
    medications: language === 'en' ? 'Active Medications' : 'सक्रिय दवाएं',
    recentLogs: language === 'en' ? 'Recent Clinic Notes & Labs' : 'हालिया क्लिनिक नोट्स और लैब परीक्षण',
    addConsult: language === 'en' ? "Add Today's Consultation" : 'आज का नैदानिक परामर्श जोड़ें',
    diagnosisLabel: language === 'en' ? 'Diagnosis' : 'रोग निदान (Diagnosis)',
    prescriptionLabel: language === 'en' ? 'Prescription (Comma-separated medications)' : 'पर्चे की दवाएं (अल्पविराम से अलग करें)',
    notesLabel: language === 'en' ? 'Clinical Consultation Notes' : 'नैदानिक ​​परामर्श टिप्पणियां',
    saveBtn: language === 'en' ? 'Save & Sync to Lifelong Health Record' : 'आजीवन स्वास्थ्य रिकॉर्ड में सहेजें और सिंक करें',
    savingBtn: language === 'en' ? 'Saving & Syncing Record...' : 'रिकॉर्ड सहेजा और सिंक किया जा रहा है...',
    successTitle: language === 'en' ? 'Record Encrypted & Uploaded' : 'रिकॉर्ड एन्क्रिप्टेड और सुरक्षित अपलोड किया गया',
    successDesc: language === 'en' ? 'Successfully saved to citizen digital health profile.' : 'नागरिक डिजिटल स्वास्थ्य प्रोफ़ाइल में सफलतापूर्वक सहेजा गया।'
  };

  const handleSimulateScan = () => {
    setLoadingPatient(true);
    setIsScanning(false);
    setTimeout(() => {
      setLoadingPatient(false);
      setPatientLoaded(true);
    }, 1200);
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!diagnosis || !prescription) {
      alert(language === 'en' ? 'Please fill in required fields.' : 'कृपया आवश्यक फ़ील्ड भरें।');
      return;
    }
    setSaving(true);
    try {
      await apiStub.addConsultation({ diagnosis, prescription, notes });
      setSaving(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDiagnosis('');
        setPrescription('');
        setNotes('');
        reloadData();
      }, 2000);
    } catch (err) {
      setSaving(false);
      alert('Error saving consultation.');
    }
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

      {isScanning && (
        <div style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }} className="animate-scale-in">
          <div className="dashboard-card" style={{ padding: '36px' }}>
            <h3 style={{ marginBottom: '8px', fontWeight: 700 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.scanTitle}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.scanDesc}
            </p>
            
            <div style={{
              width: '240px',
              height: '240px',
              border: '4px solid var(--gov-navy)',
              borderRadius: '16px',
              margin: '0 auto 24px auto',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fafc',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: 'var(--danger)',
                boxShadow: '0 0 8px var(--danger)',
                animation: 'pulse-ring 2s infinite ease-in-out',
                width: '100%'
              }} />
              <QrCode size={120} color="var(--gov-navy)" style={{ opacity: 0.2 }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select className="form-control" style={{ textAlign: 'center' }}>
                <option value="aarav">Aarav Sharma (Demo ID: 91-4829-1029-4821)</option>
              </select>
              <button className="btn btn-primary" onClick={handleSimulateScan} style={{ width: '100%' }}>
                <span className={language === 'hi' ? 'hindi-text' : ''}>{t.scanBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingPatient && (
        <div style={{ textAlign: 'center', padding: '80px' }} className="animate-fade-in">
          <RefreshCw className="animate-scale-in" size={48} color="var(--primary)" style={{ animation: 'pulse-ring 1s infinite', margin: '0 auto 16px auto' }} />
          <h3 style={{ fontWeight: 700 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.decrypting}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.decryptingDesc}
          </p>
        </div>
      )}

      {patientLoaded && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Patient Header Summary */}
          <div className="dashboard-card" style={{ background: '#f8fafc', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', borderLeft: '6px solid var(--gov-green)' }}>
            <div>
              <span className="badge badge-green" style={{ marginBottom: '8px' }} className={language === 'hi' ? 'badge badge-green hindi-text' : 'badge badge-green'}>
                {t.sessionBadge}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
                {t.patientLabel}: {profile.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
                <strong>{t.bioLabel}:</strong> {profile.age} {language === 'en' ? 'yrs' : 'वर्ष'} / {profile.gender === 'Male' && language === 'hi' ? 'पुरुष' : profile.gender} | <strong>{t.bloodLabel}:</strong> {profile.bloodGroup} | <strong>{t.abhaLabel}:</strong> {profile.id}
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => { setPatientLoaded(false); setIsScanning(true); }}>
              <span className={language === 'hi' ? 'hindi-text' : ''}>{t.disconnect}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            <div className="dashboard-card">
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.risksTitle}</span>
              </h4>
              <div style={{ marginBottom: '12px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                <strong>{t.allergies}:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {profile.allergies.map((all, idx) => (
                    <span key={idx} className="badge badge-danger">{language === 'hi' && all === 'Penicillin' ? 'पेनिसिलिन' : all}</span>
                  ))}
                </div>
              </div>
              <div className={language === 'hi' ? 'hindi-text' : ''}>
                <strong>{t.conditions}:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {profile.currentConditions.map((cond, idx) => (
                    <span key={idx} className="badge badge-saffron">
                      {language === 'hi' && cond === 'Type 2 Diabetes' ? 'टाइप 2 मधुमेह' : 
                       language === 'hi' && cond === 'Mild Hypertension' ? 'हल्का उच्च रक्तचाप' : cond}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', color: 'var(--gov-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={20} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.medications}</span>
              </h4>
              <ul style={{ listStyle: 'none' }}>
                {profile.currentMedications.map((med, idx) => (
                  <li key={idx} style={{ padding: '6px 0', borderBottom: idx < profile.currentMedications.length - 1 ? '1px solid var(--surface-border)' : 'none', fontSize: '0.85rem' }}>
                    <strong>
                      {language === 'hi' && med.name === 'Metformin' ? 'मेटफॉर्मिन' : 
                       language === 'hi' && med.name === 'Amlodipine' ? 'एम्लोडिपाइन' : med.name}
                    </strong> ({med.dose}) - {language === 'hi' && med.freq.includes('Once daily') ? 'दिन में एक बार' : med.freq}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Recent Records list */}
          <div className="dashboard-card">
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="var(--primary)" /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.recentLogs}</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {records.slice(0, 3).map((rec) => (
                <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '10px', fontSize: '0.85rem' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>
                      {language === 'hi' && rec.title === 'General OPD Prescription' ? 'सामान्य ओपीडी पर्चा' :
                       language === 'hi' && rec.title === 'HbA1c Blood Panel Report' ? 'एचबीए1सी ब्लड पैनल रिपोर्ट' :
                       language === 'hi' && rec.title === 'Typhoid Care Discharge Summary' ? 'टायफाइड केयर डिस्चार्ज सारांश' : rec.title} - <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>{language === 'hi' ? rec.hospital.replace('PHC', 'प्राथमिक स्वास्थ्य केंद्र') : rec.hospital}</span>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {language === 'hi' && rec.structuredSummary.keyMetrics.includes('Blood Pressure') ? 'रक्तचाप: 135/85 mmHg, फास्टिंग शुगर: 128 mg/dL' :
                       language === 'hi' && rec.structuredSummary.keyMetrics.includes('HbA1c') ? 'एचबीए1सी: 6.8%, फास्टिंग ग्लूकोज: 118 mg/dL' : rec.structuredSummary.keyMetrics}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Consultation form */}
          <div className="dashboard-card" style={{ border: '2px solid var(--gov-navy)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--gov-navy)', display: 'flex', alignItems: 'center', gap: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.addConsult}
            </h3>

            {success ? (
              <div style={{ textAlign: 'center', padding: '30px' }} className="animate-scale-in">
                <CheckCircle2 size={48} color="var(--gov-green)" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontWeight: 700 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.successTitle}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.successDesc}</p>
              </div>
            ) : (
              <form onSubmit={handleSaveConsultation}>
                <div className="form-group">
                  <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>{t.diagnosisLabel}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={language === 'en' ? "e.g. Acute Bronchitis, Type 2 Diabetes" : "जैसे: तीव्र ब्रोंकाइटिस, टाइप 2 मधुमेह"}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>{t.prescriptionLabel}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={language === 'en' ? "e.g. Paracetamol 500mg daily, Metformin 500mg" : "जैसे: पैरासिटामोल 500mg दैनिक, मेटफॉर्मिन 500mg"}
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>{t.notesLabel}</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder={language === 'en' ? "Describe clinical findings and vital metrics..." : "नैदानिक ​​​​निष्कर्षों और महत्वपूर्ण स्वास्थ्य संकेतकों का वर्णन करें..."}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '10px', backgroundColor: 'var(--gov-navy)' }} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw size={18} style={{ animation: 'pulse-ring 1s infinite' }} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.savingBtn}</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.saveBtn}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
