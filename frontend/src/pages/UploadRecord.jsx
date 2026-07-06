import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, RefreshCw, ArrowRight, Sparkles, FileText, X } from 'lucide-react';
import { apiStub } from '../services/apiStub';

export default function UploadRecord({ reloadData, setPage, language }) {
  const [selectedFile, setSelectedFile] = useState(null); // actual File object
  const [category, setCategory] = useState('Lab Reports');
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [finished, setFinished] = useState(false);
  const [extractedRecordId, setExtractedRecordId] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const t = {
    title: language === 'en' ? 'Ingest Unstructured Records' : 'असंरचित मेडिकल दस्तावेज़ अपलोड करें',
    subtitle: language === 'en' ? 'OCR & Gemini Entity Extraction Pipeline' : 'ओसीआर और जेमिनी एंटिटी निष्कर्षण पाइपलाइन',
    aiProcessor: language === 'en' ? 'AI Medical Processor Active' : 'एआई क्लिनिकल प्रोसेसर सक्रिय',
    fhirConversion: language === 'en' ? 'Converting scan into FHIR-compliant structured medical events...' : 'स्कैन की गई छवि को FHIR-अनुपालन संरचित घटनाओं में परिवर्तित किया जा रहा है...',
    successTitle: language === 'en' ? 'Clinical Ingestion Completed' : 'दस्तावेज़ विश्लेषण और एकीकरण पूर्ण',
    successDesc: language === 'en' ? 'Document parsed successfully. Extracted clinical summary has been written to the profile timeline.' : 'दस्तावेज़ सफलतापूर्वक पार्स हो गया है। प्राप्त सारांश को इतिहास समय-रेखा पर दर्ज कर दिया गया है।',
    uploadAnother: language === 'en' ? 'Upload Another' : 'दूसरा अपलोड करें',
    viewTimeline: language === 'en' ? 'View Timeline' : 'समय-रेखा देखें',
    dragTitle: language === 'en' ? 'Drag & Drop or Click to Select' : 'खींचें और छोड़ें या क्लिक करें',
    dragDesc: language === 'en' ? 'Supports images (JPG, PNG) and PDFs of prescriptions, lab reports, and discharge summaries' : 'पर्चे, लैब रिपोर्ट और डिस्चार्ज सारांश की JPG, PNG और PDF फाइलें स्वीकार की जाती हैं',
    selectLabel: language === 'en' ? 'DigiLocker Folder / Category' : 'दस्तावेज़ फ़ोल्डर (श्रेणी)',
    ingestBtn: language === 'en' ? 'Ingest Scanned Document' : 'दस्तावेज़ प्रसंस्करण प्रारंभ करें',
    noFile: language === 'en' ? 'Please select a file before uploading.' : 'कृपया अपलोड से पहले एक फ़ाइल चुनें।',
  };

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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert(t.noFile);
      return;
    }
    setProcessing(true);
    setFinished(false);
    setProgressMsg(language === 'en' ? 'Initiating document upload buffer...' : 'दस्तावेज़ अपलोड बफर शुरू किया जा रहा है...');

    const translateMsg = (msg) => {
      if (language === 'en') return msg;
      if (msg.includes('OCR') || msg.includes('Uploading')) return 'ओसीआर (OCR) पाठ निष्कर्षण किया जा रहा है...';
      if (msg.includes('Gemini') || msg.includes('AI Extraction') || msg.includes('Extraction complete')) return 'जेमिनी का उपयोग करके क्लिनिकल तथ्यों को संरेखित किया जा रहा है...';
      if (msg.includes('Schema') || msg.includes('Saving') || msg.includes('ingested')) return 'राष्ट्रीय नैदानिक ​​स्कीमा के खिलाफ सत्यापन किया जा रहा है...';
      return msg;
    };

    try {
      const result = await apiStub.uploadAndProcessDocument(selectedFile, category, (msg) => {
        setProgressMsg(translateMsg(msg));
      });
      setProcessing(false);
      if (result.status === 'Error') {
        const fallback = language === 'en'
          ? 'AI extraction failed. Please try again or check the backend AI key.'
          : 'एआई निष्कर्षण विफल। कृपया बैकएंड AI key जांचें या दोबारा प्रयास करें।';
        alert(result.message || fallback);
        return;
      }
      setFinished(true);
      setExtractedRecordId(result.recordId);
      reloadData();
    } catch (err) {
      setProcessing(false);
      alert(language === 'en' ? 'Error processing file.' : 'फ़ाइल प्रसंस्करण में त्रुटि।');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto', padding: '12px 0' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.subtitle}
        </p>
      </div>

      <div className="dashboard-card">
        {processing ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <RefreshCw size={48} color="var(--primary)" style={{ margin: '0 auto 20px auto', display: 'block' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.aiProcessor}</h3>
            <div style={{
              backgroundColor: 'var(--surface-muted)',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'monospace',
              color: 'var(--primary)',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              {progressMsg}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '16px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.fhirConversion}
            </p>
          </div>
        ) : finished ? (
          <div style={{ textAlign: 'center', padding: '30px' }} className="animate-scale-in">
            <CheckCircle2 size={54} color="var(--gov-green)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.successTitle}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.successDesc}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setFinished(false); setSelectedFile(null); }}>
                <span className={language === 'hi' ? 'hindi-text' : ''}>{t.uploadAnother}</span>
              </button>
              <button className="btn btn-primary" onClick={() => setPage('timeline')} style={{ gap: '6px' }}>
                <span className={language === 'hi' ? 'hindi-text' : ''} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {t.viewTimeline} <ArrowRight size={16} />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload}>
            {/* Drag & Drop Zone */}
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
                    <X size={14} /> {language === 'en' ? 'Remove' : 'हटाएं'}
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                  <h4 style={{ fontWeight: 700, marginBottom: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.dragTitle}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.dragDesc}</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>{t.selectLabel}</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Lab Reports">{language === 'en' ? 'Lab Reports' : 'प्रयोगशाला रिपोर्ट'}</option>
                <option value="Prescriptions">{language === 'en' ? 'Prescriptions' : 'पर्चे'}</option>
                <option value="Discharge Summaries">{language === 'en' ? 'Discharge Summaries' : 'डिस्चार्ज सारांश'}</option>
                <option value="Vaccination Records">{language === 'en' ? 'Vaccination Records' : 'टीकाकरण रिकॉर्ड'}</option>
                <option value="Radiology">{language === 'en' ? 'Radiology' : 'रेडियोलॉजी'}</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', gap: '8px', opacity: selectedFile ? 1 : 0.5 }}
              disabled={!selectedFile}
            >
              <Sparkles size={18} />
              <span className={language === 'hi' ? 'hindi-text' : ''}>{t.ingestBtn}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
