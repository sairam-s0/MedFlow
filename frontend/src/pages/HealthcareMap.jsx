import React, { useState, useEffect, useRef } from 'react';
import { Layers, Compass, Loader2 } from 'lucide-react';
import { apiStub } from '../services/apiStub';

export default function HealthcareMap({ language, t }) {
  const [scope, setScope] = useState('District');
  const [metric, setMetric] = useState('Diabetes');
  const [selectedSubdivision, setSelectedSubdivision] = useState('Rampur Block');
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const mapRef = useRef(null);
  const circlesRef = useRef([]);

  // Fetch geographic data from DB when metric changes
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const data = await apiStub.getMapMetrics(metric);
        setMapData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading map data:", err);
        setLoading(false);
      }
    };
    fetchMapData();
  }, [metric]);

  // Load Leaflet dynamically
  useEffect(() => {
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Clean up script
      document.body.removeChild(script);
    };
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapData || loading) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      // Coordinates representing India central region (Rampur/Raipur area coordinates)
      const map = window.L.map('leaflet-map-div').setView([21.25, 81.63], 9);
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(map);
      mapRef.current = map;
    }

    const mapInstance = mapRef.current;

    // Clear previous circle overlays
    circlesRef.current.forEach(circle => {
      mapInstance.removeLayer(circle);
    });
    circlesRef.current = [];

    // Simulated Block coordinates around our center point
    const blockCoords = {
      'Rampur Block': [21.35, 81.50],
      'Sundergarh Block': [21.45, 81.75],
      'Raipur Block': [21.20, 81.63],
      'Bilaspur Block': [21.10, 81.85],
      'Durg Block': [21.15, 81.30]
    };

    const strokeColors = {
      'Diabetes': '#f97316',
      'Hypertension': '#ef4444',
      'Anemia': '#dc2626',
      'Vaccination': '#10b981'
    };

    const strokeColor = strokeColors[metric] || 'var(--primary)';

    // Draw circular heatmap zones
    Object.entries(blockCoords).forEach(([blockName, coords]) => {
      const fill = getShadingColor(blockName);
      
      const circle = window.L.circle(coords, {
        color: strokeColor,
        fillColor: fill,
        fillOpacity: 0.55,
        radius: 12000,
        weight: 2
      }).addTo(mapInstance);

      circle.bindTooltip(`${getTranslatedBlock(blockName)}: ${getMetricVal(blockName)}`, {
        permanent: false,
        direction: 'top'
      });

      circle.on('click', () => {
        setSelectedSubdivision(blockName);
      });

      circlesRef.current.push(circle);
    });

  }, [leafletLoaded, mapData, loading, metric]);

  const getMetricVal = (blockName) => {
    if (!mapData || !mapData[blockName]) return '—';
    return mapData[blockName][metric.toLowerCase()];
  };

  const getShadingColor = (blockName) => {
    const rateString = getMetricVal(blockName).toLowerCase();
    
    if (metric === 'Vaccination') {
      const num = parseInt(rateString);
      if (num >= 90) return '#10b981'; // Green
      if (num >= 50) return '#f59e0b'; // Amber
      return '#ef4444'; // Red
    }
    
    if (rateString.includes('very high') || rateString.includes('high')) {
      return '#ef4444';
    }
    if (rateString.includes('medium')) {
      return '#f59e0b';
    }
    return '#3b82f6';
  };

  const getTranslatedBlock = (block) => {
    if (language === 'en') return block;
    return block
      .replace('Rampur Block', 'रामपुर ब्लॉक')
      .replace('Sundergarh Block', 'सुंदरगढ़ ब्लॉक')
      .replace('Raipur Block', 'रायपुर ब्लॉक')
      .replace('Bilaspur Block', 'बिलासपुर ब्लॉक')
      .replace('Durg Block', 'दुर्ग ब्लॉक')
      .replace('Sub-Centre', 'उप-केंद्र')
      .replace('Village', 'गाँव');
  };

  const getTranslatedRating = (rating) => {
    if (language === 'en') return rating;
    return rating
      .replace('High', 'उच्च')
      .replace('Very High', 'अत्यधिक उच्च')
      .replace('Medium', 'मध्यम')
      .replace('Low', 'निम्न');
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.map.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.map.subtitle}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Leaflet Map Card */}
        <div className="dashboard-card" style={{ flex: 2, minHeight: '450px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px', marginBottom: '20px' }}>
            {/* Scope Toggle */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface-muted)', padding: '4px', borderRadius: '4px' }}>
              {[
                { id: 'District', label: t.map.district },
                { id: 'PHC', label: t.map.phc },
                { id: 'Village', label: t.map.village }
              ].map(sc => (
                <button
                  key={sc.id}
                  onClick={() => setScope(sc.id)}
                  style={{
                    border: 'none',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: scope === sc.id ? 'white' : 'transparent',
                    boxShadow: scope === sc.id ? 'var(--shadow-sm)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                  className={language === 'hi' ? 'hindi-text' : ''}
                >
                  {sc.label}
                </button>
              ))}
            </div>

            {/* Metric Overlay */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'Diabetes', label: t.map.diabetes },
                { id: 'Hypertension', label: t.map.hypertension },
                { id: 'Anemia', label: t.map.anemia },
                { id: 'Vaccination', label: t.map.vaccination }
              ].map(met => (
                <button
                  key={met.id}
                  onClick={() => setMetric(met.id)}
                  className={`btn ${metric === met.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px' }}
                >
                  <span className={language === 'hi' ? 'hindi-text' : ''}>{met.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Map Div */}
          <div style={{ flex: 1, position: 'relative', minHeight: '320px', borderRadius: '8px', overflow: 'hidden' }}>
            {(!leafletLoaded || loading) ? (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', gap: '10px' }}>
                <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                <span>Loading Geographic Leaflet Map Layer...</span>
              </div>
            ) : null}
            <div id="leaflet-map-div" style={{ height: '360px', width: '100%', zIndex: 1 }}></div>
            
            {/* Compass Legend Overlay */}
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', zIndex: 10, fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.95)', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '6px' }} className={language === 'hi' ? 'hindi-text' : ''}>
              <Compass size={14} color="var(--text-secondary)" />
              <span>{t.map.overlayMsg} <strong>{t.map[metric.toLowerCase()]}</strong> ({t.map[scope.toLowerCase()]} {language === 'en' ? 'level' : 'स्तर'})</span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="dashboard-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
              <Layers size={20} />
              {t.map.profileTitle}
            </h4>
            
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
              <h5 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '4px' }}>
                {getTranslatedBlock(selectedSubdivision)}
              </h5>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
                {t.map.profileDesc}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.map.prevalence}</span>
                <strong>
                  {getTranslatedRating(getMetricVal(selectedSubdivision))}
                </strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.map.hyperRate}</span>
                <strong>
                  {getTranslatedRating(mapData ? mapData[selectedSubdivision].hypertension : '—')}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.map.anemiaIndex}</span>
                <strong style={{ color: 'var(--danger)' }}>
                  {getTranslatedRating(mapData ? mapData[selectedSubdivision].anemia : '—')}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.map.vaccineRate}</span>
                <strong style={{ color: 'var(--gov-green)' }}>
                  {getTranslatedRating(mapData ? mapData[selectedSubdivision].vaccination : '—')}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--surface-border)', paddingTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.map.footer}
          </div>
        </div>

      </div>
    </div>
  );
}
