from app import app, db
from models import Citizen, Condition, Medication, Allergy, MedicalRecord, TimelineEvent, Consultation, LabResult, RiskIndicator, FollowUp
import json

def seed_data():
    with app.app_context():

        db.drop_all()
        db.create_all()

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

        db.session.add_all([
            Condition(citizen_id=c1.id, name="Type 2 Diabetes", diagnosed_year="2022", status="Active"),
            Condition(citizen_id=c1.id, name="Hypertension", diagnosed_year="2023", status="Active"),
            Medication(citizen_id=c1.id, name="Metformin 500mg", started_year="2022", active=True),
            Medication(citizen_id=c1.id, name="Amlodipine 5mg", started_year="2023", active=True),
            Allergy(citizen_id=c1.id, name="Penicillin", severity="High"),
            MedicalRecord(
                citizen_id=c1.id,
                hospital="Rampur Primary Health Centre",
                date="2025-01-15",
                doctor="Dr. Meera Sharma",
                record_type="Consultation",
                verified=True,
                open_access=True,
                file_path="/uploads/ramesh-2025-01-15.pdf",
                structured_summary=json.dumps({
                    "keyMetrics": "BP 138/86 mmHg, fasting glucose 128 mg/dL",
                    "clinicalNotes": "Diabetes and blood pressure reviewed. No acute symptoms reported.",
                    "recommendations": "Continue medicines, reduce sugar intake, repeat HbA1c in 3 months."
                })
            ),
            MedicalRecord(
                citizen_id=c1.id,
                hospital="District Diagnostic Lab",
                date="2024-11-20",
                doctor="Lab Officer",
                record_type="Lab Report",
                verified=True,
                open_access=True,
                file_path="/uploads/ramesh-2024-11-20.pdf",
                structured_summary=json.dumps({
                    "keyMetrics": "HbA1c 7.1%, LDL 112 mg/dL",
                    "clinicalNotes": "Moderate glycemic control with mildly elevated LDL.",
                    "recommendations": "Diet counselling and follow-up consultation advised."
                })
            ),
            TimelineEvent(
                citizen_id=c1.id,
                year="2022",
                title="Type 2 Diabetes Diagnosed",
                description="Started Metformin after elevated fasting glucose and HbA1c.",
                event_type="Diagnosis"
            ),
            TimelineEvent(
                citizen_id=c1.id,
                year="2024",
                title="Lab Report Reviewed",
                description="HbA1c recorded at 7.1%; diet and follow-up advised.",
                event_type="Lab Report"
            ),
            TimelineEvent(
                citizen_id=c1.id,
                year="2025",
                title="Doctor Consultation",
                description="Blood pressure and diabetes follow-up completed at Rampur PHC.",
                event_type="Consultation"
            ),
            LabResult(
                citizen_id=c1.id,
                test_name="HbA1c",
                value="7.1",
                unit="%",
                date="2024-11-20",
                status="Above Normal",
                trend="Stable"
            ),
            LabResult(
                citizen_id=c1.id,
                test_name="LDL Cholesterol",
                value="112",
                unit="mg/dL",
                date="2024-11-20",
                status="Above Normal",
                trend="Increasing"
            ),
            RiskIndicator(
                citizen_id=c1.id,
                indicator="Cardiometabolic risk",
                notes="Diabetes with hypertension; monitor BP, HbA1c, and lipids."
            ),
            FollowUp(
                citizen_id=c1.id,
                type="Lab Test",
                description="Repeat HbA1c and fasting glucose",
                due_date="2025-04-15",
                status="Upcoming"
            ),
            Consultation(
                citizen_id=c1.id,
                doctor_name="Dr. Meera Sharma",
                date="2025-01-15",
                diagnosis="Type 2 Diabetes, Hypertension",
                prescription="Metformin 500mg twice daily; Amlodipine 5mg once daily",
                notes="Lifestyle counselling provided."
            ),
            Condition(citizen_id=c2.id, name="Iron Deficiency Anemia", diagnosed_year="2024", status="Active"),
            Medication(citizen_id=c2.id, name="Ferrous Sulfate 100mg", started_year="2024", active=True),
            MedicalRecord(
                citizen_id=c2.id,
                hospital="Rampur Community Clinic",
                date="2025-02-10",
                doctor="Dr. Arjun Rao",
                record_type="Consultation",
                verified=True,
                open_access=True,
                file_path="/uploads/sita-2025-02-10.pdf",
                structured_summary=json.dumps({
                    "keyMetrics": "Hemoglobin 10.8 g/dL",
                    "clinicalNotes": "Mild anemia symptoms improving with iron therapy.",
                    "recommendations": "Continue iron tablets and repeat CBC in 8 weeks."
                })
            ),
            TimelineEvent(
                citizen_id=c2.id,
                year="2025",
                title="Anemia Follow-up",
                description="Hemoglobin improving; repeat CBC planned.",
                event_type="Consultation"
            ),
            LabResult(
                citizen_id=c2.id,
                test_name="Hemoglobin",
                value="10.8",
                unit="g/dL",
                date="2025-02-10",
                status="Low",
                trend="Improving"
            ),
            FollowUp(
                citizen_id=c2.id,
                type="Lab Test",
                description="Repeat CBC",
                due_date="2025-04-10",
                status="Upcoming"
            ),
            FollowUp(
                citizen_id=c2.id,
                type="Consultation",
                description="Nutrition counselling completed",
                due_date="2025-02-10",
                status="Completed"
            ),
        ])
        db.session.commit()
        print("Database seeded with small patient records and clinical timeline.")

if __name__ == '__main__':
    seed_data()
