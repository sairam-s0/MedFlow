import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Heart, ShieldAlert, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { apiStub } from '../services/apiStub';

// Premium SVG Line Chart Component
function SvgLineChart({ data, height = 180, stroke = "var(--primary)", label = "Value" }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--surface-border)', borderRadius: '8px' }}>
        No trend records available
      </div>
    );
  }

  const width = 500;
  
  // Parse numeric values (support BP split)
  const parseVal = (v) => {
    if (typeof v === 'string' && v.includes('/')) {
      return parseFloat(v.split('/')[0]); // Use systolic for BP chart
    }
    return parseFloat(v);
  };

  const values = data.map(d => parseVal(d.value));
  const maxVal = Math.max(...values, 100);
  const minVal = Math.min(...values, 40);
  const valRange = maxVal - minVal || 10;

  const points = data.map((d, idx) => {
    const x = (idx / (data.length - 1 || 1)) * (width - 80) + 40;
    const y = height - 40 - ((parseVal(d.value) - minVal) / valRange) * (height - 80);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        {/* Horizontal grid lines */}
        <line x1="30" y1="30" x2={width-10} y2="30" stroke="#f1f5f9" strokeWidth="1" />
        <line x1="30" y1={height/2 - 5} x2={width-10} y2={height/2 - 5} stroke="#f1f5f9" strokeWidth="1" />
        <line x1="30" y1={height-40} x2={width-10} y2={height-40} stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Polylines */}
        {data.length > 1 && (
          <polyline fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
        )}

        {/* Data points */}
        {data.map((d, idx) => {
          const x = (idx / (data.length - 1 || 1)) * (width - 80) + 40;
          const y = height - 40 - ((parseVal(d.value) - minVal) / valRange) * (height - 80);
          return (
            <g key={idx}>
              <circle cx={x} cy={y} r="5.5" fill="white" stroke={stroke} strokeWidth="3" style={{ cursor: 'pointer' }} />
              <text x={x} y={y-12} fill="var(--text-primary)" fontSize="10.5" fontWeight="800" textAnchor="middle">{d.value}</text>
              <text x={x} y={height-16} fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">{d.date.substring(5)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function PersonalAnalytics({ language, t }) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiStub.getCitizenPersonalAnalytics();
        setAnalytics(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading analytics:", err);
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Personal Analytics...</div>;
  }

  if (!analytics) {
    return (
      <div className="dashboard-card" style={{ textAlign: 'center', padding: '48px' }}>
        <BarChart3 size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
        <p>{t.analytics.noTrends}</p>
      </div>
    );
  }

  // Determine BMI category
  const getBmiCategory = (bmiVal) => {
    if (!bmiVal) return '—';
    if (bmiVal < 18.5) return t.analytics.underweight;
    if (bmiVal < 25) return t.analytics.normal;
    if (bmiVal < 30) return t.analytics.overweight;
    return t.analytics.obese;
  };

  const getBmiColor = (bmiVal) => {
    if (!bmiVal) return 'var(--text-secondary)';
    if (bmiVal >= 18.5 && bmiVal < 25) return 'var(--gov-green)';
    if (bmiVal >= 25 && bmiVal < 30) return 'var(--gov-saffron)';
    return 'var(--danger)';
  };

  // Mock adherence updates for nice presentation
  const adherence = analytics.medication_adherence || 100;
  const vaxProgress = analytics.vaccination_progress || { completed: 2, total_scheduled: 2 };
  const vaxPct = Math.round((vaxProgress.completed / (vaxProgress.total_scheduled || 1)) * 100);

  return (
    <div className="animate-fade-in" style={{ padding: '8px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.analytics.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
          {t.analytics.subtitle}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Health Score Card */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center' }}>
          <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <Activity size={20} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.analytics.scoreTrend}</span>
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyParagraph: 'center', justifyContent: 'center' }}>
              {analytics.health_score}
            </div>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t.citizen.healthScore || 'Health Status'}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Stability: <strong>{analytics.overall_stability}</strong>
              </p>
            </div>
          </div>
          <SvgLineChart data={analytics.health_score_trend} stroke="var(--primary)" />
        </div>

        {/* BMI Card */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center' }}>
          <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gov-gold)' }}>
            <Sparkles size={20} color="var(--gov-gold)" /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.analytics.weightTrend}</span>
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(197, 160, 89, 0.1)', color: 'var(--gov-gold)', fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyParagraph: 'center', justifyContent: 'center' }}>
              {analytics.bmi}
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.analytics.bmiLabel}</p>
              <span className="badge" style={{ backgroundColor: getBmiColor(analytics.bmi), color: 'white', marginTop: '4px', display: 'inline-block' }} className={language === 'hi' ? 'badge hindi-text' : 'badge'}>
                {getBmiCategory(analytics.bmi)}
              </span>
            </div>
          </div>
          <SvgLineChart data={analytics.weight_trend} stroke="var(--gov-gold)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Sugar Trend */}
        <div className="dashboard-card">
          <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
            <Heart size={20} color="var(--danger)" /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.analytics.sugarTrend}</span>
          </h4>
          <SvgLineChart data={analytics.blood_sugar_trend} stroke="var(--danger)" />
        </div>

        {/* BP Trend */}
        <div className="dashboard-card">
          <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gov-saffron)' }}>
            <TrendingUp size={20} color="var(--gov-saffron)" /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.analytics.bpTrend}</span>
          </h4>
          <SvgLineChart data={analytics.blood_pressure_trend} stroke="var(--gov-saffron)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Adherence & Vaccination */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '12px', color: 'var(--gov-green)' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.analytics.adherence}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, height: '12px', backgroundColor: 'var(--surface-muted)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${adherence}%`, height: '100%', backgroundColor: 'var(--gov-green)' }} />
              </div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--gov-green)' }}>{adherence}%</strong>
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '12px', color: 'var(--primary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
              {t.analytics.vaccinationProgress}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
              <div style={{ flex: 1, height: '12px', backgroundColor: 'var(--surface-muted)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${vaxPct}%`, height: '100%', backgroundColor: 'var(--primary)' }} />
              </div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{vaxPct}%</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {vaxProgress.completed} of {vaxProgress.total_scheduled} scheduled doses {t.analytics.completed}
            </p>
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="dashboard-card">
          <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
            <ShieldAlert size={20} /> <span className={language === 'hi' ? 'hindi-text' : ''}>{t.analytics.riskIndicators}</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {analytics.risk_indicators && analytics.risk_indicators.map((ri) => (
              <div key={ri.id} style={{ padding: '12px', backgroundColor: 'var(--danger-light)', borderLeft: '4px solid var(--danger)', borderRadius: '4px' }}>
                <h5 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--danger)' }}>{ri.indicator}</h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '2px' }}>{ri.notes}</p>
              </div>
            ))}
            {(!analytics.risk_indicators || analytics.risk_indicators.length === 0) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gov-green)' }}>
                <CheckCircle2 size={20} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>No active diagnostic risks flagged. Keep it up!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
