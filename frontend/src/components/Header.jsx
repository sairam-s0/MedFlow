import React from 'react';
import { Shield, User, HeartPulse, Building2, Map, RotateCcw, LogOut, FlaskConical } from 'lucide-react';
import { apiStub } from '../services/apiStub';

export default function Header({ currentPage, setCurrentPage, reloadData, language, setLanguage, user, onLogout }) {
  
  const handleReset = () => {
    const msg = language === 'hi' 
      ? 'क्या आप निश्चित रूप से नैदानिक डेटाबेस को उसकी प्रारंभिक स्थिति में रीसेट करना चाहते हैं?'
      : 'Are you sure you want to reset the clinical registry database to its initial demo state?';
    if (window.confirm(msg)) {
      apiStub.resetDatabase();
      reloadData();
      alert(language === 'hi' ? 'डेटाबेस सफलतापूर्वक रीसेट हो गया।' : 'Database reset complete.');
    }
  };

  const allNavItems = [
    { id: 'citizen', label_en: 'Citizen Portal', label_hi: 'नागरिक पोर्टल', icon: <User size={16} /> },
    { id: 'doctor', label_en: 'Clinical Desk', label_hi: 'नैदानिक डेस्क', icon: <HeartPulse size={16} /> },
    { id: 'govt', label_en: 'Govt Operations', label_hi: 'सरकारी संचालन', icon: <Building2 size={16} /> },
    { id: 'map', label_en: 'Map Analytics', label_hi: 'मानचित्र विश्लेषिकी', icon: <Map size={16} /> }
  ];

  // Filter navigation items by role
  const navItems = allNavItems.filter(item => {
    if (!user) return false;
    if (item.id === 'map') return true; // Everyone can access the map
    return item.id === user.role;
  });

  return (
    <header style={{
      backgroundColor: 'var(--gov-navy)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 900,
      boxShadow: 'var(--shadow-md)'
    }}>
      
      {/* Tricolor Strip Decoration */}
      <div style={{
        height: '4px',
        background: 'linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #12b76a 100%)',
        width: '100%'
      }} />

      {/* Brand Identity Header Area */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Gold SVG Lion Capital of Ashoka Emblem Vector */}
          <div style={{ width: '38px', height: '52px', flexShrink: 0 }}>
            <svg viewBox="0 0 100 135" fill="none" style={{ width: '100%', height: '100%' }}>
              {/* Gold Pedestal Base */}
              <ellipse cx="50" cy="115" rx="35" ry="10" fill="var(--gov-gold)" />
              <rect x="25" y="105" width="50" height="10" fill="var(--gov-gold)" />
              <circle cx="50" cy="105" r="5" fill="#ffffff" />
              {/* Ashoka Wheel Vector detail */}
              <circle cx="50" cy="105" r="7" stroke="var(--gov-navy)" strokeWidth="2" />
              {/* Left & Right Guardian detail */}
              <path d="M 28,103 Q 22,95 25,105 Z" fill="var(--gov-gold)" />
              <path d="M 72,103 Q 78,95 75,105 Z" fill="var(--gov-gold)" />
              {/* Lions torso shape */}
              <path d="M 32,50 C 32,30 68,30 68,50 C 68,80 65,105 50,105 C 35,105 32,80 32,50 Z" fill="var(--gov-gold)" />
              {/* Left/Right profile heads */}
              <path d="M 30,52 C 22,50 20,62 30,68 Z" fill="var(--gov-gold)" />
              <path d="M 70,52 C 78,50 80,62 70,68 Z" fill="var(--gov-gold)" />
              {/* Main Center Lion mane details */}
              <path d="M 40,42 L 50,22 L 60,42 L 50,48 Z M 42,55 L 50,35 L 58,55 Z" fill="#ffffff" opacity="0.3" />
              {/* Top crown shape */}
              <path d="M 45,20 H 55 L 50,10 Z" fill="var(--gov-gold)" />
            </svg>
          </div>

          <div>
            <h1 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.02em',
              lineHeight: 1.1,
              color: 'var(--gov-gold)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              MEDFLOW
              <span className="badge" style={{ fontSize: '0.6rem', padding: '3px 8px', letterSpacing: '0.05em', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                {language === 'hi' ? 'प्रस्तावित मॉडल' : 'PROPOSED CONCEPT'}
              </span>
              <span className="badge badge-saffron" style={{ fontSize: '0.6rem', padding: '3px 8px', letterSpacing: '0.05em' }}>
                {language === 'hi' ? 'डेमो मोड' : 'DEMO MODE'}
              </span>
            </h1>
            <p style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: '2px'
            }}>
              {language === 'hi' ? 'भारत के डिजिटल हेल्थ वर्कफ्लो से प्रेरित स्वतंत्र प्रोटोटाइप' : 'Independent prototype inspired by India digital health workflows'}
            </p>
          </div>
        </div>

        {/* Workspace Nav links and Language Switcher */}
        <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span
            className="badge"
            title={language === 'hi' ? 'लॉगिन और नमूना डेटा प्रस्तुति के लिए सिम्युलेट किए गए हैं' : 'Authentication and sample records are simulated for this demo'}
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.22)',
              gap: '6px',
              padding: '7px 10px',
              textTransform: 'none'
            }}
          >
            <FlaskConical size={14} />
            <span className={language === 'hi' ? 'hindi-text' : ''}>
              {language === 'hi' ? 'डेमो लॉगिन' : 'Demo auth'}
            </span>
          </span>
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: isActive ? 'var(--gov-gold)' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? 'white' : '#e2e8f0'
                }}
              >
                {item.icon}
                <span className={language === 'hi' ? 'hindi-text' : ''}>
                  {language === 'hi' ? item.label_hi : item.label_en}
                </span>
              </button>
            );
          })}
          
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '0 4px' }} />

          {/* Bilingual Selector (EN / हिन्दी) */}
          <div style={{ display: 'flex', gap: '2px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '2px', borderRadius: '8px' }}>
            <button 
              onClick={() => setLanguage('en')} 
              style={{
                background: language === 'en' ? 'var(--gov-gold)' : 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '0.725rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('hi')} 
              style={{
                background: language === 'hi' ? 'var(--gov-gold)' : 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '0.725rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              className="hindi-text"
            >
              हिन्दी
            </button>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '0 4px' }} />

          {/* Quick Database Reset for presentation re-runs */}
          <button
            onClick={handleReset}
            className="btn"
            title={language === 'hi' ? 'डेटाबेस रीसेट' : 'Reset Database'}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              color: '#fecdd3',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)'
            }}
          >
            <RotateCcw size={16} />
          </button>

          {/* Logout Button */}
          {user && (
            <button
              onClick={onLogout}
              className="btn"
              title={language === 'hi' ? 'लॉगआउट' : 'Logout'}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
