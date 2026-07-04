from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Citizen, Condition, Medication, Allergy, MedicalRecord, TimelineEvent, Consultation, LabResult, RiskIndicator, FollowUp
from datetime import datetime
import os
app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__name__))
# Use /tmp/medflow.db on Vercel to support read-only filesystem environments
if os.environ.get('VERCEL'):
    db_path = '/tmp/medflow.db'
else:
    db_path = os.path.join(basedir, 'medflow.db')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Register AI Blueprint
from ai.routes import ai_bp
app.register_blueprint(ai_bp)

# Auto-initialize and seed the DB if empty
with app.app_context():
    db.create_all()
    if not Citizen.query.first():
        try:
            from seed import seed_data
            seed_data()
        except Exception as e:
            print(f"Error auto-seeding database: {e}")

def get_citizen_by_health_id(health_id):
    return Citizen.query.filter_by(health_id=health_id).first()

@app.route('/api/citizens/<health_id>', methods=['GET'])
def get_citizen_profile(health_id):
    citizen = get_citizen_by_health_id(health_id)
    if not citizen:
        return jsonify({'error': 'Citizen not found'}), 404
    return jsonify(citizen.to_dict()), 200

@app.route('/api/citizens/<health_id>/records', methods=['GET'])
def get_medical_records(health_id):
    citizen = get_citizen_by_health_id(health_id)
    if not citizen:
        return jsonify({'error': 'Citizen not found'}), 404
    records = MedicalRecord.query.filter_by(citizen_id=citizen.id).all()
    return jsonify([r.to_dict() for r in records]), 200

@app.route('/api/citizens/<health_id>/timeline', methods=['GET'])
def get_health_timeline(health_id):
    citizen = get_citizen_by_health_id(health_id)
    if not citizen:
        return jsonify({'error': 'Citizen not found'}), 404
    events = TimelineEvent.query.filter_by(citizen_id=citizen.id).order_by(TimelineEvent.year.asc()).all()
    return jsonify([e.to_dict() for e in events]), 200

# --- NEW CDS ANALYTICS ENDPOINTS ---

@app.route('/api/citizens/<health_id>/analytics', methods=['GET'])
def get_personal_health_analytics(health_id):
    citizen = get_citizen_by_health_id(health_id)
    if not citizen:
        return jsonify({'error': 'Citizen not found'}), 404
    
    lab_results = LabResult.query.filter_by(citizen_id=citizen.id).all()
    risk_indicators = RiskIndicator.query.filter_by(citizen_id=citizen.id).all()
    
    analytics = {
        'health_score': citizen.health_score,
        'overall_stability': citizen.overall_stability,
        'recent_lab_status': [lr.to_dict() for lr in lab_results],
        'risk_indicators': [ri.to_dict() for ri in risk_indicators]
    }
    return jsonify(analytics), 200

@app.route('/api/citizens/<health_id>/followups', methods=['GET'])
def get_followups(health_id):
    citizen = get_citizen_by_health_id(health_id)
    if not citizen:
        return jsonify({'error': 'Citizen not found'}), 404
    
    follow_ups = FollowUp.query.filter_by(citizen_id=citizen.id).all()
    return jsonify([f.to_dict() for f in follow_ups]), 200

# --- DOCTOR DASHBOARD ENHANCEMENT ---

