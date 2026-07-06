import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './pages/Login';

// Pages
import CitizenHome from './pages/CitizenHome';
import MedicalRecords from './pages/MedicalRecords';
import HealthTimeline from './pages/HealthTimeline';
import DoctorConsult from './pages/DoctorConsult';
import QRHealthCard from './pages/QRHealthCard';
import GovtDashboard from './pages/GovtDashboard';
import HealthcareMap from './pages/HealthcareMap';
import UploadRecord from './pages/UploadRecord';

import { apiStub, setActiveCitizenId } from './services/apiStub';
import { Home, Folder, CalendarDays, QrCode, UploadCloud } from 'lucide-react';

export default function App() {
  // Authentication State
  const [user, setUser] = useState(null); // { role: 'citizen'|'doctor'|'govt', id: '...' }

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
      console.error("Error loading data from database.", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRegistryData();
    }
  }, [user]);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'citizen') {
      setActiveCitizenId(loggedInUser.id);
      setCurrentPage('citizen');
      setCitizenSubPage('home');
    } else if (loggedInUser.role === 'doctor') {
      // For doctor desk, we still load citizen data in backend to simulate patient consult scanning
      setActiveCitizenId('QR-12345-ABCD'); // Default sandbox scan patient
      setCurrentPage('doctor');
    } else if (loggedInUser.role === 'govt') {
      setCurrentPage('govt');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    setRecords([]);
    setTimeline([]);
  };

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

  if (!user) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Simplified Bilingual Header for Login page */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          padding: '16px 24px', 
          backgroundColor: 'var(--gov-navy)',
          borderBottom: '4px solid #ff9933'
        }}>
          <div style={{ display: 'flex', gap: '2px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '2px', borderRadius: '8px' }}>
            <button onClick={() => setLanguage('en')} style={{ background: language === 'en' ? 'var(--gov-gold)' : 'transparent', border: 'none', color: 'white', fontSize: '0.725rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>EN</button>
            <button onClick={() => setLanguage('hi')} style={{ background: language === 'hi' ? 'var(--gov-gold)' : 'transparent', border: 'none', color: 'white', fontSize: '0.725rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }} className="hindi-text">हिन्दी</button>
          </div>
        </div>
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', flex: 1 }}>
          <Login onLogin={handleLogin} language={language} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Bottom Emblem Header */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        reloadData={fetchRegistryData}
        language={language}
        setLanguage={setLanguage}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Panel */}
      <main className="main-content">
        {renderPageContent()}
      </main>
    </div>
  );
}
