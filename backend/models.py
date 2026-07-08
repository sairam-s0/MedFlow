from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)  # Health ID, License Number, or Govt Ref ID
    password_hash = db.Column(db.String(255), nullable=False)
    salt = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'citizen', 'doctor', 'govt'
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'citizen_id': self.citizen_id,
            'doctor_id': self.doctor_id
        }

class Citizen(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    health_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    dob = db.Column(db.String(20), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False)
    height = db.Column(db.Float, nullable=True)
    weight = db.Column(db.Float, nullable=True)
    contact = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    district = db.Column(db.String(100), nullable=True)
    block = db.Column(db.String(100), nullable=True)
    phc = db.Column(db.String(100), nullable=True)
    village = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    emergency_contact = db.Column(db.String(100), nullable=False)
    
    # CDS metrics
    health_score = db.Column(db.Integer, nullable=True, default=85)
    overall_stability = db.Column(db.String(50), nullable=True, default='Good')
    family_history = db.Column(db.Text, nullable=True)
    lifestyle_notes = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    conditions = db.relationship('Condition', backref='citizen', lazy=True, cascade="all, delete-orphan")
    medications = db.relationship('Medication', backref='citizen', lazy=True, cascade="all, delete-orphan")
    allergies = db.relationship('Allergy', backref='citizen', lazy=True, cascade="all, delete-orphan")
    records = db.relationship('MedicalRecord', backref='citizen', lazy=True, cascade="all, delete-orphan")
    timeline_events = db.relationship('TimelineEvent', backref='citizen', lazy=True, cascade="all, delete-orphan")
    consultations = db.relationship('Consultation', backref='citizen', lazy=True, cascade="all, delete-orphan")
    lab_results = db.relationship('LabResult', backref='citizen', lazy=True, cascade="all, delete-orphan")
    risk_indicators = db.relationship('RiskIndicator', backref='citizen', lazy=True, cascade="all, delete-orphan")
    follow_ups = db.relationship('FollowUp', backref='citizen', lazy=True, cascade="all, delete-orphan")
    vaccinations = db.relationship('Vaccination', backref='citizen', lazy=True, cascade="all, delete-orphan")
    appointments = db.relationship('Appointment', backref='citizen', lazy=True, cascade="all, delete-orphan")
    qr_tokens = db.relationship('QRToken', backref='citizen', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'health_id': self.health_id,
            'name': self.name,
            'age': self.age,
            'gender': self.gender,
            'dob': self.dob,
            'blood_group': self.blood_group,
            'height': self.height,
            'weight': self.weight,
            'contact': self.contact,
            'address': self.address,
            'district': self.district,
            'block': self.block,
            'phc': self.phc,
            'village': self.village,
            'state': self.state,
            'emergency_contact': self.emergency_contact,
            'health_score': self.health_score,
            'overall_stability': self.overall_stability,
            'family_history': self.family_history,
            'lifestyle_notes': self.lifestyle_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'conditions': [c.to_dict() for c in self.conditions],
            'medications': [m.to_dict() for m in self.medications],
            'allergies': [a.to_dict() for a in self.allergies],
            'vaccinations': [v.to_dict() for v in self.vaccinations]
        }

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospital.id'), nullable=True)

    consultations = db.relationship('Consultation', backref='doctor', lazy=True)
    appointments = db.relationship('Appointment', backref='doctor', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'license_number': self.license_number,
            'name': self.name,
            'specialty': self.specialty,
            'hospital_id': self.hospital_id
        }

class Hospital(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)

    doctors = db.relationship('Doctor', backref='hospital', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'district': self.district,
            'state': self.state
        }

class Condition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    diagnosed_year = db.Column(db.String(4), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'Active', 'Resolved'

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
    dosage = db.Column(db.String(50), nullable=True)      # e.g. "500mg"
    frequency = db.Column(db.String(50), nullable=True)   # e.g. "Once daily"
    instructions = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'started_year': self.started_year,
            'active': self.active,
            'dosage': self.dosage,
            'frequency': self.frequency,
            'instructions': self.instructions
        }

class Allergy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(20), nullable=True)  # 'Low', 'Medium', 'High'

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
    record_type = db.Column(db.String(50), nullable=False)  # 'Lab Reports', 'Prescriptions', 'Radiology', 'Vaccinations', 'Operations', 'Discharge Summaries'
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
    event_type = db.Column(db.String(50), nullable=False)  # 'Consultation', 'Diagnosis', 'Vaccination', 'Surgery', 'Upload'

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
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=True)
    doctor_name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    diagnosis = db.Column(db.Text, nullable=False)
    prescription = db.Column(db.Text, nullable=False)
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor_name,
            'date': self.date,
            'diagnosis': self.diagnosis,
            'prescription': self.prescription,
            'notes': self.notes
        }

class LabResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    test_name = db.Column(db.String(100), nullable=False)
    value = db.Column(db.String(50), nullable=False)
    unit = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)  # e.g. Above Normal, Normal, Low
    trend = db.Column(db.String(50), nullable=False)   # e.g. Stable, Improving, Increasing, Decreasing

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
    type = db.Column(db.String(100), nullable=False)  # e.g. Lab Test, Consultation, Vaccination
    description = db.Column(db.Text, nullable=False)
    due_date = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), nullable=False)  # Upcoming, Missed, Completed, Pending

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'description': self.description,
            'due_date': self.due_date,
            'status': self.status
        }

class Vaccination(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    vaccine_name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)  # Completed, Scheduled
    dose_number = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'vaccine_name': self.vaccine_name,
            'date': self.date,
            'status': self.status,
            'dose_number': self.dose_number
        }

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=True)
    doctor_name = db.Column(db.String(100), nullable=False)
    hospital = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)  # Scheduled, Completed, Cancelled

    def to_dict(self):
        return {
            'id': self.id,
            'doctor_name': self.doctor_name,
            'hospital': self.hospital,
            'date': self.date,
            'time': self.time,
            'status': self.status
        }

class District(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    state = db.Column(db.String(100), nullable=False)

    regions = db.relationship('Region', backref='district_rel', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'state': self.state
        }

class Region(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'Block', 'PHC', 'Village'
    parent_id = db.Column(db.Integer, db.ForeignKey('region.id'), nullable=True)
    district_id = db.Column(db.Integer, db.ForeignKey('district.id'), nullable=False)

    sub_regions = db.relationship('Region', backref=db.backref('parent', remote_side=[id]), lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'parent_id': self.parent_id,
            'district_id': self.district_id
        }

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    actor_role = db.Column(db.String(20), nullable=False)  # 'Citizen', 'Doctor', 'Govt'
    actor_id = db.Column(db.String(100), nullable=False)
    action = db.Column(db.String(100), nullable=False)  # e.g. 'VIEW_PROFILE', 'ACCESS_RECORD', 'INGEST_DOC'
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=True)
    details = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'actor_role': self.actor_role,
            'actor_id': self.actor_id,
            'action': self.action,
            'citizen_id': self.citizen_id,
            'details': self.details
        }

class QRToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey('citizen.id'), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False)
    uuid = db.Column(db.String(255), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'citizen_id': self.citizen_id,
            'token': self.token,
            'uuid': self.uuid,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
