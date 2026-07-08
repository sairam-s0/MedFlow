import React, { useState, useEffect } from 'react';
import { Folder, FileText, CheckCircle2, Eye, LayoutGrid, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiStub } from '../services/apiStub';

export default function MedicalRecords({ language, t }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const [records, setRecords] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'All', key: 'categoryAll' },
    { id: 'Lab Reports', key: 'categoryLab' },
    { id: 'Prescriptions', key: 'categoryPresc' },
    { id: 'Discharge Summaries', key: 'categoryDischarge' },
    { id: 'Radiology', key: 'categoryRadio' },
    { id: 'Vaccinations', key: 'categoryVax' },
    { id: 'Operations', key: 'categoryOps' }
  ];

  // Fetch records whenever page, filter, or search changes
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const data = await apiStub.getMedicalRecords(activeCategory, searchQuery, currentPage, 5);
        setRecords(data.records);
        setTotalPages(data.pages);
        setTotalRecords(data.total);
        setLoading(false);
      } catch (err) {
        console.error("Error loading records:", err);
        setLoading(false);
      }
    };
    fetchRecords();
  }, [activeCategory, searchQuery, currentPage]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const selectCategory = (catId) => {
    setActiveCategory(catId);
    setCurrentPage(1); // Reset to page 1
  };

  const getTranslatedCategory = (catId) => {
    const cat = categories.find(c => c.id === catId) || { key: 'categoryAll' };
    return t.records[cat.key] || catId;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.records.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.records.subtitle}
          </p>
        </div>

        {/* Search Input Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <input
            type="text"
            className="form-control"
            placeholder={t.records.searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ paddingLeft: '40px', borderRadius: '12px' }}
          />
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Folders Navigation */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px', scrollbarWidth: 'none' }}>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => selectCategory(cat.id)}
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
              {t.records[cat.key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading Records...</div>
      ) : (
        <>
          {/* Records Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {records.map((rec) => (
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
                        <CheckCircle2 size={12} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.records.verified}</span>
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="var(--primary)" />
                    {rec.title}
                  </h4>
                  
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                    <p><strong>{t.records.facility}</strong> {rec.hospital}</p>
                    <p><strong>{t.records.clinician}</strong> {rec.doctor}</p>
                    <p><strong>{t.records.date}</strong> {rec.date}</p>
                  </div>

                  {/* Structured AI Summary box */}
                  <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)', marginBottom: '16px', fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                      {t.records.eventTitle}
                    </strong>
                    <p style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>
                      "{rec.structuredSummary.keyMetrics}"
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => setSelectedRecord({ ...rec, showPdf: true })}>
                    <Eye size={14} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.records.originalBtn}</span>
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => setSelectedRecord({ ...rec, showPdf: false })}>
                    <span className={language === 'hi' ? 'hindi-text' : ''}>{t.records.summaryBtn}</span>
                  </button>
                </div>
              </div>
            ))}

            {records.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                <Folder size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                <p className={language === 'hi' ? 'hindi-text' : ''}>{t.records.noRecords}</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
              <button
                className="btn btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                style={{ padding: '8px 12px' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {t.records.page} {currentPage} {t.records.of} {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                style={{ padding: '8px 12px' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Box for PDF / Clinical Summary Viewer */}
      {selectedRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11, 34, 64, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} className="animate-fade-in">
          <div className="dashboard-card" style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1.25rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
                {selectedRecord.showPdf ? t.records.pdfTitle : t.records.extractedTitle}
              </h3>
              <button onClick={() => setSelectedRecord(null)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            {selectedRecord.showPdf ? (
              <div style={{ backgroundColor: 'var(--surface-muted)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--text-muted)', height: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '24px', textAlign: 'center' }}>
                <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <p style={{ fontWeight: 600 }}>{selectedRecord.title}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  {language === 'en' ? 'Original document saved securely in health locker storage.' : 'मूल दस्तावेज़ सुरक्षित स्वास्थ्य लॉकर में सुरक्षित सहेजा गया है।'}
                </p>
                <a
                  href={selectedRecord.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ marginTop: '16px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={16} /> <span>{t.records.originalBtn}</span>
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '12px' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.records.keyMetrics}</span>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>
                    {selectedRecord.structuredSummary.keyMetrics}
                  </p>
                </div>
                
                <div style={{ borderLeft: '4px solid var(--gov-saffron)', paddingLeft: '12px' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.records.notes}</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                    {selectedRecord.structuredSummary.clinicalNotes}
                  </p>
                </div>

                <div style={{ borderLeft: '4px solid var(--gov-green)', paddingLeft: '12px' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }} className={language === 'hi' ? 'hindi-text' : ''}>{t.records.recs}</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }} className={language === 'hi' ? 'hindi-text' : ''}>
                    {selectedRecord.structuredSummary.recommendations}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }} className={language === 'hi' ? 'hindi-text' : ''}>
                  <span>{t.records.clinician} {selectedRecord.doctor}</span>
                  <span>{t.records.facility} {selectedRecord.hospital}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
                <span className={language === 'hi' ? 'hindi-text' : ''}>{t.citizen.close}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
