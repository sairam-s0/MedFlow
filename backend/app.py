from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Citizen, Condition, Medication, Allergy, MedicalRecord, TimelineEvent, Consultation
import os

app = Flask(__name__)
CORS(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__name__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'medflow.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Helper function to get citizen by health_id
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


@app.route('/api/doctors/scan/<health_id>', methods=['GET'])
def get_doctor_patient_summary(health_id):
    # For the doctor, we essentially need the citizen profile, records, and timeline
    # We can aggregate it into one large summary response
    citizen = get_citizen_by_health_id(health_id)
    if not citizen:
        return jsonify({'error': 'Citizen not found'}), 404
    
    records = MedicalRecord.query.filter_by(citizen_id=citizen.id).order_by(MedicalRecord.id.desc()).limit(5).all()
    timeline = TimelineEvent.query.filter_by(citizen_id=citizen.id).order_by(TimelineEvent.year.asc()).all()

    summary = citizen.to_dict()
    summary['recent_records'] = [r.to_dict() for r in records]
    summary['timeline'] = [t.to_dict() for t in timeline]

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

    # Add consultation
    consultation = Consultation(
        citizen_id=citizen.id,
        doctor_name=doctor_name,
        date=date,
        diagnosis=diagnosis,
        prescription=prescription,
        notes=notes
    )
    db.session.add(consultation)

    # Automatically add to Timeline
    year = date.split('-')[0] if '-' in date else "2025"
    timeline_event = TimelineEvent(
        citizen_id=citizen.id,
        year=year,
        title="Doctor Consultation",
        description=f"Consulted {doctor_name}. Diagnosis: {diagnosis}",
        event_type="Consultation"
    )
    db.session.add(timeline_event)

    # Update citizen's last visit
    citizen.last_hospital_visit = date

    db.session.commit()

    return jsonify({'message': 'Consultation saved successfully', 'consultation_id': consultation.id}), 201


@app.route('/api/citizens/<health_id>/records/upload', methods=['POST'])
def upload_medical_record():
    # Mock file upload endpoint
    # In reality, this would receive a file (request.files), process it via AI (OCR + Gemini), 
    # and then store the extracted structured data.
    
    # For now, we simulate receiving the structured data directly or mocking it.
    data = request.json
    health_id = data.get('health_id')
    
    citizen = get_citizen_by_health_id(health_id)
    if not citizen:
        return jsonify({'error': 'Citizen not found'}), 404
        
    hospital = data.get('hospital', 'Unknown Hospital')
    date = data.get('date', '2025-01-01')
    doctor = data.get('doctor', 'Unknown Doctor')
    record_type = data.get('record_type', 'Uploaded Report')
    structured_summary = data.get('structured_summary', '{}')
    
    import json
    if isinstance(structured_summary, dict):
        structured_summary = json.dumps(structured_summary)

    # 1. Create the Medical Record
    record = MedicalRecord(
        citizen_id=citizen.id,
        hospital=hospital,
        date=date,
        doctor=doctor,
        record_type=record_type,
        verified=False,  # Unverified initially
        open_access=True,
        file_path="/uploads/mock_new_record.pdf",
        structured_summary=structured_summary
    )
    db.session.add(record)

    # 2. Add to Timeline automatically
    year = date.split('-')[0] if '-' in date else "2025"
    timeline_event = TimelineEvent(
        citizen_id=citizen.id,
        year=year,
        title=f"New {record_type} Uploaded",
        description=f"Added record from {hospital}",
        event_type="Upload"
    )
    db.session.add(timeline_event)
    
    db.session.commit()

    return jsonify({'message': 'Record uploaded and structured successfully', 'record_id': record.id}), 201


@app.route('/api/government/dashboard', methods=['GET'])
def get_government_dashboard():
    # Mocking government stats dynamically or returning static for rapid prototyping
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
    # Mock heatmap/analytics data
    heatmap_data = [
        {'region': 'District Center', 'disease': 'Diabetes', 'level': 'High'},
        {'region': 'North PHC', 'disease': 'Hypertension', 'level': 'Medium'},
        {'region': 'East Village', 'disease': 'Vaccination', 'level': 'Low'},
        {'region': 'South Village', 'disease': 'Anemia', 'level': 'High'}
    ]
    return jsonify({'heatmap': heatmap_data}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)
