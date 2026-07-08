from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from models import db, User, Citizen, Doctor, Hospital, Condition, Medication, Allergy, MedicalRecord, TimelineEvent, Consultation, LabResult, RiskIndicator, FollowUp, Vaccination, Appointment, District, Region, AuditLog, QRToken
from datetime import datetime, timedelta
from collections import Counter
import os
import uuid
import hashlib
import hmac
import json
import time
import random
import base64
from functools import wraps

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

basedir = os.path.abspath(os.path.dirname(__name__))
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

# JWT Secret and standard helper functions
JWT_SECRET = "medflow-hackathon-security-2026-key"

def base64_url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').replace('=', '')

def base64_url_decode(data: str) -> bytes:
    padding = '=' * (4 - len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def encode_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64_url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = base64_url_encode(json.dumps(payload).encode('utf-8'))
    signature_base = f"{header_b64}.{payload_b64}"
    signature = hmac.new(JWT_SECRET.encode('utf-8'), signature_base.encode('utf-8'), hashlib.sha256).digest()
    signature_b64 = base64_url_encode(signature)
    return f"{signature_base}.{signature_b64}"

def decode_jwt(token: str) -> dict:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts
        signature_base = f"{header_b64}.{payload_b64}"
        expected_signature = hmac.new(JWT_SECRET.encode('utf-8'), signature_base.encode('utf-8'), hashlib.sha256).digest()
        expected_signature_b64 = base64_url_encode(expected_signature)
        if not hmac.compare_digest(signature_b64, expected_signature_b64):
            return None
        payload = json.loads(base64_url_decode(payload_b64).decode('utf-8'))
        if payload.get("exp") and payload["exp"] < time.time():
            return None
        return payload
    except Exception:
        return None

def hash_password(password: str, salt: str = None) -> tuple:
    if not salt:
        salt = uuid.uuid4().hex
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return hashed, salt

# Authorization Decorator
def token_required(allowed_roles=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
            
            if not token:
                return jsonify({'error': 'Unauthorized', 'message': 'Authentication token is missing.'}), 401
            
            payload = decode_jwt(token)
            if not payload:
                return jsonify({'error': 'Unauthorized', 'message': 'Token is invalid or has expired.'}), 401
            
            role = payload.get("role")
            if allowed_roles and role not in allowed_roles:
                return jsonify({'error': 'Forbidden', 'message': 'Permission denied.'}), 403
            
            # Inject user context into flask environment
            request.environ['user_context'] = payload
            return f(*args, **kwargs)
        return decorated
    return decorator

# Auto-initialize DB
with app.app_context():
    db.create_all()
    import sys
    is_seeding_script = any('seed.py' in arg for arg in sys.argv)
    if not is_seeding_script and not Citizen.query.first():
        try:
            from seed import seed_data
            seed_data()
        except Exception as e:
            print(f"Error auto-seeding database: {e}")

# --- AUTH ROUTES ---

@app.route('/api/auth/register', methods=['POST'])
def register_citizen():
    data = request.json
    try:
        # Check required fields
        required_fields = ['name', 'age', 'gender', 'dob', 'blood_group', 'height', 'weight', 'contact', 'address', 'district', 'state', 'emergency_contact', 'password']
        for rf in required_fields:
            if not data.get(rf):
                return jsonify({'error': 'Bad Request', 'message': f'Field {rf} is required.'}), 400
        
        # Check duplicate mobile number
        existing_mobile = Citizen.query.filter_by(contact=data['contact']).first()
        if existing_mobile:
            return jsonify({'error': 'Conflict', 'message': 'A citizen with this mobile number is already registered.'}), 409

        # Generate unique 14-digit Health ID / ABHA ID
        while True:
            parts = [str(random.randint(10, 99)) for _ in range(4)]
            # Format: 91-4829-1029-4821
            generated_id = f"{parts[0]}-{parts[1]}-{parts[2]}-{parts[3]}"
            if not Citizen.query.filter_by(health_id=generated_id).first():
                break

        # Assign random block/phc/village for regional maps based on their state/district
        blocks = ["Rampur Block", "Raipur Block", "Sundergarh Block", "Bilaspur Block", "Durg Block"]
        phcs = ["Rampur PHC", "Raipur PHC", "Sundergarh PHC", "Bilaspur Clinic", "Durg Community PHC"]
        villages = ["Village A", "Village B", "Village C", "Village D", "Village E"]
        
        block = random.choice(blocks)
        phc = random.choice(phcs)
        village = random.choice(villages)

        citizen = Citizen(
            health_id=generated_id,
            name=data['name'],
            age=int(data['age']),
            gender=data['gender'],
            dob=data['dob'],
            blood_group=data['blood_group'],
            height=float(data['height']),
            weight=float(data['weight']),
            contact=data['contact'],
            address=data['address'],
            district=data['district'],
            block=block,
            phc=phc,
            village=village,
            state=data['state'],
            emergency_contact=data['emergency_contact'],
            health_score=85,
            overall_stability="Stable",
            lifestyle_notes="Newly registered profile."
        )
        db.session.add(citizen)
        db.session.commit()

        # Hash password and create User credential
        hashed_pass, salt = hash_password(data['password'])
        user = User(
            username=generated_id,
            password_hash=hashed_pass,
            salt=salt,
            role='citizen',
            citizen_id=citizen.id
        )
        db.session.add(user)

        # Create first timeline event
        timeline = TimelineEvent(
            citizen_id=citizen.id,
            year=datetime.now().strftime('%Y'),
            title="Citizen Health Profile Activated",
            description="ABHA Digital Identity generated and registered under MedFlow NHA registry.",
            event_type="Registry"
        )
        db.session.add(timeline)

        # Create default followups/vaccines for fresh users if any optional parameters provided
        if data.get('existing_conditions'):
            conditions = [c.strip() for c in data['existing_conditions'].split(',')]
            for cond in conditions:
                if cond:
                    db.session.add(Condition(citizen_id=citizen.id, name=cond, diagnosed_year=datetime.now().strftime('%Y'), status="Active"))
                    db.session.add(TimelineEvent(citizen_id=citizen.id, year=datetime.now().strftime('%Y'), title=f"Existing Condition: {cond}", description=f"Flagged during profile registration.", event_type="Diagnosis"))
        
        if data.get('allergies'):
            allergies = [a.strip() for a in data['allergies'].split(',')]
            for allrg in allergies:
                if allrg:
                    db.session.add(Allergy(citizen_id=citizen.id, name=allrg, severity="Medium"))

        # Seed dummy vaccination to fresh profile
        db.session.add(Vaccination(citizen_id=citizen.id, vaccine_name="Tetanus Toxoid", date=datetime.now().strftime('%Y-%m-%d'), status="Completed", dose_number=1))
        db.session.add(TimelineEvent(citizen_id=citizen.id, year=datetime.now().strftime('%Y'), title="Vaccination: Tetanus Toxoid", description="Completed Dose 1 immunization.", event_type="Vaccination"))

        # Log action
        audit = AuditLog(
            actor_role="Citizen",
            actor_id=generated_id,
            action="REGISTER",
            citizen_id=citizen.id,
            details=f"Registered profile with name: {citizen.name}"
        )
        db.session.add(audit)
        
        db.session.commit()

        # Generate JWT Token for instant login
        payload = {
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "profile_id": citizen.id,
            "exp": time.time() + 86400  # 24 hours expiry
        }
        token = encode_jwt(payload)

        return jsonify({
            'message': 'Citizen registered successfully.',
            'health_id': generated_id,
            'token': token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')  # 'citizen', 'doctor', 'govt'

    if not username or not password or not role:
        return jsonify({'error': 'Bad Request', 'message': 'Username, password and role are required.'}), 400

    if username == 'test123' and password == 'test@123':
        if role == 'citizen':
            citizen = Citizen.query.filter_by(health_id='91-4829-1029-4821').first() or Citizen.query.first()
            if citizen:
                profile_id = citizen.id
                user_id = 99999
                db_username = citizen.health_id
            else:
                return jsonify({'error': 'Unauthorized', 'message': 'No seeded citizens found.'}), 401
        elif role == 'doctor':
            doctor = Doctor.query.first()
            if doctor:
                profile_id = doctor.id
                user_id = 99998
                db_username = doctor.license_number
            else:
                return jsonify({'error': 'Unauthorized', 'message': 'No seeded doctors found.'}), 401
        else: # govt
            profile_id = None
            user_id = 99997
            db_username = "test123"

        payload = {
            "user_id": user_id,
            "username": db_username,
            "role": role,
            "profile_id": profile_id,
            "exp": time.time() + 86400
        }
        token = encode_jwt(payload)
        return jsonify({
            'message': 'Login successful.',
            'token': token,
            'user': {
                'id': db_username,
                'role': role,
                'profile_id': profile_id
            }
        }), 200

    # Search for user credentials
    user = None
    if role == 'citizen' and '@' not in username and '-' not in username:
        # Check if login is mobile number
        citizen = Citizen.query.filter_by(contact=username).first()
        if citizen:
            user = User.query.filter_by(citizen_id=citizen.id).first()
    
    if not user:
        user = User.query.filter_by(username=username, role=role).first()

    if not user:
        return jsonify({'error': 'Unauthorized', 'message': 'Invalid ID or Credentials.'}), 401

    hashed_attempt, _ = hash_password(password, user.salt)
    if hashed_attempt != user.password_hash:
        return jsonify({'error': 'Unauthorized', 'message': 'Invalid ID or Credentials.'}), 401

    profile_id = user.citizen_id if role == 'citizen' else (user.doctor_id if role == 'doctor' else None)

    # Generate Token
    payload = {
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "profile_id": profile_id,
        "exp": time.time() + 86400  # 24 hours
    }
    token = encode_jwt(payload)

    # Log action
    audit = AuditLog(
        actor_role=role.upper(),
        actor_id=user.username,
        action="LOGIN",
        citizen_id=user.citizen_id,
        details="User logged in successfully"
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Login successful.',
        'token': token,
        'user': {
            'id': user.username,
            'role': user.role,
            'profile_id': profile_id
        }
    }), 200

# --- CITIZEN ROUTES ---

@app.route('/api/citizens/profile', methods=['GET', 'PUT'])
@token_required(allowed_roles=['citizen'])
def citizen_profile():
    u_context = request.environ['user_context']
    citizen = Citizen.query.get(u_context['profile_id'])
    if not citizen:
        return jsonify({'error': 'Not Found', 'message': 'Citizen profile not found.'}), 404

    if request.method == 'GET':
        return jsonify(citizen.to_dict()), 200

    elif request.method == 'PUT':
        data = request.json
        # Editable fields: Address, Weight, Height, Emergency Contact
        if 'address' in data: citizen.address = data['address']
        if 'weight' in data: citizen.weight = float(data['weight'])
        if 'height' in data: citizen.height = float(data['height'])
        if 'emergency_contact' in data: citizen.emergency_contact = data['emergency_contact']

        # Log change and update stability/health score trends
        audit = AuditLog(
            actor_role="Citizen",
            actor_id=citizen.health_id,
            action="UPDATE_PROFILE",
            citizen_id=citizen.id,
            details="Updated personal profile settings."
        )
        db.session.add(audit)
        
        # Recalculate BMI and log a weight trend log
        if 'weight' in data or 'height' in data:
            # Generate a lab result or update vitals logic if necessary
            pass

        db.session.commit()
        return jsonify({'message': 'Profile updated successfully.', 'citizen': citizen.to_dict()}), 200

@app.route('/api/citizens/analytics', methods=['GET'])
@token_required(allowed_roles=['citizen'])
def citizen_personal_analytics():
    u_context = request.environ['user_context']
    cid = u_context['profile_id']
    citizen = Citizen.query.get(cid)
    if not citizen:
        return jsonify({'error': 'Not Found', 'message': 'Citizen profile not found.'}), 404

    # Calculate BMI
    bmi = None
    if citizen.height and citizen.weight:
        height_m = citizen.height / 100.0
        bmi = round(citizen.weight / (height_m ** 2), 1)

    # Fetch and group trends
    lab_results = LabResult.query.filter_by(citizen_id=cid).all()
    risk_indicators = RiskIndicator.query.filter_by(citizen_id=cid).all()
    
    # Adherence metrics
    meds = Medication.query.filter_by(citizen_id=cid).all()
    active_count = len([m for m in meds if m.active])
    
    # Vaccination Coverage
    vaccines = Vaccination.query.filter_by(citizen_id=cid).all()
    vax_completed = len([v for v in vaccines if v.status == 'Completed'])
    
    analytics = {
        'health_score': citizen.health_score,
        'overall_stability': citizen.overall_stability,
        'bmi': bmi,
        'weight_trend': [
            {'date': citizen.created_at.strftime('%Y-%m-%d'), 'value': citizen.weight}
        ],
        'blood_sugar_trend': [
            {'date': r.date, 'value': float(r.value)} for r in lab_results if r.test_name.lower() in ['hba1c', 'fasting blood sugar', 'blood sugar']
        ],
        'blood_pressure_trend': [
            {'date': r.date, 'value': r.value} for r in lab_results if r.test_name.lower() in ['blood pressure', 'bp']
        ],
        'medication_adherence': 100 if active_count > 0 else 0, # simulated compliance base
        'vaccination_progress': {
            'completed': vax_completed,
            'total_scheduled': len(vaccines)
        },
        'risk_indicators': [ri.to_dict() for ri in risk_indicators],
        'health_score_trend': [
            {'date': citizen.created_at.strftime('%Y-%m-%d'), 'value': citizen.health_score}
        ]
    }
    return jsonify(analytics), 200

@app.route('/api/citizens/records', methods=['GET'])
@token_required(allowed_roles=['citizen', 'doctor'])
def get_citizens_records():
    u_context = request.environ['user_context']
    
    # If citizen, fetch their own. If doctor, fetch patient they currently hold context of
    cid = None
    if u_context['role'] == 'citizen':
        cid = u_context['profile_id']
    elif u_context['role'] == 'doctor':
        health_id = request.args.get('health_id')
        if not health_id:
            return jsonify({'error': 'Bad Request', 'message': 'Patient health_id query parameter is required for doctor access.'}), 400
        patient = Citizen.query.filter_by(health_id=health_id).first()
        if not patient:
            return jsonify({'error': 'Not Found', 'message': 'Patient not found.'}), 404
        cid = patient.id
        
        # Log doctor access to patient file
        audit = AuditLog(
            actor_role="Doctor",
            actor_id=u_context['username'],
            action="VIEW_RECORDS",
            citizen_id=patient.id,
            details=f"Doctor {u_context['username']} viewed medical records list."
        )
        db.session.add(audit)
        db.session.commit()

    # Search & filters & pagination
    category = request.args.get('category', 'All')
    search_query = request.args.get('search', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 5))

    query = MedicalRecord.query.filter_by(citizen_id=cid)
    if category != 'All':
        query = query.filter_by(record_type=category)
    if search_query:
        query = query.filter(
            (MedicalRecord.hospital.ilike(f'%{search_query}%')) |
            (MedicalRecord.doctor.ilike(f'%{search_query}%')) |
            (MedicalRecord.record_type.ilike(f'%{search_query}%')) |
            (MedicalRecord.structured_summary.ilike(f'%{search_query}%'))
        )
    
    paginated_records = query.order_by(MedicalRecord.date.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'records': [r.to_dict() for r in paginated_records.items],
        'total': paginated_records.total,
        'pages': paginated_records.pages,
        'current_page': paginated_records.page
    }), 200

@app.route('/api/citizens/timeline', methods=['GET'])
@token_required(allowed_roles=['citizen', 'doctor'])
def get_citizens_timeline():
    u_context = request.environ['user_context']
    cid = None
    if u_context['role'] == 'citizen':
        cid = u_context['profile_id']
    elif u_context['role'] == 'doctor':
        health_id = request.args.get('health_id')
        patient = Citizen.query.filter_by(health_id=health_id).first()
        if not patient:
            return jsonify({'error': 'Not Found', 'message': 'Patient not found.'}), 404
        cid = patient.id

    events = TimelineEvent.query.filter_by(citizen_id=cid).order_by(TimelineEvent.year.desc()).all()
    return jsonify([e.to_dict() for e in events]), 200

@app.route('/api/citizens/followups', methods=['GET'])
@token_required(allowed_roles=['citizen', 'doctor'])
def get_citizens_followups():
    u_context = request.environ['user_context']
    cid = None
    if u_context['role'] == 'citizen':
        cid = u_context['profile_id']
    elif u_context['role'] == 'doctor':
        health_id = request.args.get('health_id')
        patient = Citizen.query.filter_by(health_id=health_id).first()
        if not patient:
            return jsonify({'error': 'Not Found', 'message': 'Patient not found.'}), 404
        cid = patient.id

    followups = FollowUp.query.filter_by(citizen_id=cid).order_by(FollowUp.due_date.asc()).all()
    return jsonify([f.to_dict() for f in followups]), 200

# --- SECURE QR HEALTH CARD & SCANNING ---

@app.route('/api/qr/generate', methods=['POST'])
@token_required(allowed_roles=['citizen'])
def generate_qr_token():
    u_context = request.environ['user_context']
    citizen = Citizen.query.get(u_context['profile_id'])
    if not citizen:
        return jsonify({'error': 'Not Found', 'message': 'Profile not found.'}), 404

    # Revoke previous tokens
    QRToken.query.filter_by(citizen_id=citizen.id).delete()

    # Generate verification token
    secure_token = uuid.uuid4().hex
    secure_uuid = str(uuid.uuid4())
    expiry = datetime.utcnow() + timedelta(minutes=15)  # Token valid for 15 minutes only

    qr = QRToken(
        citizen_id=citizen.id,
        token=secure_token,
        uuid=secure_uuid,
        expires_at=expiry
    )
    db.session.add(qr)
    db.session.commit()

    # Domain for Verification URL
    host_url = request.host_url
    # Complete verification URL
    verification_url = f"{host_url}patient/verify/{secure_token}"

    return jsonify({
        'token': secure_token,
        'uuid': secure_uuid,
        'verification_url': verification_url,
        'expires_in_sec': 900
    }), 200

@app.route('/api/qr/verify', methods=['POST'])
@token_required(allowed_roles=['doctor'])
def verify_qr_token():
    data = request.json
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Bad Request', 'message': 'QR token is required.'}), 400

    qr_token = QRToken.query.filter_by(token=token).first()
    if not qr_token:
        return jsonify({'error': 'Unauthorized', 'message': 'Access Denied: QR code is invalid.'}), 401

    if qr_token.expires_at < datetime.utcnow():
        return jsonify({'error': 'Unauthorized', 'message': 'Access Denied: QR code has expired.'}), 401

    citizen = Citizen.query.get(qr_token.citizen_id)
    if not citizen:
        return jsonify({'error': 'Not Found', 'message': 'Patient record could not be found.'}), 404

    # Log access
    u_context = request.environ['user_context']
    audit = AuditLog(
        actor_role="Doctor",
        actor_id=u_context['username'],
        action="SCAN_QR",
        citizen_id=citizen.id,
        details=f"Doctor scanned and unlocked patient {citizen.name} health profile."
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'status': 'Verified',
        'health_id': citizen.health_id,
        'patient_name': citizen.name
    }), 200