@app.route('/api/doctors/scan/<health_id>', methods=['GET'])
def get_doctor_patient_summary(health_id):
    citizen = get_citizen_by_health_id(health_id)
    if not citizen:
        return jsonify({'error': 'Citizen not found'}), 404
    
    records = MedicalRecord.query.filter_by(citizen_id=citizen.id).order_by(MedicalRecord.id.desc()).limit(5).all()
    timeline = TimelineEvent.query.filter_by(citizen_id=citizen.id).order_by(TimelineEvent.year.asc()).all()
    lab_results = LabResult.query.filter_by(citizen_id=citizen.id).all()
    risk_indicators = RiskIndicator.query.filter_by(citizen_id=citizen.id).all()
    follow_ups = FollowUp.query.filter_by(citizen_id=citizen.id).all()

    summary = citizen.to_dict()
    summary['recent_records'] = [r.to_dict() for r in records]
    summary['timeline'] = [t.to_dict() for t in timeline]
    summary['recent_lab_trends'] = [lr.to_dict() for lr in lab_results]
    summary['critical_alerts'] = [ri.to_dict() for ri in risk_indicators]
    summary['pending_follow_ups'] = [f.to_dict() for f in follow_ups if f.status != 'Missed']

    return jsonify(summary), 200

@app.route('/api/doctors/consultations', methods=['POST'])
def add_consultation():
    data = request.json
    health_id = data.get('health_id')
    doctor_name = data.get('doctor_name')
    date = data.get('date')
    diagnosis = data.get('diagnosis')
    prescription = data.get('prescription')
    notes = data.get('notes', '')

    citizen = get_citizen_by_health_id(health_id)
    if not citizen:
        return jsonify({'error': 'Citizen not found'}), 404

    consultation = Consultation(
        citizen_id=citizen.id,
        doctor_name=doctor_name,
        date=date,
        diagnosis=diagnosis,
        prescription=prescription,
        notes=notes
    )
    db.session.add(consultation)

    year = date.split('-')[0] if '-' in date else "2025"
    timeline_event = TimelineEvent(
        citizen_id=citizen.id,
        year=year,
        title="Doctor Consultation",
        description=f"Consulted {doctor_name}. Diagnosis: {diagnosis}",
        event_type="Consultation"
    )
    db.session.add(timeline_event)
    citizen.last_hospital_visit = date
    db.session.commit()

    return jsonify({'message': 'Consultation saved successfully', 'consultation_id': consultation.id}), 201

