import React, { useState, useEffect } from 'react';
import { QrCode, ShieldAlert, Pill, FileText, CheckCircle2, Save, RefreshCw, Smartphone, Camera, Calendar, Heart } from 'lucide-react';
import { apiStub } from '../services/apiStub';

export default function DoctorConsult({ reloadData, language, t }) {
  const [isScanning, setIsScanning] = useState(true);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientLoaded, setPatientLoaded] = useState(false);
  const [activePatient, setActivePatient] = useState(null);
  const [scanError, setScanError] = useState('');

  // Form states
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [weight, setWeight] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load html5-qrcode scanner library from CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.async = true;
    script.onload = () => console.log('[Doctor Desk] html5-qrcode library loaded.');
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
      stopScanner();
    };
  }, []);

  let qrScannerInstance = null;

  const startScanner = () => {
    setScanError('');
    setIsScanning(true);
    setPatientLoaded(false);

    // Wait a brief tick for div#reader to mount
    setTimeout(() => {
      try {
        if (!window.Html5Qrcode) {
          setScanError('QR scanning library is loading. Please wait a second.');
          return;
        }

        const scanner = new window.Html5Qrcode("reader");
        window.activeQrScanner = scanner;

        scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText) => {
            // Decoded QR message successfully
            console.log("Scanned QR Text:", decodedText);
            
            // Extract token if it is a complete verification URL
            let token = decodedText;
            if (decodedText.includes('/verify/')) {
              token = decodedText.split('/verify/')[1];
            } else if (decodedText.startsWith('medflow-patient-')) {
              // Sandbox demo fallback if they scan old static QR
              token = decodedText.replace('medflow-patient-', '');
            }

            // Stop scanner & load patient
            await stopScanner();
            handleVerifyPatient(token);
          },
          (err) => {
            // Ignore normal framing parsing errors
          }
        ).catch(err => {
          console.error("Camera Start Error:", err);
          setScanError('Failed to access camera. Please verify camera permissions.');
        });

      } catch (err) {
        console.error("Scanner setup failed:", err);
        setScanError('Could not initialize camera scanner.');
      }
    }, 300);
  };

  const stopScanner = async () => {
    if (window.activeQrScanner) {
      try {
        await window.activeQrScanner.stop();
        window.activeQrScanner = null;
      } catch (e) {
        // Already stopped or not running
      }
    }
  };

  // Verify token and fetch patient summary from backend
  const handleVerifyPatient = async (token) => {
    setLoadingPatient(true);
    setIsScanning(false);
    setScanError('');

    try {
      let patientHealthId = token;

      // Check if it's a real token validation or fallback
      if (token.length > 20) {
        const verifyRes = await apiStub.verifyQRToken(token);
        patientHealthId = verifyRes.health_id;
      }

      apiStub.setActiveCitizenId(patientHealthId); // Link active ID for records retrieval
      const summary = await apiStub.getDoctorPatientSummary(patientHealthId);
      
      setActivePatient(summary);
      setLoadingPatient(false);
      setPatientLoaded(true);
    } catch (err) {
      setLoadingPatient(false);
      setIsScanning(true);
      setScanError(err.message || t.doctor.invalidToken);
      // Restart scanner on error
      startScanner();
    }
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!diagnosis || !prescription) {
      alert(language === 'en' ? 'Please fill in required fields.' : 'कृपया आवश्यक फ़ील्ड भरें।');
      return;
    }
    setSaving(true);
    try {
      await apiStub.addConsultation({
        health_id: activePatient.health_id,
        doctor_name: t.brand.nha,
        diagnosis,
        prescription,
        notes,
        blood_pressure: bloodPressure,
        blood_sugar: bloodSugar,
        weight: weight,
        followup_date: followupDate
      });
      setSaving(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDiagnosis('');
        setPrescription('');
        setNotes('');
        setBloodPressure('');
        setBloodSugar('');
        setWeight('');
        setFollowupDate('');
        setPatientLoaded(false);
        setIsScanning(true);
        reloadData();
      }, 2000);
    } catch (err) {
      setSaving(false);
      alert('Error saving consultation: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.doctor.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.doctor.subtitle}
          </p>
        </div>
      </div>

      {isScanning && (
        <div style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }} className="animate-scale-in">
          <div className="dashboard-card" style={{ padding: '36px' }}>
            <h3 style={{ marginBottom: '8px', fontWeight: 700 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.doctor.scanTitle}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.doctor.scanDesc}
            </p>

            {scanError && (
              <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', fontSize: '0.82rem', borderRadius: '8px', marginBottom: '16px', alignItems: 'center', textAlign: 'left' }}>
                <ShieldAlert size={16} />
                <span>{scanError}</span>
              </div>
            )}
            
            {/* HTML5 QR Camera Video target */}
            <div id="reader" style={{
              width: '100%',
              maxWidth: '300px',
              minHeight: '260px',
              border: '2.5px solid var(--gov-navy)',
              borderRadius: '16px',
              margin: '0 auto 24px auto',
              overflow: 'hidden',
              backgroundColor: '#f8fafc'
            }}></div>

            <button className="btn btn-primary" onClick={startScanner} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'var(--gov-navy)' }}>
              <Camera size={18} />
              <span className={language === 'hi' ? 'hindi-text' : ''}>{t.doctor.scanBtn}</span>
            </button>
            
            <button className="btn btn-secondary" onClick={stopScanner} style={{ width: '100%', marginTop: '8px' }}>
              <span className={language === 'hi' ? 'hindi-text' : ''}>{t.doctor.stopBtn}</span>
            </button>
          </div>
        </div>
      )}

      {loadingPatient && (
        <div style={{ textAlign: 'center', padding: '80px' }} className="animate-fade-in">
          <RefreshCw className="animate-spin" size={48} color="var(--primary)" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontWeight: 700 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.doctor.decrypting}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.doctor.decryptingDesc}
          </p>
        </div>
      )}

      {patientLoaded && activePatient && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Patient Header Summary */}
          <div className="dashboard-card" style={{ background: '#f8fafc', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', borderLeft: '6px solid var(--gov-green)' }}>
            <div>
              <span className="badge badge-green" style={{ marginBottom: '8px' }} className={language === 'hi' ? 'badge badge-green hindi-text' : 'badge badge-green'}>
                {t.doctor.sessionBadge}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
                {t.doctor.patientLabel}: {activePatient.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
                <strong>{t.doctor.bioLabel}:</strong> {activePatient.age} {language === 'en' ? 'yrs' : 'वर्ष'} / {activePatient.gender === 'Male' && language === 'hi' ? 'पुरुष' : (activePatient.gender === 'Female' && language === 'hi' ? 'महिला' : activePatient.gender)} | <strong>{t.doctor.bloodLabel}:</strong> {activePatient.blood_group} | <strong>{t.doctor.abhaLabel}:</strong> {activePatient.health_id}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
                Height: <strong>{activePatient.height || '—'} cm</strong> &middot; Weight: <strong>{activePatient.weight || '—'} kg</strong> &middot; Address: <strong>{activePatient.address}</strong>
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => { setPatientLoaded(false); setIsScanning(true); startScanner(); }} style={{ height: 'fit-content' }}>
              <span className={language === 'hi' ? 'hindi-text' : ''}>{t.doctor.disconnect}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Allergies / Conditions */}
            <div className="dashboard-card">
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.doctor.risksTitle}</span>
              </h4>
              <div style={{ marginBottom: '12px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                <strong>{t.doctor.allergies}:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {activePatient.allergies && activePatient.allergies.map((all, idx) => (
                    <span key={idx} className="badge badge-danger">{language === 'hi' && all === 'Penicillin' ? 'पेनिसिलिन' : all}</span>
                  ))}
                  {(!activePatient.allergies || activePatient.allergies.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No allergies recorded.</span>}
                </div>
              </div>
              <div className={language === 'hi' ? 'hindi-text' : ''}>
                <strong>{t.doctor.conditions}:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {activePatient.conditions && activePatient.conditions.map((cond, idx) => (
                    <span key={idx} className="badge badge-saffron">
                      {language === 'hi' && cond.name === 'Type 2 Diabetes' ? 'टाइप 2 मधुमेह' : 
                       language === 'hi' && cond.name === 'Mild Hypertension' ? 'हल्का उच्च रक्तचाप' : cond.name}
                    </span>
                  ))}
                  {(!activePatient.conditions || activePatient.conditions.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No conditions recorded.</span>}
                </div>
              </div>
            </div>

            {/* Current Medications */}
            <div className="dashboard-card">
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', color: 'var(--gov-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={20} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.doctor.medications}</span>
              </h4>
              <ul style={{ listStyle: 'none' }}>
                {activePatient.medications && activePatient.medications.map((med, idx) => (
                  <li key={idx} style={{ padding: '6px 0', borderBottom: idx < activePatient.medications.length - 1 ? '1px solid var(--surface-border)' : 'none', fontSize: '0.85rem' }}>
                    <strong>{med.name}</strong> ({med.dosage}) - {med.frequency}
                  </li>
                ))}
                {(!activePatient.medications || activePatient.medications.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active medications.</span>}
              </ul>
            </div>
          </div>

          {/* AI Clinical Summary Alert */}
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '16px', borderLeft: '4px solid var(--primary)', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.5' }}>
            <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>Gemini AI Extracted Case Summary:</strong>
            <p style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>"{activePatient.ai_summary}"</p>
          </div>

          {/* Vitals Trends Graph Logs */}
          <div className="dashboard-card">
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={20} color="var(--danger)" /> <span>Recent Patient Lab Results & Vitals Logs</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {activePatient.recent_lab_trends && activePatient.recent_lab_trends.map((lab) => (
                <div key={lab.id} style={{ border: '1px solid var(--surface-border)', padding: '12px', borderRadius: '8px', backgroundColor: '#fafbfe' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{lab.date}</span>
                  <p style={{ fontWeight: 700, marginTop: '4px' }}>{lab.test_name}</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                    {lab.value} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{lab.unit}</span>
                  </p>
                  <span className="badge badge-primary" style={{ marginTop: '6px', fontSize: '0.7rem' }}>{lab.status}</span>
                </div>
              ))}
              {(!activePatient.recent_lab_trends || activePatient.recent_lab_trends.length === 0) && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent lab trends recorded.</span>
              )}
            </div>
          </div>

          {/* Recent Records list */}
          <div className="dashboard-card">
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="var(--primary)" /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.doctor.recentLogs}</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activePatient.recent_records && activePatient.recent_records.map((rec) => (
                <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '10px', fontSize: '0.85rem' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>
                      {rec.record_type} - <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>{rec.hospital}</span>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {rec.structured_summary ? rec.structured_summary.keyMetrics : ''}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.date}</span>
                </div>
              ))}
              {(!activePatient.recent_records || activePatient.recent_records.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent medical records.</span>}
            </div>
          </div>

          {/* Consultation form */}
          <div className="dashboard-card" style={{ border: '2px solid var(--gov-navy)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--gov-navy)', display: 'flex', alignItems: 'center', gap: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.doctor.addConsult}
            </h3>

            {success ? (
              <div style={{ textAlign: 'center', padding: '30px' }} className="animate-scale-in">
                <CheckCircle2 size={48} color="var(--gov-green)" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontWeight: 700 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.doctor.successTitle}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.doctor.successDesc}</p>
              </div>
            ) : (
              <form onSubmit={handleSaveConsultation}>
                <div className="form-group">
                  <label className="form-label">{t.doctor.diagnosisLabel}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Acute Bronchitis, Type 2 Diabetes"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.doctor.prescriptionLabel}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Paracetamol 500mg, Metformin 500mg"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    required
                  />
                </div>

                {/* Vitals Form Block */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t.doctor.bpLabel}</label>
                    <input type="text" className="form-control" placeholder="120/80" value={bloodPressure} onChange={e => setBloodPressure(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t.doctor.sugarLabel}</label>
                    <input type="number" className="form-control" placeholder="110" value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t.doctor.weightLabel}</label>
                    <input type="number" className="form-control" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.doctor.followupLabel}</label>
                  <input type="date" className="form-control" value={followupDate} onChange={e => setFollowupDate(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.doctor.notesLabel}</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe clinical findings and vital metrics..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '10px', backgroundColor: 'var(--gov-navy)', height: '48px', fontSize: '1rem' }} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> <span>{t.doctor.savingBtn}</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} /> <span>{t.doctor.saveBtn}</span>
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