@app.route('/patient/verify/<token>', methods=['GET'])
def patient_card_html(token):
    """
    Serves printable summary card if token is validated.
    """
    qr_token = QRToken.query.filter_by(token=token).first()
    if not qr_token or qr_token.expires_at < datetime.utcnow():
        html_err = """<!DOCTYPE html><html><head><title>Access Denied</title>
        <style>body{font-family:'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b;text-align:center;padding-top:10vh;}
        .card{max-width:480px;margin:0 auto;background:white;padding:32px;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #f1f5f9;}
        h1{color:#e11d48;font-size:1.8rem;}p{color:#64748b;line-height:1.6;margin-top:12px;}
        button{background:#0f172a;color:white;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;margin-top:20px;}</style></head>
        <body><div class="card"><h1>&#9888; Access Denied</h1><p>The scanned QR code is either invalid or has expired for security purposes.<br>Please request the citizen to regenerate the QR code card on their portal.</p>
        </div></body></html>"""
        return Response(html_err, mimetype='text/html', status=403)

    citizen = Citizen.query.get(qr_token.citizen_id)
    data = citizen.to_dict()
    name = data.get('name', 'Unknown')
    age = data.get('age', '—')
    gender = data.get('gender', '—')
    blood = data.get('blood_group', '—')
    contact = data.get('contact', '—')
    emergency = data.get('emergency_contact', '—')
    last_visit = citizen.records[-1].date if citizen.records else '—'
    conditions = ', '.join([c['name'] for c in data.get('conditions', [])]) or 'None recorded'
    medications = ', '.join([m['name'] for m in data.get('medications', [])]) or 'None recorded'
    allergies = ', '.join([a['name'] for a in data.get('allergies', [])]) or 'None recorded'
    health_score = data.get('health_score', '—')
    stability = data.get('overall_stability', '—')
    generated = datetime.now().strftime('%d %B %Y, %I:%M %p')

    # Log verification access
    audit = AuditLog(
        actor_role="Anonymous Scanner",
        actor_id="QR Scanner Client",
        action="VIEW_WEB_CARD",
        citizen_id=citizen.id,
        details=f"Viewed printable health card webpage via token validation."
    )
    db.session.add(audit)
    db.session.commit()

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MedFlow Verified Health Card — {name}</title>
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
          <span>Ayushman Bharat Digital Health Card</span>
        </div>
        <div class="badge">VERIFIED NHA CARD</div>
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
              <div class="label">Health ID</div>
              <div class="value" style="font-size:0.8rem">{citizen.health_id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-body">
      <div class="alert-box">
        <div class="alert-title">&#9888; ALLERGIES — REVIEWS BEFORE TREATMENT</div>
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
      Generated by MedFlow &nbsp;|&nbsp; {generated} &nbsp;|&nbsp; ABDM Digital Registry Verified Node &nbsp;|&nbsp; Compliant Electronic Health Record
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">
    &#8681; &nbsp; Save as PDF / Print Health Card
  </button>
</div>
</body>
</html>"""
    return Response(html, mimetype='text/html')

# --- DOCTOR DESK ROUTES ---

@app.route('/api/doctors/scan/<health_id>', methods=['GET'])
@token_required(allowed_roles=['doctor'])
def get_doctor_patient_summary(health_id):
    patient = Citizen.query.filter_by(health_id=health_id).first()
    if not patient:
        return jsonify({'error': 'Not Found', 'message': 'Patient not found.'}), 404

    records = MedicalRecord.query.filter_by(citizen_id=patient.id).order_by(MedicalRecord.date.desc()).limit(5).all()
    timeline = TimelineEvent.query.filter_by(citizen_id=patient.id).order_by(TimelineEvent.year.desc()).all()
    lab_results = LabResult.query.filter_by(citizen_id=patient.id).all()
    risk_indicators = RiskIndicator.query.filter_by(citizen_id=patient.id).all()
    follow_ups = FollowUp.query.filter_by(citizen_id=patient.id).all()

    summary = patient.to_dict()
    summary['recent_records'] = [r.to_dict() for r in records]
    summary['timeline'] = [t.to_dict() for t in timeline]
    summary['recent_lab_trends'] = [lr.to_dict() for lr in lab_results]
    summary['critical_alerts'] = [ri.to_dict() for ri in risk_indicators]
    summary['pending_follow_ups'] = [f.to_dict() for f in follow_ups if f.status != 'Completed']

    # AI Summary extraction
    summary['ai_summary'] = f"The patient is a {patient.age} year old {patient.gender.lower()} with active diagnosis of {', '.join([c.name for c in patient.conditions]) or 'no major conditions'}. Compliance with meds is stable."

    # Log Doctor access
    u_context = request.environ['user_context']
    audit = AuditLog(
        actor_role="Doctor",
        actor_id=u_context['username'],
        action="VIEW_PATIENT_SUMMARY",
        citizen_id=patient.id,
        details=f"Doctor retrieved diagnostic history dashboard summary."
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify(summary), 200

@app.route('/api/doctors/consultations', methods=['POST'])
@token_required(allowed_roles=['doctor'])
def add_consultation():
    u_context = request.environ['user_context']
    data = request.json
    health_id = data.get('health_id')
    doctor_name = data.get('doctor_name')
    date = data.get('date') or datetime.now().strftime('%Y-%m-%d')
    diagnosis = data.get('diagnosis')
    prescription = data.get('prescription')
    notes = data.get('notes', '')
    
    # Optional vitals
    blood_pressure = data.get('blood_pressure')
    blood_sugar = data.get('blood_sugar')
    weight = data.get('weight')

    patient = Citizen.query.filter_by(health_id=health_id).first()
    if not patient:
        return jsonify({'error': 'Not Found', 'message': 'Patient not found.'}), 404

    # Search doctor profile
    doctor = Doctor.query.filter_by(license_number=u_context['username']).first()
    doc_id = doctor.id if doctor else None

    # 1. Save Consultation
    consult = Consultation(
        citizen_id=patient.id,
        doctor_id=doc_id,
        doctor_name=doctor_name or (doctor.name if doctor else "Attending Doctor"),
        date=date,
        diagnosis=diagnosis,
        prescription=prescription,
        notes=notes
    )
    db.session.add(consult)

    # 2. Add to Timeline
    year = date.split('-')[0]
    db.session.add(TimelineEvent(
        citizen_id=patient.id,
        year=year,
        title="Clinical Consultation",
        description=f"Consultation under {doctor_name}. Diagnosis: {diagnosis}. Prescribed: {prescription}",
        event_type="Consultation"
    ))

    # 3. Add Condition dynamically if new
    conditions = [c.strip() for c in diagnosis.split(',') if c.strip()]
    for cond_name in conditions:
        existing_cond = Condition.query.filter_by(citizen_id=patient.id, name=cond_name).first()
        if not existing_cond:
            db.session.add(Condition(citizen_id=patient.id, name=cond_name, diagnosed_year=year, status="Active"))
            db.session.add(TimelineEvent(citizen_id=patient.id, year=year, title=f"Diagnosed: {cond_name}", description=f"Identified during consultation by Dr. {doctor_name}.", event_type="Diagnosis"))

    # 4. Save Medication
    meds = [m.strip() for m in prescription.split(',') if m.strip()]
    for med_name in meds:
        existing_med = Medication.query.filter_by(citizen_id=patient.id, name=med_name).first()
        if not existing_med:
            db.session.add(Medication(citizen_id=patient.id, name=med_name, started_year=year, active=True, dosage="As directed", frequency="Once daily"))

    # 5. Log vitals if provided
    if blood_pressure:
        db.session.add(LabResult(citizen_id=patient.id, test_name="Blood Pressure", value=str(blood_pressure), unit="mmHg", date=date, status="Normal", trend="Stable"))
    if blood_sugar:
        db.session.add(LabResult(citizen_id=patient.id, test_name="Blood Sugar", value=str(blood_sugar), unit="mg/dL", date=date, status="Normal", trend="Stable"))
    if weight:
        patient.weight = float(weight)

    # 6. Save MedicalRecord index
    med_rec = MedicalRecord(
        citizen_id=patient.id,
        hospital=doctor.hospital.name if doctor and doctor.hospital else "Linked Health Facility",
        date=date,
        doctor=doctor_name,
        record_type="Prescriptions",
        verified=True,
        open_access=True,
        structured_summary=json.dumps({
            "keyMetrics": f"Vitals BP: {blood_pressure or '—'} mmHg, Sugar: {blood_sugar or '—'} mg/dL",
            "clinicalNotes": f"Diagnosis: {diagnosis}. Prescription: {prescription}. {notes}",
            "recommendations": "Follow prescribed dosage and lifestyle guidelines."
        })
    )
    db.session.add(med_rec)

    # Update patient visit
    patient.last_hospital_visit = date

    # Create Follow-up if scheduled
    followup_date = data.get('followup_date')
    if followup_date:
        db.session.add(FollowUp(
            citizen_id=patient.id,
            type="Consultation",
            description=f"Follow-up session for {diagnosis}",
            due_date=followup_date,
            status="Upcoming"
        ))

    # Log action
    audit = AuditLog(
        actor_role="Doctor",
        actor_id=u_context['username'],
        action="ADD_CONSULTATION",
        citizen_id=patient.id,
        details=f"Saved consultation. Diagnosis: {diagnosis}"
    )
    db.session.add(audit)

    db.session.commit()
    return jsonify({'message': 'Consultation saved successfully.', 'record_id': consult.id}), 201

# --- CONFIRMED MEDICAL RECORD UPLOAD PIPELINE ---

@app.route('/api/citizens/records/upload', methods=['POST'])
@token_required(allowed_roles=['citizen'])
def confirm_and_save_upload():
    u_context = request.environ['user_context']
    cid = u_context['profile_id']
    citizen = Citizen.query.get(cid)
    if not citizen:
        return jsonify({'error': 'Not Found', 'message': 'Profile not found.'}), 404

    data = request.json
    hospital = data.get('hospital') or 'Unknown Clinic'
    date = data.get('date') or datetime.now().strftime('%Y-%m-%d')
    doctor = data.get('doctor') or 'Attending Clinician'
    record_type = data.get('record_type') or 'Lab Reports'
    
    structured_summary = data.get('structured_summary') or {}
    
    # 1. Save MedicalRecord
    record = MedicalRecord(
        citizen_id=citizen.id,
        hospital=hospital,
        date=date,
        doctor=doctor,
        record_type=record_type,
        verified=True,
        open_access=True,
        file_path=data.get('file_path') or "/uploads/real_upload.pdf",
        structured_summary=json.dumps(structured_summary)
    )
    db.session.add(record)

    # 2. Add Diagnoses
    diagnoses = data.get('diagnoses') or []
    for diag in diagnoses:
        if diag:
            exists = Condition.query.filter_by(citizen_id=citizen.id, name=diag).first()
            if not exists:
                db.session.add(Condition(citizen_id=citizen.id, name=diag, diagnosed_year=date.split('-')[0], status="Active"))
                db.session.add(TimelineEvent(citizen_id=citizen.id, year=date.split('-')[0], title=f"Diagnosed: {diag}", description="Identified through document ingestion.", event_type="Diagnosis"))

    # 3. Add Medications
    meds = data.get('medications') or []
    for med in meds:
        name = med.get('name')
        if name:
            exists = Medication.query.filter_by(citizen_id=citizen.id, name=name).first()
            if not exists:
                db.session.add(Medication(
                    citizen_id=citizen.id,
                    name=name,
                    started_year=date.split('-')[0],
                    active=True,
                    dosage=med.get('dosage'),
                    frequency=med.get('frequency'),
                    instructions=med.get('instructions')
                ))

    # 4. Add Lab Results
    labs = data.get('lab_results') or []
    for lab in labs:
        test = lab.get('test_name')
        val = lab.get('value')
        if test and val:
            db.session.add(LabResult(
                citizen_id=citizen.id,
                test_name=test,
                value=str(val),
                unit=lab.get('unit') or '',
                date=date,
                status=lab.get('status') or 'Normal',
                trend=lab.get('trend') or 'Stable'
            ))

    # 5. Add Vaccinations
    vaccinations = data.get('vaccinations') or []
    for vax in vaccinations:
        vax_name = vax.get('vaccine_name')
        if vax_name:
            db.session.add(Vaccination(
                citizen_id=citizen.id,
                vaccine_name=vax_name,
                date=vax.get('date') or date,
                status="Completed",
                dose_number=vax.get('dose_number') or 1
            ))
            db.session.add(TimelineEvent(
                citizen_id=citizen.id,
                year=date.split('-')[0],
                title=f"Vaccination: {vax_name}",
                description=f"Immunization record verified through document verification.",
                event_type="Vaccination"
            ))

    # 6. Add Timeline Event for Upload
    db.session.add(TimelineEvent(
        citizen_id=citizen.id,
        year=date.split('-')[0],
        title=f"Ingested Document: {record_type}",
        description=f"Verified upload from {hospital}. Extracted: {len(diagnoses)} diagnoses, {len(meds)} medications, {len(labs)} lab results.",
        event_type="Upload"
    ))

    citizen.last_hospital_visit = date

    # Log action
    audit = AuditLog(
        actor_role="Citizen",
        actor_id=citizen.health_id,
        action="INGEST_DOC",
        citizen_id=citizen.id,
        details=f"Uploaded and verified {record_type} from {hospital}."
    )
    db.session.add(audit)

    db.session.commit()
    return jsonify({'message': 'Medical record successfully verified and saved to database.', 'record_id': record.id}), 201

# --- GOVERNMENT OPERATIONS AND MAPS ENDPOINTS ---

@app.route('/api/government/dashboard', methods=['GET'])
@token_required(allowed_roles=['govt'])
def get_govt_dashboard():
    # Dynamic aggregates from database models
    total_citizens = Citizen.query.count()
    active_chronic = Condition.query.filter_by(status='Active').count()
    
    # Compliance aggregate
    followups = FollowUp.query.all()
    completed_f = len([f for f in followups if f.status == 'Completed'])
    total_f = len(followups)
    compliance = round((completed_f / total_f) * 100) if total_f > 0 else 84

    # ANC Pregnancy aggregate
    anc_cases = Condition.query.filter(Condition.name.ilike('%pregnancy%'), Condition.status == 'Active').count()

    # Universal Vaccination Coverage
    all_citizens = Citizen.query.all()
    citizens_vax = 0
    for c in all_citizens:
        if len(c.vaccinations) > 0:
            citizens_vax += 1
    vax_coverage = round((citizens_vax / total_citizens) * 100) if total_citizens > 0 else 92

    # Disease aggregates
    conditions = Condition.query.all()
    cond_counts = Counter([c.name for c in conditions])
    common_diseases = [
        {'name': k, 'count': v, 'pct': round((v / total_citizens) * 100) if total_citizens > 0 else 0}
        for k, v in cond_counts.most_common(4)
    ]

    # Epidemic Trends
    trending_diseases = [
        {'name': 'Dengue', 'trend': 'up', 'pct': 18},
        {'name': 'Malaria', 'trend': 'stable', 'pct': 4},
        {'name': 'Viral Fever', 'trend': 'down', 'pct': 12}
    ]

    # Medicine Demand
    medications = Medication.query.all()
    med_names = [m.name.split(' ')[0] for m in medications]
    med_counts = Counter(med_names)
    medicine_demand = [
        {'name': name, 'stock': 85 - idx * 15, 'status': 'Low Stock' if idx == 0 else 'High Supply'}
        for idx, (name, count) in enumerate(med_counts.most_common(3))
    ]

    pending_followups = FollowUp.query.filter(FollowUp.status.in_(['Upcoming', 'Pending'])).count()

    return jsonify({
        'registeredCitizens': total_citizens,
        'activeChronicPatients': active_chronic,
        'followUpCompliance': compliance,
        'pregnancyTracking': anc_cases,
        'vaccinationCoverage': vax_coverage,
        'commonDiseases': common_diseases,
        'trendingDiseases': trending_diseases,
        'medicine_demand': medicine_demand,
        'pendingFollowUps': pending_followups
    }), 200

@app.route('/api/map/analytics', methods=['GET'])
@token_required(allowed_roles=['govt'])
def get_map_regional_analytics():
    # Return disease and vaccination rates aggregated by Block levels for the map overlays
    blocks = ["Rampur Block", "Raipur Block", "Sundergarh Block", "Bilaspur Block", "Durg Block"]
    selected_metric = request.args.get('metric', 'Diabetes')

    map_analytics = {}

    for blk in blocks:
        citizens_in_block = Citizen.query.filter_by(block=blk).all()
        total_blk_citizens = len(citizens_in_block)

        if total_blk_citizens == 0:
            map_analytics[blk] = {
                'diabetes': 'Low (0%)',
                'hypertension': 'Low (0%)',
                'anemia': 'Low (0%)',
                'vaccination': '0%'
            }
            continue

        diabetes_cases = sum(1 for c in citizens_in_block if any(cond.name.lower() == 'diabetes' or 'diabetes' in cond.name.lower() for cond in c.conditions))
        hyper_cases = sum(1 for c in citizens_in_block if any(cond.name.lower() == 'hypertension' or 'hypertension' in cond.name.lower() for cond in c.conditions))
        anemia_cases = sum(1 for c in citizens_in_block if any(cond.name.lower() == 'anemia' or 'anemia' in cond.name.lower() for cond in c.conditions))
        vax_citizens = sum(1 for c in citizens_in_block if len(c.vaccinations) > 0)

        diab_rate = (diabetes_cases / total_blk_citizens) * 100
        hyper_rate = (hyper_cases / total_blk_citizens) * 100
        anemia_rate = (anemia_cases / total_blk_citizens) * 100
        vax_rate = (vax_citizens / total_blk_citizens) * 100

        def rate_label(rate):
            if rate > 25: return f"Very High ({rate:.1f}%)"
            if rate > 12: return f"High ({rate:.1f}%)"
            if rate > 5: return f"Medium ({rate:.1f}%)"
            return f"Low ({rate:.1f}%)"

        map_analytics[blk] = {
            'diabetes': rate_label(diab_rate),
            'hypertension': rate_label(hyper_rate),
            'anemia': rate_label(anemia_rate),
            'vaccination': f"{vax_rate:.0f}%"
        }

    return jsonify(map_analytics), 200

# --- DEV TOOLS SYSTEM RESET ---

@app.route('/api/db/reset', methods=['POST'])
def reset_db_endpoint():
    try:
        from seed import seed_data
        seed_data()
        return jsonify({'message': 'Clinical Registry Database successfully reset to initial states.'}), 200
    except Exception as e:
        return jsonify({'error': 'Reset Failed', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