@app.route('/api/citizens/<health_id>/records/upload', methods=['POST'])
def upload_medical_record():
    data = request.json
    health_id = data.get('health_id')
    citizen = get_citizen_by_health_id(health_id)
    if not citizen:
        return jsonify({'error': 'Citizen not found'}), 404
        
    ai_data = data.get('ai_data') or {}
    
    hospital = ai_data.get('hospital_or_clinic') or data.get('hospital') or 'Unknown Hospital'
    date = ai_data.get('date') or data.get('date') or datetime.now().strftime('%Y-%m-%d')
    doctor = ai_data.get('doctor_name') or data.get('doctor') or 'Unknown Doctor'
    record_type = ai_data.get('document_type') or data.get('record_type') or 'Uploaded Report'
    notes = ai_data.get('notes') or ''
    
    # Generate structured summary dictionary
    structured_summary = data.get('structured_summary') or {}
    if not structured_summary or (isinstance(structured_summary, dict) and not any(structured_summary.values())):
        structured_summary = {
            'keyMetrics': f"Extracted {record_type.replace('_', ' ').title()}",
            'clinicalNotes': notes,
            'recommendations': 'Check up as needed.'
        }
        
    import json
    if isinstance(structured_summary, dict):
        structured_summary_str = json.dumps(structured_summary)
    else:
        structured_summary_str = structured_summary

    # 1. Save MedicalRecord
    record = MedicalRecord(
        citizen_id=citizen.id,
        hospital=hospital,
        date=date,
        doctor=doctor,
        record_type=record_type.replace('_', ' ').title(),
        verified=False,
        open_access=True,
        file_path="/uploads/new_upload.pdf",
        structured_summary=structured_summary_str
    )
    db.session.add(record)

    # 2. Extract and Add Conditions (Diagnosis)
    diagnoses = ai_data.get('diagnosis', [])
    for diag in diagnoses:
        exists = Condition.query.filter_by(citizen_id=citizen.id, name=diag).first()
        if not exists:
            new_cond = Condition(citizen_id=citizen.id, name=diag, diagnosed_year=date.split('-')[0], status="Active")
            db.session.add(new_cond)
            
    # 3. Extract and Add Medications
    meds = ai_data.get('medications', [])
    for med in meds:
        name = med.get('name')
        if name:
            dosage = med.get('dosage', '')
            freq = med.get('frequency', '')
            full_name = f"{name} {dosage}".strip()
            exists = Medication.query.filter_by(citizen_id=citizen.id, name=full_name).first()
            if not exists:
                new_med = Medication(citizen_id=citizen.id, name=full_name, started_year=date.split('-')[0], active=True)
                db.session.add(new_med)

    # 4. Extract and Add Allergies
    allergies = ai_data.get('allergies', [])
    for allergy in allergies:
        exists = Allergy.query.filter_by(citizen_id=citizen.id, name=allergy).first()
        if not exists:
            new_allergy = Allergy(citizen_id=citizen.id, name=allergy, severity="Medium")
            db.session.add(new_allergy)

    # 5. Extract and Add Lab Results
    labs = ai_data.get('lab_results', [])
    for lab in labs:
        test_name = lab.get('test_name')
        value = lab.get('value')
        if test_name and value:
            new_lab = LabResult(
                citizen_id=citizen.id,
                test_name=test_name,
                value=str(value),
                unit=lab.get('unit', ''),
                date=date,
                status=lab.get('flag') or 'Normal',
                trend='Stable'
            )
            db.session.add(new_lab)

    # 6. Add Timeline Event
    year = date.split('-')[0] if '-' in date else "2025"
    timeline_event = TimelineEvent(
        citizen_id=citizen.id,
        year=year,
        title=f"New {record_type.replace('_', ' ').title()} Ingested",
        description=f"AI Ingestion: {notes[:200]}...",
        event_type="AI Ingestion"
    )
    db.session.add(timeline_event)
    
    # Update last visit
    citizen.last_hospital_visit = date
    db.session.commit()

    return jsonify({'message': 'Record and extracted clinical entities successfully saved to database', 'record_id': record.id}), 201

@app.route('/api/government/dashboard', methods=['GET'])
def get_government_dashboard():
    total_citizens = Citizen.query.count()
    active_chronic = Condition.query.filter_by(status='Active').count()
    
    dashboard_data = {
        'district_overview': {
            'registered_citizens': total_citizens,
            'active_chronic_patients': active_chronic,
            'follow_up_compliance': '87%',
            'pregnancy_tracking': 1420,
            'vaccination_coverage': '92%'
        },
        'most_common_diseases': [
            {'name': 'Diabetes', 'count': 4500},
            {'name': 'Hypertension', 'count': 3800},
            {'name': 'Anemia', 'count': 2100},
            {'name': 'Asthma', 'count': 1200}
        ],
        'trending_diseases': [
            {'name': 'Dengue', 'trend': 'up'},
            {'name': 'Viral Fever', 'trend': 'up'},
            {'name': 'Malaria', 'trend': 'down'}
        ],
        'medicine_demand': [
            {'name': 'Insulin', 'status': 'High Demand'},
            {'name': 'Paracetamol', 'status': 'Stable'},
            {'name': 'Iron Tablets', 'status': 'Moderate Demand'}
        ],
        'pending_follow_ups': 427
    }
    return jsonify(dashboard_data), 200

@app.route('/api/government/analytics', methods=['GET'])
def get_healthcare_analytics():
    heatmap_data = [
        {'region': 'District Center', 'disease': 'Diabetes', 'level': 'High'},
        {'region': 'North PHC', 'disease': 'Hypertension', 'level': 'Medium'},
        {'region': 'East Village', 'disease': 'Vaccination', 'level': 'Low'},
        {'region': 'South Village', 'disease': 'Anemia', 'level': 'High'}
    ]
    return jsonify({'heatmap': heatmap_data}), 200

