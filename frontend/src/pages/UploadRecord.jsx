import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, RefreshCw, ArrowRight, Sparkles, FileText, X, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { apiStub } from '../services/apiStub';

export default function UploadRecord({ reloadData, setPage, language, t }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('Lab Reports');
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  
  // Step controls
  const [step, setStep] = useState(1); // 1 = Upload, 2 = Confirm Review, 3 = Success
  const [uploadError, setUploadError] = useState(null);
  
  // Editable extracted data states
  const [reviewForm, setReviewForm] = useState({
    hospital: '',
    doctor: '',
    date: '',
    record_type: 'Lab Reports',
    diagnoses: '',
    medications: [],
    lab_results: [],
    vaccinations: []
  });

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const acceptFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      alert(language === 'en'
        ? 'Only JPG, PNG, or PDF files are supported.'
        : 'केवल JPG, PNG या PDF फाइलें समर्थित हैं।'
      );
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e) => {
    acceptFile(e.target.files[0]);
  };

  // Step 1: Upload and run AI OCR/Extraction
  const handleUploadExtract = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert(t.upload.noFile);
      return;
    }
    setProcessing(true);
    setUploadError(null);
    setProgressMsg(language === 'en' ? 'Uploading file and running local OCR...' : 'दस्तावेज़ अपलोड कर ओसीआर चलाया जा रहा है...');

    try {
      const aiData = await apiStub.extractDocumentAI(selectedFile);
      setProcessing(false);
      
      const event = aiData.event || aiData;
      
      // Check for low confidence / extraction failure
      const hasContent = anyExtractedContent(event);
      if (event.extraction_confidence === 'low' && !hasContent) {
        setUploadError(event.notes || t.upload.retryDesc);
        return;
      }

      // Populate review form with AI-extracted entities
      setReviewForm({
        hospital: event.hospital_or_clinic || 'Unknown Hospital',
        doctor: event.doctor_name || 'Unknown Doctor',
        date: event.date || new Date().toISOString().split('T')[0],
        record_type: category,
        diagnoses: event.diagnosis ? event.diagnosis.join(', ') : '',
        medications: event.medications ? event.medications.map(m => ({
          name: m.name || '',
          dosage: m.dosage || 'Standard',
          frequency: m.frequency || 'Once daily'
        })) : [],
        lab_results: event.lab_results ? event.lab_results.map(l => ({
          test_name: l.test_name || '',
          value: l.value || '',
          unit: l.unit || '',
          status: l.flag || 'Normal',
          trend: 'Stable'
        })) : [],
        vaccinations: event.document_type === 'vaccination_record' ? [{
          vaccine_name: event.notes || 'Universal Vaccine',
          dose_number: 1,
          date: event.date || new Date().toISOString().split('T')[0]
        }] : []
      });

      setStep(2); // Go to review step
    } catch (err) {
      setProcessing(false);
      setUploadError(err.message || t.upload.retryDesc);
    }
  };

  const anyExtractedContent = (event) => {
    return !!(
      (event.document_type && event.document_type !== 'unknown') ||
      event.hospital_or_clinic ||
      event.doctor_name ||
      (event.diagnosis && event.diagnosis.length > 0) ||
      (event.medications && event.medications.length > 0) ||
      (event.lab_results && event.lab_results.length > 0)
    );
  };

  // Step 2: Confirm and Save finalized entities to DB
  const handleSaveConfirmed = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setProgressMsg(language === 'en' ? 'Writing confirmed metrics to clinical database...' : 'डेटाबेस में नैदानिक तथ्यों को लिखा जा रहा है...');

    try {
      const payload = {
        hospital: reviewForm.hospital,
        doctor: reviewForm.doctor,
        date: reviewForm.date,
        record_type: reviewForm.record_type,
        diagnoses: reviewForm.diagnoses.split(',').map(d => d.trim()).filter(Boolean),
        medications: reviewForm.medications,
        lab_results: reviewForm.lab_results,
        vaccinations: reviewForm.vaccinations,
        file_path: `/uploads/${selectedFile.name}`,
        structured_summary: {
          keyMetrics: reviewForm.lab_results.length > 0
            ? reviewForm.lab_results.map(l => `${l.test_name}: ${l.value} ${l.unit}`).join(', ')
            : (reviewForm.diagnoses ? `Diagnosed: ${reviewForm.diagnoses}` : `Ingested record: ${reviewForm.record_type}`),
          clinicalNotes: `Manually verified document ingestion. Prescribed: ${reviewForm.medications.map(m => m.name).join(', ') || 'None'}.`,
          recommendations: "Maintain prescribed care coordinates."
        }
      };

      await apiStub.saveConfirmedRecord(payload);
      setProcessing(false);
      setStep(3); // Show Success page
      reloadData();
    } catch (err) {
      setProcessing(false);
      alert('Error writing records: ' + err.message);
    }
  };

  // Form helper methods for lists
  const handleAddMed = () => {
    setReviewForm(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: 'Standard', frequency: 'Once daily' }]
    }));
  };

  const handleRemoveMed = (idx) => {
    setReviewForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx)
    }));
  };

  const handleMedChange = (idx, field, val) => {
    setReviewForm(prev => {
      const updated = [...prev.medications];
      updated[idx][field] = val;
      return { ...prev, medications: updated };
    });
  };

  const handleAddLab = () => {
    setReviewForm(prev => ({
      ...prev,
      lab_results: [...prev.lab_results, { test_name: '', value: '', unit: '', status: 'Normal', trend: 'Stable' }]
    }));
  };

  const handleRemoveLab = (idx) => {
    setReviewForm(prev => ({
      ...prev,
      lab_results: prev.lab_results.filter((_, i) => i !== idx)
    }));
  };

  const handleLabChange = (idx, field, val) => {
    setReviewForm(prev => {
      const updated = [...prev.lab_results];
      updated[idx][field] = val;
      return { ...prev, lab_results: updated };
    });
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '750px', margin: '0 auto', padding: '12px 0' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.upload.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.upload.subtitle}
        </p>
      </div>

      <div className="dashboard-card">
        {processing ? (
          /* Processing Loader View */
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <RefreshCw size={48} color="var(--primary)" className="animate-spin" style={{ margin: '0 auto 20px auto', display: 'block' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.upload.aiProcessor}</h3>
            <div style={{
              backgroundColor: 'var(--surface-muted)',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'monospace',
              color: 'var(--primary)',
              maxWidth: '440px',
              margin: '0 auto'
            }}>
              {progressMsg}
            </div>
          </div>
        ) : uploadError ? (
          /* Error Retry View */
          <div style={{ textAlign: 'center', padding: '32px 24px' }} className="animate-scale-in">
            <AlertCircle size={54} color="var(--warning)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.upload.retryTitle}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 auto 12px auto', maxWidth: '440px', lineHeight: 1.5 }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.upload.retryDesc}
            </p>
            <div style={{
              backgroundColor: 'var(--warning-light)',
              border: '1px solid var(--warning)',
              borderRadius: '8px',
              color: '#855100',
              fontSize: '0.82rem',
              padding: '12px',
              margin: '0 auto 22px auto',
              maxWidth: '460px',
              textAlign: 'left'
            }}>
              {uploadError}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setUploadError(null); setSelectedFile(null); setStep(1); }}>
                <X size={16} />
                <span className={language === 'hi' ? 'hindi-text' : ''}>{language === 'en' ? 'Choose Different File' : 'दूसरी फ़ाइल चुनें'}</span>
              </button>
            </div>
          </div>
        ) : step === 3 ? (
          /* Success Completed View */
          <div style={{ textAlign: 'center', padding: '30px' }} className="animate-scale-in">
            <CheckCircle2 size={54} color="var(--gov-green)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.upload.successTitle}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.upload.successDesc}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setStep(1); setSelectedFile(null); }}>
                <span className={language === 'hi' ? 'hindi-text' : ''}>{t.upload.uploadAnother}</span>
              </button>
              <button className="btn btn-primary" onClick={() => setPage('timeline')} style={{ gap: '6px' }}>
                <span className={language === 'hi' ? 'hindi-text' : ''} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {t.upload.viewTimeline} <ArrowRight size={16} />
                </span>
              </button>
            </div>
          </div>
        ) : step === 2 ? (
          /* Step 2: Confirmation / Verification review Form */
          <form onSubmit={handleSaveConfirmed} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-scale-in">
            <div style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
                {t.upload.reviewTitle}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
                {t.upload.reviewDesc}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t.upload.hospital}</label>
                <input type="text" className="form-control" value={reviewForm.hospital} onChange={e => setReviewForm({ ...reviewForm, hospital: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t.upload.doctor}</label>
                <input type="text" className="form-control" value={reviewForm.doctor} onChange={e => setReviewForm({ ...reviewForm, doctor: e.target.value })} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t.upload.dateLabel}</label>
                <input type="date" className="form-control" value={reviewForm.date} onChange={e => setReviewForm({ ...reviewForm, date: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t.upload.selectLabel}</label>
                <select className="form-control" value={reviewForm.record_type} onChange={e => setReviewForm({ ...reviewForm, record_type: e.target.value })}>
                  <option value="Lab Reports">{language === 'en' ? 'Lab Reports' : 'प्रयोगशाला रिपोर्ट'}</option>
                  <option value="Prescriptions">{language === 'en' ? 'Prescriptions' : 'पर्चे'}</option>
                  <option value="Discharge Summaries">{language === 'en' ? 'Discharge Summaries' : 'डिस्चार्ज सारांश'}</option>
                  <option value="Vaccination Records">{language === 'en' ? 'Vaccination Records' : 'टीकाकरण रिकॉर्ड'}</option>
                  <option value="Radiology">{language === 'en' ? 'Radiology' : 'रेडियोलॉजी'}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.upload.diagnoses}</label>
              <input type="text" className="form-control" value={reviewForm.diagnoses} onChange={e => setReviewForm({ ...reviewForm, diagnoses: e.target.value })} />
            </div>

            {/* Medications Table List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>{t.upload.medications}</label>
                <button type="button" className="btn btn-secondary" onClick={handleAddMed} style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Medicine
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reviewForm.medications.map((med, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" className="form-control" style={{ flex: 2 }} placeholder="Medication Name" value={med.name} onChange={e => handleMedChange(idx, 'name', e.target.value)} required />
                    <input type="text" className="form-control" style={{ flex: 1 }} placeholder="Dosage (e.g. 500mg)" value={med.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} />
                    <input type="text" className="form-control" style={{ flex: 1 }} placeholder="Frequency" value={med.frequency} onChange={e => handleMedChange(idx, 'frequency', e.target.value)} />
                    <button type="button" onClick={() => handleRemoveMed(idx)} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                ))}
                {reviewForm.medications.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No medications detected.</span>}
              </div>
            </div>

            {/* Lab Results Table List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>{t.upload.labResults}</label>
                <button type="button" className="btn btn-secondary" onClick={handleAddLab} style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Lab Metric
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reviewForm.lab_results.map((lab, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" className="form-control" style={{ flex: 2 }} placeholder="Test Name (e.g. HbA1c)" value={lab.test_name} onChange={e => handleLabChange(idx, 'test_name', e.target.value)} required />
                    <input type="text" className="form-control" style={{ flex: 1 }} placeholder="Value" value={lab.value} onChange={e => handleLabChange(idx, 'value', e.target.value)} required />
                    <input type="text" className="form-control" style={{ flex: 1 }} placeholder="Unit" value={lab.unit} onChange={e => handleLabChange(idx, 'unit', e.target.value)} />
                    <button type="button" onClick={() => handleRemoveLab(idx)} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                ))}
                {reviewForm.lab_results.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No lab metrics detected.</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setStep(1); setSelectedFile(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--gov-navy)' }}>
                {t.upload.confirmBtn}
              </button>
            </div>
          </form>
        ) : (
          /* Step 1: Upload Dropzone form */
          <form onSubmit={handleUploadExtract}>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              style={{
                border: `2px dashed ${dragOver ? 'var(--primary)' : selectedFile ? 'var(--gov-green)' : 'var(--surface-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '36px 24px',
                textAlign: 'center',
                backgroundColor: dragOver ? 'var(--primary-light)' : selectedFile ? '#f0fdf4' : 'var(--surface-muted)',
                marginBottom: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />

              {selectedFile ? (
                <div>
                  <FileText size={40} color="var(--gov-green)" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                  <p style={{ fontWeight: 700, color: 'var(--gov-green)', marginBottom: '4px' }}>{selectedFile.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB &middot; {selectedFile.type}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    style={{ marginTop: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                  >
                    <X size={14} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{language === 'en' ? 'Remove' : 'हटाएं'}</span>
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                  <h4 style={{ fontWeight: 700, marginBottom: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.upload.dragTitle}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.upload.dragDesc}</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>{t.upload.selectLabel}</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Lab Reports">{language === 'en' ? 'Lab Reports' : 'प्रयोगशाला रिपोर्ट'}</option>
                <option value="Prescriptions">{language === 'en' ? 'Prescriptions' : 'पर्चे'}</option>
                <option value="Discharge Summaries">{language === 'en' ? 'Discharge Summaries' : 'डिस्चार्ज सारांश'}</option>
                <option value="Vaccination Records">{language === 'en' ? 'Vaccination Records' : 'टीकाकरण रिकॉर्ड'}</option>
                <option value="Radiology">{language === 'en' ? 'Radiology' : 'रेдиоलॉजी'}</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', gap: '8px', opacity: selectedFile ? 1 : 0.5 }}
              disabled={!selectedFile}
            >
              <Sparkles size={18} />
              <span className={language === 'hi' ? 'hindi-text' : ''}>{t.upload.ingestBtn}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
