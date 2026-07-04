from app import app, db
from models import Citizen, Condition, Medication, Allergy, MedicalRecord, TimelineEvent, Consultation, LabResult, RiskIndicator, FollowUp
import json
import os

def seed_data():
    with app.app_context():
        # Clean up database if you want a fresh seed, since schema changed.
        # db.drop_all()
        db.create_all()

        if Citizen.query.first():
            print("Database already seeded.")
            return

        print("Seeding database...")

        c1 = Citizen(
            health_id="QR-12345-ABCD",
            name="Ramesh Kumar",
            age=45,
            gender="Male",
            blood_group="O+",
            contact="9876543210",
            emergency_contact="9876543211",
            last_hospital_visit="2025-01-15",
            health_score=85,
            overall_stability="Good",
            family_history="Father had Type 2 Diabetes. Mother had Hypertension.",
            lifestyle_notes="Sedentary lifestyle. Smokes occasionally. Trying to reduce sugar intake."
        )
        c2 = Citizen(
            health_id="QR-67890-EFGH",
            name="Sita Devi",
            age=32,
            gender="Female",
            blood_group="A+",
            contact="9876543212",
            emergency_contact="9876543213",
            last_hospital_visit="2025-02-10",
            health_score=92,
            overall_stability="Excellent",
            family_history="No significant family history.",
            lifestyle_notes="Active lifestyle. Vegetarian."
        )
        
        db.session.add(c1)
        db.session.add(c2)
        db.session.commit()

        cond1 = Condition(citizen_id=c1.id, name="Diabetes Type 2", diagnosed_year="2021", status="Active")
        cond2 = Condition(citizen_id=c1.id, name="Hypertension", diagnosed_year="2018", status="Active")
        cond3 = Condition(citizen_id=c2.id, name="Anemia", diagnosed_year="2020", status="Resolved")
        db.session.add_all([cond1, cond2, cond3])

        med1 = Medication(citizen_id=c1.id, name="Metformin 500mg", started_year="2022", active=True)
        med2 = Medication(citizen_id=c1.id, name="Amlodipine 5mg", started_year="2018", active=True)
        db.session.add_all([med1, med2])

        alg1 = Allergy(citizen_id=c1.id, name="Penicillin", severity="High")
        alg2 = Allergy(citizen_id=c1.id, name="Dust Allergy", severity="Medium")
        db.session.add_all([alg1, alg2])

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
        db.session.add(rec1)

        te1 = TimelineEvent(citizen_id=c1.id, year="2018", title="Hypertension Diagnosed", description="Started on BP medication.", event_type="Diagnosis")
        te2 = TimelineEvent(citizen_id=c1.id, year="2021", title="Diabetes Diagnosed", description="Routine checkup showed elevated blood sugar.", event_type="Diagnosis")
        te3 = TimelineEvent(citizen_id=c1.id, year="2022", title="Metformin Started", description="Started on Metformin 500mg daily.", event_type="Medication")
        te4 = TimelineEvent(citizen_id=c1.id, year="2023", title="HbA1c Improved", description="Diet control and medication showing results.", event_type="Consultation")
        db.session.add_all([te1, te2, te3, te4])

        cons1 = Consultation(
            citizen_id=c1.id,
            doctor_name="Dr. Sharma",
            date="2025-01-15",
            diagnosis="Routine diabetes checkup. Sugars slightly elevated.",
            prescription="Continue Metformin 500mg twice daily.",
            notes="Advised to reduce sugar intake and exercise daily."
        )
        db.session.add(cons1)

        # --- SEEDING CDS ANALYTICS ---
        
        # Lab Results
        lr1 = LabResult(citizen_id=c1.id, test_name="HbA1c", value="7.2", unit="%", date="2025-01-15", status="Above Normal", trend="Improving")
        lr2 = LabResult(citizen_id=c1.id, test_name="Creatinine", value="1.0", unit="mg/dL", date="2025-01-15", status="Normal", trend="Stable")
        lr3 = LabResult(citizen_id=c1.id, test_name="Hemoglobin", value="13.5", unit="g/dL", date="2025-01-15", status="Low", trend="Stable")
        lr4 = LabResult(citizen_id=c1.id, test_name="Cholesterol", value="190", unit="mg/dL", date="2025-01-15", status="Normal", trend="Improving")
        db.session.add_all([lr1, lr2, lr3, lr4])

        # Risk Indicators
        ri1 = RiskIndicator(citizen_id=c1.id, indicator="Persistent High Blood Sugar", notes="HbA1c > 7.0 for the last 3 visits.")
        ri2 = RiskIndicator(citizen_id=c1.id, indicator="Kidney Monitoring Required", notes="Diabetic for 4 years, regular creatinine checks needed.")
        db.session.add_all([ri1, ri2])

        # Follow-Ups
        fu1 = FollowUp(citizen_id=c1.id, type="Consultation", description="Upcoming Follow-up with Dr. Sharma", due_date="2025-04-15", status="Upcoming")
        fu2 = FollowUp(citizen_id=c1.id, type="Lab Test", description="Pending Laboratory Tests (Lipid Profile)", due_date="2025-04-10", status="Pending")
        fu3 = FollowUp(citizen_id=c1.id, type="Consultation", description="Missed Cardiology Follow-up", due_date="2024-12-01", status="Missed")
        fu4 = FollowUp(citizen_id=c1.id, type="Medication", description="Medication Renewal Due (Metformin)", due_date="2025-03-01", status="Upcoming")
        db.session.add_all([fu1, fu2, fu3, fu4])

        db.session.commit()
        print("Database seeded successfully with CDS Analytics data.")

if __name__ == '__main__':
    seed_data()
