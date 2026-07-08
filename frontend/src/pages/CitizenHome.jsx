import React, { useState } from 'react';
import { User, Activity, ShieldAlert, Heart, Calendar, ArrowRight, Pill, PhoneCall, Edit2, CheckCircle2 } from 'lucide-react';
import { apiStub } from '../services/apiStub';

export default function CitizenHome({ profile, setPage, language, t, reloadData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    address: '',
    height: '',
    weight: '',
    emergency_contact: ''
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        Loading Profile...
      </div>
    );
  }

  const openEditModal = () => {
    setEditForm({
      address: profile.address || '',
      height: profile.height || '',
      weight: profile.weight || '',
      emergency_contact: profile.emergencyContact || ''
    });
    setIsEditing(true);
    setSuccessMsg('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiStub.updateCitizenProfile(editForm);
      setSaving(false);
      setSuccessMsg('Profile updated successfully!');
      reloadData();
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setSaving(false);
      alert('Error updating profile: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.citizen.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className={language === 'hi' ? 'hindi-text' : ''}>
            {t.citizen.subtitle}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={openEditModal} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}>
            <Edit2 size={14} />
            <span className={language === 'hi' ? 'hindi-text' : ''}>{t.citizen.editProfile}</span>
          </button>
          <div className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            {t.citizen.healthId} {profile.id}
          </div>
        </div>
      </div>

      {/* Main Profile Summary Card */}
      <div className="dashboard-card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #ffffff 0%, #f1f7fc 100%)', borderLeft: '6px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
              <User size={40} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{profile.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
                <strong>{t.citizen.ageGender}</strong> {profile.age} {t.citizen.years} / {profile.gender === 'Male' && language === 'hi' ? 'पुरुष' : (profile.gender === 'Female' && language === 'hi' ? 'महिला' : profile.gender)}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
                <strong>{t.citizen.bloodGroup}</strong> <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{profile.bloodGroup}</span>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                Height: <strong>{profile.height || '—'} cm</strong> &middot; Weight: <strong>{profile.weight || '—'} kg</strong>
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ border: '1px solid var(--surface-border)', padding: '6px', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' }} onClick={() => setPage('qr')}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=medflow-patient-${profile.id}`} alt="Health QR" style={{ width: '64px', height: '64px' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.citizen.secureQr}</span>
          </div>
        </div>
      </div>

      {/* Key Health Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Conditions Card */}
        <div className="dashboard-card animate-cascade-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--primary)' }}>
            <Activity size={24} />
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.citizen.activeConditions}</h4>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {profile.currentConditions && profile.currentConditions.map((cond, idx) => (
              <span key={idx} className="badge badge-saffron" style={{ fontSize: '0.8rem' }} className={language === 'hi' ? 'badge badge-saffron hindi-text' : 'badge badge-saffron'}>
                {language === 'hi' && cond === 'Type 2 Diabetes' ? 'टाइप 2 मधुमेह' : 
                 language === 'hi' && cond === 'Hypertension' ? 'उच्च रक्तचाप' :
                 language === 'hi' && cond === 'Iron Deficiency Anemia' ? 'एनीमिया' : cond}
              </span>
            ))}
            {(!profile.currentConditions || profile.currentConditions.length === 0) && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
                {t.citizen.noConditions}
              </span>
            )}
          </div>
        </div>

        {/* Medications Card */}
        <div className="dashboard-card animate-cascade-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--green)' }}>
            <Pill size={24} />
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.citizen.currentMedications}</h4>
          </div>
          <ul style={{ listStyle: 'none' }}>
            {profile.currentMedications && profile.currentMedications.map((med, idx) => (
              <li key={idx} style={{ padding: '4px 0', borderBottom: idx < profile.currentMedications.length - 1 ? '1px solid var(--surface-border)' : 'none', fontSize: '0.9rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
                <strong>{med.name}</strong> ({med.dose}) - <span style={{ color: 'var(--text-secondary)' }}>{language === 'hi' && med.freq === 'Once daily' ? 'दिन में एक बार' : med.freq}</span>
              </li>
            ))}
            {(!profile.currentMedications || profile.currentMedications.length === 0) && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} className={language === 'hi' ? 'hindi-text' : ''}>
                {t.citizen.noMedications}
              </span>
            )}
          </ul>
        </div>

        {/* Allergies Card */}
        <div className="dashboard-card animate-cascade-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--danger)' }}>
            <ShieldAlert size={24} />
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.citizen.allergiesEmerg}</h4>
          </div>
          <div style={{ marginBottom: '12px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>{language === 'en' ? 'Allergies:' : 'एलर्जी विवरण:'}</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
              {profile.allergies && profile.allergies.map((all, idx) => (
                <span key={idx} className="badge badge-danger" style={{ fontSize: '0.75rem' }}>
                  {language === 'hi' && all === 'Penicillin' ? 'पेनिसिलिन' : all}
                </span>
              ))}
              {(!profile.allergies || profile.allergies.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.citizen.noAllergies}</span>}
            </div>
          </div>
          <div className={language === 'hi' ? 'hindi-text' : ''}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PhoneCall size={14} /> {t.citizen.contactLabel}
            </strong>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              {profile.emergencyContact}
            </p>
          </div>
        </div>

      </div>

      {/* Last Visit Summary */}
      <div className="dashboard-card animate-cascade-4" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--warning)' }}>
          <Calendar size={24} />
          <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.citizen.lastVisit}</h4>
        </div>
        {profile.lastVisit ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }} className={language === 'hi' ? 'hindi-text' : ''}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>{profile.lastVisit.facility}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.citizen.doctorLabel} {profile.lastVisit.doctor}</p>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
              {profile.lastVisit.date}
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hospital visits recorded.</p>
        )}
      </div>

      {/* Navigation Shortcuts */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }} className={language === 'hi' ? 'hindi-text' : ''}>
        {t.citizen.accessServices}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="dashboard-card" style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setPage('records')}>
          <div className={language === 'hi' ? 'hindi-text' : ''}>
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{t.citizen.recordsBtn}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.citizen.recordsDesc}</p>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </div>

        <div className="dashboard-card" style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setPage('timeline')}>
          <div className={language === 'hi' ? 'hindi-text' : ''}>
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{t.citizen.timelineBtn}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.citizen.timelineDesc}</p>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </div>

        <div className="dashboard-card" style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setPage('analytics')}>
          <div className={language === 'hi' ? 'hindi-text' : ''}>
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{t.citizen.analyticsTab}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.analytics.subtitle.substring(0, 40)}...</p>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </div>

        <div className="dashboard-card" style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setPage('upload')}>
          <div className={language === 'hi' ? 'hindi-text' : ''}>
            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{t.citizen.uploadBtn}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.citizen.uploadDesc}</p>
          </div>
          <ArrowRight size={18} color="var(--primary)" />
        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11, 34, 64, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="dashboard-card" style={{ maxWidth: '480px', width: '100%', backgroundColor: 'white', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }} className={language === 'hi' ? 'hindi-text' : ''}>{t.citizen.editProfile}</h3>
              <button onClick={() => setIsEditing(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            {successMsg ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CheckCircle2 size={40} color="var(--gov-green)" style={{ margin: '0 auto 12px auto' }} />
                <p style={{ fontWeight: 600, color: 'var(--gov-green)' }}>{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.address}</label>
                  <input type="text" className="form-control" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t.login.height}</label>
                    <input type="number" className="form-control" value={editForm.height} onChange={e => setEditForm({ ...editForm, height: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t.login.weight}</label>
                    <input type="number" className="form-control" value={editForm.weight} onChange={e => setEditForm({ ...editForm, weight: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t.login.emergencyContact}</label>
                  <input type="text" className="form-control" value={editForm.emergency_contact} onChange={e => setEditForm({ ...editForm, emergency_contact: e.target.value })} required />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                    <span className={language === 'hi' ? 'hindi-text' : ''}>{t.citizen.close}</span>
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--gov-navy)' }} disabled={saving}>
                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <span className={language === 'hi' ? 'hindi-text' : ''}>{t.citizen.saveProfile}</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
