from app import app, db
from models import Citizen, Condition, Medication, Allergy, MedicalRecord, TimelineEvent, Consultation
import json

def seed_data():
    with app.app_context():
        db.create_all()

        # Check if already seeded
        if Citizen.query.first():
            print("Database already seeded.")
            return

        print("Seeding database...")

        # Create Citizens
        c1 = Citizen(
            health_id="QR-12345-ABCD",
            name="Ramesh Kumar",
            age=45,
            gender="Male",
            blood_group="O+",
            contact="9876543210",
            emergency_contact="9876543211",
            last_hospital_visit="2025-01-15"
        )
        c2 = Citizen(
            health_id="QR-67890-EFGH",
            name="Sita Devi",
            age=32,
            gender="Female",
            blood_group="A+",
            contact="9876543212",
            emergency_contact="9876543213",
            last_hospital_visit="2025-02-10"
        )
        
        db.session.add(c1)
        db.session.add(c2)
        db.session.commit()

        # Create Conditions
        cond1 = Condition(citizen_id=c1.id, name="Diabetes Type 2", diagnosed_year="2021", status="Active")
        cond2 = Condition(citizen_id=c1.id, name="Hypertension", diagnosed_year="2018", status="Active")
        cond3 = Condition(citizen_id=c2.id, name="Anemia", diagnosed_year="2020", status="Resolved")
        db.session.add_all([cond1, cond2, cond3])

        # Create Medications
        med1 = Medication(citizen_id=c1.id, name="Metformin 500mg", started_year="2022", active=True)
        med2 = Medication(citizen_id=c1.id, name="Amlodipine 5mg", started_year="2018", active=True)
        db.session.add_all([med1, med2])

        # Create Allergies
        alg1 = Allergy(citizen_id=c1.id, name="Penicillin", severity="High")
        db.session.add(alg1)

        # Create Medical Records
        rec1 = MedicalRecord(
            citizen_id=c1.id,
            hospital="District Hospital",
            date="2025-01-15",
            doctor="Dr. Sharma",
            record_type="Lab Report",
            verified=True,
            open_access=True,
            file_path="/uploads/rec1.pdf",
            structured_summary=json.dumps({"HbA1c": "7.2%", "Fasting Blood Sugar": "140 mg/dL"})
        )
        rec2 = MedicalRecord(
            citizen_id=c2.id,
            hospital="PHC Village",
            date="2020-05-10",
            doctor="Dr. Verma",
            record_type="Prescription",
            verified=True,
            open_access=True,
            file_path="/uploads/rec2.pdf",
            structured_summary=json.dumps({"Diagnosis": "Iron deficiency anemia", "Prescribed": "Iron tablets"})
        )
        db.session.add_all([rec1, rec2])

        # Create Timeline Events
        te1 = TimelineEvent(citizen_id=c1.id, year="2018", title="Hypertension Diagnosed", description="Started on BP medication.", event_type="Diagnosis")
        te2 = TimelineEvent(citizen_id=c1.id, year="2021", title="Diabetes Diagnosed", description="Routine checkup showed elevated blood sugar.", event_type="Diagnosis")
        te3 = TimelineEvent(citizen_id=c1.id, year="2022", title="Metformin Started", description="Started on Metformin 500mg daily.", event_type="Medication")
        te4 = TimelineEvent(citizen_id=c1.id, year="2023", title="HbA1c Improved", description="Diet control and medication showing results.", event_type="Consultation")
        te5 = TimelineEvent(citizen_id=c1.id, year="2025", title="Annual Checkup", description="Lab reports uploaded.", event_type="Upload")
        
        db.session.add_all([te1, te2, te3, te4, te5])

        # Create Consultations
        cons1 = Consultation(
            citizen_id=c1.id,
            doctor_name="Dr. Sharma",
            date="2025-01-15",
            diagnosis="Routine diabetes checkup. Sugars slightly elevated.",
            prescription="Continue Metformin 500mg twice daily.",
            notes="Advised to reduce sugar intake and exercise daily."
        )
        db.session.add(cons1)

        db.session.commit()
        print("Database seeded successfully.")

if __name__ == '__main__':
    seed_data()
