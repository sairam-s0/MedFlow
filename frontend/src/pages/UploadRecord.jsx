import React, { useState } from 'react';
import { Upload, CheckCircle2, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import { apiStub } from '../services/apiStub';

export default function UploadRecord({ reloadData, setPage, language }) {
  const [selectedFile, setSelectedFile] = useState('hba1c_blood_report.pdf');
  const [category, setCategory] = useState('Lab Reports');
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [finished, setFinished] = useState(false);
  const [extractedRecordId, setExtractedRecordId] = useState('');

  const sampleFiles = [
    { name: 'hba1c_blood_report.pdf', label_en: 'HbA1c Blood Panel Scan (PDF)', label_hi: 'एचबीए1सी रक्त परीक्षण रिपोर्ट (PDF)', category: 'Lab Reports' },
    { name: 'opd_prescription_bronchitis.pdf', label_en: 'OPD Prescription - Acute Bronchitis (PDF)', label_hi: 'ओपीडी पर्चा - तीव्र ब्रोंकाइटिस (PDF)', category: 'Prescriptions' },
    { name: 'covid_booster_vaccination.pdf', label_en: 'Covid-19 Booster Certificate (PDF)', label_hi: 'कोविड-19 बूस्टर प्रमाणपत्र (PDF)', category: 'Vaccination Records' }
  ];

  const t = {
    title: language === 'en' ? 'Ingest Unstructured Records' : 'असंरचित मेडिकल दस्तावेज़ अपलोड करें',
    subtitle: language === 'en' ? 'OCR & Gemini Entity Extraction Pipeline' : 'ओसीआर और जेमिनी एंटिटी निष्कर्षण पाइपलाइन',
    aiProcessor: language === 'en' ? 'AI Medical Processor Active' : 'एआई क्लिनिकल प्रोसेसर सक्रिय',
    fhirConversion: language === 'en' ? 'Converting scan into FHIR-compliant structured medical events...' : 'स्कैन की गई छवि को FHIR-अनुपालन संरचित घटनाओं में परिवर्तित किया जा रहा है...',
    successTitle: language === 'en' ? 'Clinical Ingestion Completed' : 'दस्तावेज़ विश्लेषण और एकीकरण पूर्ण',
    successDesc: language === 'en' ? 'Document parsed successfully. Extracted clinical summary has been written to the profile timeline.' : 'दस्तावेज़ सफलतापूर्वक पार्स हो गया है। प्राप्त सारांश को इतिहास समय-रेखा पर दर्ज कर दिया गया है।',
    uploadAnother: language === 'en' ? 'Upload Another' : 'दूसरा अपलोड करें',
    viewTimeline: language === 'en' ? 'View Timeline' : 'समय-रेखा देखें',
    dragTitle: language === 'en' ? 'Drag & Drop Scans or PDFs' : 'स्कैन की गई छवियां या पीडीएफ यहां खींचें',
    dragDesc: language === 'en' ? 'Supports scanned prescriptions, pathology reports, and discharge summaries' : 'यह प्रदाता पर्चे, पैथोलॉजी रिपोर्ट और डिस्चार्ज सारांश का समर्थन करता है',
    selectLabel: language === 'en' ? 'Select Demo Sample Document' : 'प्रदर्शन के लिए नमूना दस्तावेज़ चुनें',
    inferredLabel: language === 'en' ? 'Inferred Document Folder (DigiLocker Category)' : 'दस्तावेज़ फ़ोल्डर (डिजिलॉकर श्रेणी)',
    ingestBtn: language === 'en' ? 'Ingest Scanned Document' : 'दस्तावेज़ प्रसंस्करण प्रारंभ करें',
    initiating: language === 'en' ? 'Initiating document upload buffer...' : 'दस्तावेज़ अपलोड बफर शुरू किया जा रहा है...',
    ocr: language === 'en' ? 'Performing OCR Text Extraction...' : 'ओसीआर (OCR) पाठ निष्कर्षण किया जा रहा है...',
    gemini: language === 'en' ? 'Normalizing Medical Entities using Gemini...' : 'जेमिनी का उपयोग करके क्लिनिकल तथ्यों को संरेखित किया जा रहा है...',
    fhir: language === 'en' ? 'Validating JSON against National Clinical Schema...' : 'राष्ट्रीय नैदानिक ​​स्कीमा के खिलाफ सत्यापन किया जा रहा है...'
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setFinished(false);
    setProgressMsg(t.initiating);

    const translateMsg = (msg) => {
      if (language === 'en') return msg;
      if (msg.includes('OCR')) return t.ocr;
      if (msg.includes('Gemini')) return t.gemini;
      if (msg.includes('Schema')) return t.fhir;
      return msg;
    };

    try {
      const result = await apiStub.uploadAndProcessDocument(selectedFile, category, (msg) => {
        setProgressMsg(translateMsg(msg));
      });
      setProcessing(false);
      setFinished(true);
      setExtractedRecordId(result.recordId);
      reloadData();
    } catch (err) {
      setProcessing(false);
      alert('Error processing file.');
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
            <RefreshCw className="animate-scale-in" size={48} color="var(--primary)" style={{ animation: 'pulse-ring 1s infinite', margin: '0 auto 20px auto' }} />
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
            <CheckCircle2 size={54} color="var(--gov-green)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.successTitle}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.successDesc}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setFinished(false)}>
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
            <div style={{
              border: '2px dashed var(--surface-border)',
              borderRadius: 'var(--radius-md)',
              padding: '36px 24px',
              textAlign: 'center',
              backgroundColor: 'var(--surface-muted)',
              marginBottom: '24px',
              cursor: 'pointer'
            }}>
              <Upload size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ fontWeight: 700, marginBottom: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.dragTitle}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.dragDesc}</p>
            </div>

            <div className="form-group">
              <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>{t.selectLabel}</label>
              <select
                className="form-control"
                value={selectedFile}
                onChange={(e) => {
                  setSelectedFile(e.target.value);
                  const matched = sampleFiles.find(f => f.name === e.target.value);
                  if (matched) setCategory(matched.category);
                }}
              >
                {sampleFiles.map((file, idx) => (
                  <option key={idx} value={file.name}>{language === 'en' ? file.label_en : file.label_hi}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" className={language === 'hi' ? 'form-label hindi-text' : 'form-label'}>{t.inferredLabel}</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Lab Reports">{language === 'en' ? 'Lab Reports' : 'प्रयोगशाला रिपोर्ट'}</option>
                <option value="Prescriptions">{language === 'en' ? 'Prescriptions' : 'पर्चे'}</option>
                <option value="Discharge Summaries">{language === 'en' ? 'Discharge Summaries' : 'डिस्चार्ज सारांश'}</option>
                <option value="Vaccination Records">{language === 'en' ? 'Vaccination Records' : 'टीकाकरण रिकॉर्ड'}</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
              <Sparkles size={18} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.ingestBtn}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
