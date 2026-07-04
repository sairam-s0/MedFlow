from app import app, db
from models import Citizen, Condition, Medication, Allergy, MedicalRecord, TimelineEvent, Consultation, LabResult, RiskIndicator, FollowUp
import json
import os

def seed_data():
    with app.app_context():
        # Clean up database if you want a fresh seed, since schema changed.
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
        print("Database seeded with base Citizen profiles.")

if __name__ == '__main__':
    seed_data()
