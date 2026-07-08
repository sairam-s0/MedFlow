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
import PersonalAnalytics from './pages/PersonalAnalytics';

import { apiStub, setActiveCitizenId } from './services/apiStub';
import { Home, Folder, CalendarDays, QrCode, UploadCloud, BarChart3 } from 'lucide-react';

export default function App() {
  // Authentication State
  const [user, setUser] = useState(null); // { role: 'citizen'|'doctor'|'govt', id: '...' }

  // Navigation: 'citizen' | 'doctor' | 'govt' | 'map'
  const [currentPage, setCurrentPage] = useState('citizen');
  
  // Citizen sub-pages: 'home' | 'records' | 'timeline' | 'qr' | 'upload' | 'analytics'
  const [citizenSubPage, setCitizenSubPage] = useState('home');

  // Bilingual translation state: 'en' | 'hi'
  const [language, setLanguage] = useState('en');
  const [t, setT] = useState(null);

  // Unified Application States
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [govtMetrics, setGovtMetrics] = useState(null);

  // Load translations dynamically
  useEffect(() => {
    fetch(`/locales/${language}.json`)
      .then(res => res.json())
      .then(data => setT(data))
      .catch(err => console.error("Error loading localization files:", err));
  }, [language]);

  // Check login session on mount
  useEffect(() => {
    const savedUser = apiStub.getLoggedInUser();
    const token = localStorage.getItem('medflow_token');
    if (savedUser && token) {
      setUser(savedUser);
      if (savedUser.role === 'citizen') {
        setActiveCitizenId(savedUser.id);
        setCurrentPage('citizen');
        setCitizenSubPage('home');
      } else {
        setCurrentPage(savedUser.role);
      }
    }
  }, []);

  const fetchRegistryData = async () => {
    if (!user) return;
    try {
      if (user.role === 'citizen') {
        const p = await apiStub.getCitizenProfile();
        const t_data = await apiStub.getHealthTimeline();
        setProfile(p);
        setTimeline(t_data);
      } else if (user.role === 'govt') {
        const g = await apiStub.getGovtMetrics();
        setGovtMetrics(g);
      }
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
      setCurrentPage('doctor');
    } else if (loggedInUser.role === 'govt') {
      setCurrentPage('govt');
    }
  };

  const handleLogout = async () => {
    await apiStub.logout();
    setUser(null);
    setProfile(null);
    setTimeline([]);
    setGovtMetrics(null);
  };

  const navigateCitizen = (subPage) => {
    setCurrentPage('citizen');
    setCitizenSubPage(subPage);
    window.scrollTo(0, 0);
  };

  const citizenTabs = [
    { id: 'home', icon: <Home size={16} />, key: 'homeTab' },
    { id: 'records', icon: <Folder size={16} />, key: 'recordsTab' },
    { id: 'timeline', icon: <CalendarDays size={16} />, key: 'timelineTab' },
    { id: 'analytics', icon: <BarChart3 size={16} />, key: 'analyticsTab' },
    { id: 'qr', icon: <QrCode size={16} />, key: 'qrTab' },
    { id: 'upload', icon: <UploadCloud size={16} />, key: 'uploadTab' }
  ];

  if (!t) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 600 }}>Loading MedFlow Platform...</div>;
  }

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
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.icon}
                  <span className={language === 'hi' ? 'hindi-text' : ''}>
                    {t.citizen[tab.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Sub-page Renders */}
            {citizenSubPage === 'home' && <CitizenHome profile={profile} setPage={navigateCitizen} language={language} t={t} reloadData={fetchRegistryData} />}
            {citizenSubPage === 'records' && <MedicalRecords language={language} t={t} />}
            {citizenSubPage === 'timeline' && <HealthTimeline timeline={timeline} language={language} t={t} />}
            {citizenSubPage === 'analytics' && <PersonalAnalytics language={language} t={t} />}
            {citizenSubPage === 'qr' && <QRHealthCard profile={profile} language={language} t={t} />}
            {citizenSubPage === 'upload' && <UploadRecord reloadData={fetchRegistryData} setPage={navigateCitizen} language={language} t={t} />}
          </div>
        );

      case 'doctor':
        return (
          <DoctorConsult
            reloadData={fetchRegistryData}
            language={language}
            t={t}
          />
        );

      case 'govt':
        return <GovtDashboard metrics={govtMetrics} language={language} t={t} />;

      case 'map':
        return <HealthcareMap language={language} t={t} />;

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
          <Login onLogin={handleLogin} language={language} t={t} />
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
        t={t}
      />

      {/* Main Panel */}
      <main className="main-content">
        {renderPageContent()}
      </main>
    </div>
  );
}
