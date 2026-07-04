from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Citizen(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    health_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False)
    contact = db.Column(db.String(20), nullable=True)
    emergency_contact = db.Column(db.String(100), nullable=False)
    last_hospital_visit = db.Column(db.String(50), nullable=True)
    
    # New CDS fields
    health_score = db.Column(db.Integer, nullable=True)
    overall_stability = db.Column(db.String(50), nullable=True)
    family_history = db.Column(db.Text, nullable=True)
    lifestyle_notes = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    conditions = db.relationship('Condition', backref='citizen', lazy=True)
    medications = db.relationship('Medication', backref='citizen', lazy=True)
    allergies = db.relationship('Allergy', backref='citizen', lazy=True)
    records = db.relationship('MedicalRecord', backref='citizen', lazy=True)
    timeline_events = db.relationship('TimelineEvent', backref='citizen', lazy=True)
    consultations = db.relationship('Consultation', backref='citizen', lazy=True)
    lab_results = db.relationship('LabResult', backref='citizen', lazy=True)
    risk_indicators = db.relationship('RiskIndicator', backref='citizen', lazy=True)
    follow_ups = db.relationship('FollowUp', backref='citizen', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'health_id': self.health_id,
            'name': self.name,
            'age': self.age,
            'gender': self.gender,
            'blood_group': self.blood_group,
            'contact': self.contact,
            'emergency_contact': self.emergency_contact,
            'last_hospital_visit': self.last_hospital_visit,
            'health_score': self.health_score,
            'overall_stability': self.overall_stability,
            'family_history': self.family_history,
            'lifestyle_notes': self.lifestyle_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'conditions': [c.to_dict() for c in self.conditions],
            'medications': [m.to_dict() for m in self.medications],
            'allergies': [a.to_dict() for a in self.allergies]
        }

class Condition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    diagnosed_year = db.Column(db.String(4), nullable=False)
    status = db.Column(db.String(20), nullable=False) 

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'diagnosed_year': self.diagnosed_year,
            'status': self.status
        }

class Medication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    started_year = db.Column(db.String(4), nullable=False)
    active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'started_year': self.started_year,
            'active': self.active
        }

class Allergy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(20), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'severity': self.severity
        }

class MedicalRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    hospital = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    doctor = db.Column(db.String(100), nullable=False)
    record_type = db.Column(db.String(50), nullable=False) 
    verified = db.Column(db.Boolean, default=False)
    open_access = db.Column(db.Boolean, default=True)
    file_path = db.Column(db.String(255), nullable=True) 
    structured_summary = db.Column(db.Text, nullable=True) 

    def to_dict(self):
        return {
            'id': self.id,
            'hospital': self.hospital,
            'date': self.date,
            'doctor': self.doctor,
            'record_type': self.record_type,
            'verified': self.verified,
            'open_access': self.open_access,
            'file_path': self.file_path,
            'structured_summary': json.loads(self.structured_summary) if self.structured_summary else None
        }

class TimelineEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    year = db.Column(db.String(4), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    event_type = db.Column(db.String(50), nullable=False) 

    def to_dict(self):
        return {
            'id': self.id,
            'year': self.year,
            'title': self.title,
            'description': self.description,
            'event_type': self.event_type
        }

class Consultation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    doctor_name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    diagnosis = db.Column(db.Text, nullable=False)
    prescription = db.Column(db.Text, nullable=False)
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'doctor_name': self.doctor_name,
            'date': self.date,
            'diagnosis': self.diagnosis,
            'prescription': self.prescription,
            'notes': self.notes
        }

# --- NEW CDS MODELS ---

class LabResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    test_name = db.Column(db.String(100), nullable=False)
    value = db.Column(db.String(50), nullable=False)
    unit = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False) # e.g. Above Normal, Normal, Low
    trend = db.Column(db.String(50), nullable=False)  # e.g. Stable, Improving, Increasing

    def to_dict(self):
        return {
            'id': self.id,
            'test_name': self.test_name,
            'value': self.value,
            'unit': self.unit,
            'date': self.date,
            'status': self.status,
            'trend': self.trend
        }

class RiskIndicator(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    indicator = db.Column(db.String(255), nullable=False)
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'indicator': self.indicator,
            'notes': self.notes
        }

class FollowUp(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    type = db.Column(db.String(100), nullable=False) # e.g. Lab Test, Consultation, Vaccination
    description = db.Column(db.Text, nullable=False)
    due_date = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), nullable=False) # Upcoming, Missed, Pending

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'description': self.description,
            'due_date': self.due_date,
            'status': self.status
        }