@app.route('/patient/<health_id>', methods=['GET'])
def patient_card_html(health_id):
    """
    Serves a self-contained HTML patient summary card.
    When the QR code is scanned, this page opens in the phone browser.
    It includes a print/save-PDF button.
    """
    citizen = get_citizen_by_health_id(health_id)
    if not citizen:
        return "<html><body><h2>Patient not found. Health ID: " + health_id + "</h2></body></html>", 404

    data = citizen.to_dict()
    name = data.get('name', 'Unknown')
    age = data.get('age', '—')
    gender = data.get('gender', '—')
    blood = data.get('blood_group', '—')
    contact = data.get('contact', '—')
    emergency = data.get('emergency_contact', '—')
    last_visit = data.get('last_hospital_visit', '—')
    conditions = ', '.join([c['name'] for c in data.get('conditions', [])]) or 'None recorded'
    medications = ', '.join([m['name'] for m in data.get('medications', [])]) or 'None recorded'
    allergies = ', '.join([a['name'] for a in data.get('allergies', [])]) or 'None recorded'
    health_score = data.get('health_score', '—')
    stability = data.get('overall_stability', '—')
    generated = datetime.now().strftime('%d %B %Y, %I:%M %p')

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MedFlow Health Card — {name}</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; color: #1a202c; min-height: 100vh; }}
  .wrapper {{ max-width: 680px; margin: 0 auto; padding: 24px 16px; }}
  .card {{ background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12); margin-bottom: 16px; }}
  .card-header {{ background: linear-gradient(135deg, #0b2240 0%, #1e3a5f 100%); color: white; padding: 24px; position: relative; }}
  .tricolor {{ height: 5px; background: linear-gradient(90deg, #f15a24 0%, #ffffff 50%, #008037 100%); }}
  .header-top {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }}
  .logo {{ font-size: 1.4rem; font-weight: 800; letter-spacing: 0.05em; color: #f5a623; }}
  .logo span {{ font-size: 0.7rem; display: block; opacity: 0.8; font-weight: 400; text-transform: uppercase; margin-top: 2px; letter-spacing: 0.08em; }}
  .badge {{ background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 4px 12px; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; }}
  .patient-row {{ display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }}
  .patient-name {{ font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }}
  .patient-meta {{ display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }}
  .meta-item {{ }}
  .meta-item .label {{ font-size: 0.65rem; text-transform: uppercase; opacity: 0.6; }}
  .meta-item .value {{ font-size: 0.95rem; font-weight: 600; color: #f5a623; }}
  .qr-box {{ background: white; padding: 8px; border-radius: 10px; }}
  .qr-box img {{ display: block; width: 110px; height: 110px; }}
  .card-body {{ padding: 20px 24px; }}
  .section {{ margin-bottom: 18px; }}
  .section-title {{ font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #718096; font-weight: 700; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }}
  .info-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }}
  .info-item .label {{ font-size: 0.75rem; color: #718096; }}
  .info-item .value {{ font-size: 0.9rem; font-weight: 600; color: #1a202c; margin-top: 1px; }}
  .pill {{ display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; margin: 2px; }}
  .pill-red {{ background: #fff5f5; color: #c53030; border: 1px solid #fed7d7; }}
  .pill-blue {{ background: #ebf8ff; color: #2b6cb0; border: 1px solid #bee3f8; }}
  .pill-green {{ background: #f0fff4; color: #276749; border: 1px solid #c6f6d5; }}
  .alert-box {{ background: #fff5f5; border: 1px solid #fed7d7; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }}
  .alert-title {{ font-weight: 700; color: #c53030; font-size: 0.85rem; margin-bottom: 4px; }}
  .footer {{ text-align: center; color: #a0aec0; font-size: 0.72rem; padding: 12px; border-top: 1px solid #e2e8f0; }}
  .score-row {{ display: flex; align-items: center; gap: 16px; }}
  .score-circle {{ width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, #48bb78, #38a169); color: white; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }}
  .print-btn {{
    display: block; width: 100%; padding: 14px; background: #0b2240; color: white;
    font-size: 1rem; font-weight: 700; border: none; border-radius: 12px; cursor: pointer;
    margin-bottom: 12px; letter-spacing: 0.03em;
  }}
  .print-btn:hover {{ background: #1e3a5f; }}
  @media print {{
    body {{ background: white; }}
    .wrapper {{ padding: 0; max-width: 100%; }}
    .print-btn, .no-print {{ display: none !important; }}
    .card {{ box-shadow: none; border: 1px solid #ddd; margin-bottom: 8px; }}
  }}
  @media (max-width: 480px) {{
    .info-grid {{ grid-template-columns: 1fr; }}
    .patient-meta {{ gap: 12px; }}
  }}
</style>
</head>
<body>
<div class="wrapper">

  <div class="card">
    <div class="tricolor"></div>
    <div class="card-header">
      <div class="header-top">
        <div class="logo">
          &#9632; MEDFLOW
          <span>Ministry of Health &amp; Family Welfare</span>
        </div>
        <div class="badge">&#10003; VERIFIED ABHA</div>
      </div>
      <div class="patient-row">
        <div style="flex:1">
          <div class="patient-name">{name}</div>
          <div class="patient-meta">
            <div class="meta-item">
              <div class="label">Age / Gender</div>
              <div class="value">{age} yrs / {gender}</div>
            </div>
            <div class="meta-item">
              <div class="label">Blood Group</div>
              <div class="value">{blood}</div>
            </div>
            <div class="meta-item">
              <div class="label">ABHA ID</div>
              <div class="value" style="font-size:0.8rem">{health_id}</div>
            </div>
          </div>
        </div>
        <div class="qr-box">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data={request.host_url}patient/{health_id}" alt="ABHA QR" />
        </div>
      </div>
    </div>

    <div class="card-body">

      <div class="alert-box">
        <div class="alert-title">&#9888; ALLERGIES — READ BEFORE PRESCRIBING</div>
        <div>{allergies}</div>
      </div>

      <div class="section">
        <div class="section-title">Health Overview</div>
        <div class="score-row">
          <div class="score-circle">{health_score}</div>
          <div>
            <div style="font-weight:700; font-size:1rem">Health Score</div>
            <div style="color:#718096; font-size:0.85rem">Overall Stability: <strong>{stability}</strong></div>
            <div style="color:#718096; font-size:0.85rem; margin-top:2px">Last Visit: <strong>{last_visit}</strong></div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Active Conditions</div>
        <div>{"".join(f'<span class="pill pill-blue">{c["name"]}</span>' for c in data.get("conditions", [])) or "None recorded"}</div>
      </div>

      <div class="section">
        <div class="section-title">Current Medications</div>
        <div>{"".join(f'<span class="pill pill-green">{m["name"]}</span>' for m in data.get("medications", [])) or "None recorded"}</div>
      </div>

      <div class="section">
        <div class="section-title">Contact Information</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="label">Patient Contact</div>
            <div class="value">{contact}</div>
          </div>
          <div class="info-item">
            <div class="label">Emergency Contact</div>
            <div class="value" style="color:#c53030">{emergency}</div>
          </div>
        </div>
      </div>

    </div>
    <div class="footer">
      Generated by MedFlow &nbsp;|&nbsp; {generated} &nbsp;|&nbsp; ABDM Compliant &nbsp;|&nbsp; For authorised clinical use only
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">
    &#8681; &nbsp; Save as PDF / Print Health Card
  </button>

</div>
</body>
</html>"""

    from flask import Response
    return Response(html, mimetype='text/html')


if __name__ == '__main__':
    app.run(debug=True, port=5000)
