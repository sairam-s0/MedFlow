import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ApiLogger from './components/ApiLogger';

// Pages
import CitizenHome from './pages/CitizenHome';
import MedicalRecords from './pages/MedicalRecords';
import HealthTimeline from './pages/HealthTimeline';
import DoctorConsult from './pages/DoctorConsult';
import QRHealthCard from './pages/QRHealthCard';
import GovtDashboard from './pages/GovtDashboard';
import HealthcareMap from './pages/HealthcareMap';
import UploadRecord from './pages/UploadRecord';

import { apiStub } from './services/apiStub';
import { Home, Folder, CalendarDays, QrCode, UploadCloud } from 'lucide-react';

export default function App() {
  // Navigation: 'citizen' | 'doctor' | 'govt' | 'map'
  const [currentPage, setCurrentPage] = useState('citizen');
  
  // Citizen sub-pages: 'home' | 'records' | 'timeline' | 'qr' | 'upload'
  const [citizenSubPage, setCitizenSubPage] = useState('home');

  // Bilingual translation state: 'en' | 'hi'
  const [language, setLanguage] = useState('en');

  // Unified Application States
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [govtMetrics, setGovtMetrics] = useState(null);

  const fetchRegistryData = async () => {
    try {
      const p = await apiStub.getCitizenProfile();
      const r = await apiStub.getMedicalRecords();
      const t = await apiStub.getHealthTimeline();
      const g = await apiStub.getGovtMetrics();

      setProfile(p);
      setRecords(r);
      setTimeline(t);
      setGovtMetrics(g);
    } catch (err) {
      console.error("Error loading clinical data from mock database.", err);
    }
  };

  useEffect(() => {
    fetchRegistryData();
  }, []);

  const navigateCitizen = (subPage) => {
    setCurrentPage('citizen');
    setCitizenSubPage(subPage);
    window.scrollTo(0, 0);
  };

  const citizenTabs = [
    { id: 'home', label_en: 'Health Profile', label_hi: 'स्वास्थ्य प्रोफ़ाइल', icon: <Home size={16} /> },
    { id: 'records', label_en: 'Medical Records', label_hi: 'चिकित्सा रिकॉर्ड', icon: <Folder size={16} /> },
    { id: 'timeline', label_en: 'Health Timeline', label_hi: 'स्वास्थ्य समय-रेखा', icon: <CalendarDays size={16} /> },
    { id: 'qr', label_en: 'QR Health Card', label_hi: 'क्यूआर स्वास्थ्य कार्ड', icon: <QrCode size={16} /> },
    { id: 'upload', label_en: 'Upload Document', label_hi: 'दस्तावेज़ अपलोड करें', icon: <UploadCloud size={16} /> }
  ];

  const renderPageContent = () => {
    switch (currentPage) {
      case 'citizen':
        return (
          <div className="animate-fade-in">
            {/* Sub-navigation Tabs for Citizen Portal */}
            <div style={{
              display: 'flex',
              gap: '12px',
              borderBottom: '1px solid var(--surface-border)',
              marginBottom: '28px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '2px'
            }}>
              {citizenTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCitizenSubPage(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 18px',
                    border: 'none',
                    background: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    color: citizenSubPage === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                    borderBottom: citizenSubPage === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {tab.icon}
                  <span className={language === 'hi' ? 'hindi-text' : ''}>
                    {language === 'hi' ? tab.label_hi : tab.label_en}
                  </span>
                </button>
              ))}
            </div>

            {/* Sub-page Renders */}
            {citizenSubPage === 'home' && <CitizenHome profile={profile} setPage={navigateCitizen} language={language} />}
            {citizenSubPage === 'records' && <MedicalRecords records={records} language={language} />}
            {citizenSubPage === 'timeline' && <HealthTimeline timeline={timeline} language={language} />}
            {citizenSubPage === 'qr' && <QRHealthCard profile={profile} language={language} />}
            {citizenSubPage === 'upload' && <UploadRecord reloadData={fetchRegistryData} setPage={navigateCitizen} language={language} />}
          </div>
        );

      case 'doctor':
        return (
          <DoctorConsult
            profile={profile}
            records={records}
            timeline={timeline}
            reloadData={fetchRegistryData}
            language={language}
          />
        );

      case 'govt':
        return <GovtDashboard metrics={govtMetrics} language={language} />;

      case 'map':
        return <HealthcareMap language={language} />;

      default:
        return <div>Page Not Found</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Top ABDM Emblem Header */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        reloadData={fetchRegistryData}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Working Panel */}
      <main className="main-content">
        {renderPageContent()}
      </main>

      {/* Developers REST Logger console */}
      <ApiLogger />
    </div>
  );
}
