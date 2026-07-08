from app import app, db, hash_password
from models import User, Citizen, Doctor, Hospital, Condition, Medication, Allergy, MedicalRecord, TimelineEvent, Consultation, LabResult, RiskIndicator, FollowUp, Vaccination, Appointment, District, Region
import json
import random
from datetime import datetime, timedelta

def seed_data():
    with app.app_context():
        print("Clearing database tables...")
        # Order matters due to foreign key constraints
        db.session.query(User).delete()
        db.session.query(Condition).delete()
        db.session.query(Medication).delete()
        db.session.query(Allergy).delete()
        db.session.query(MedicalRecord).delete()
        db.session.query(TimelineEvent).delete()
        db.session.query(Consultation).delete()
        db.session.query(LabResult).delete()
        db.session.query(RiskIndicator).delete()
        db.session.query(FollowUp).delete()
        db.session.query(Vaccination).delete()
        db.session.query(Appointment).delete()
        db.session.query(Doctor).delete()
        db.session.query(Hospital).delete()
        db.session.query(Region).delete()
        db.session.query(District).delete()
        db.session.commit()

        print("Seeding geographic regions...")
        dist = District(name="Delhi NCR", state="Delhi")
        db.session.add(dist)
        db.session.commit()

        blocks = ["Rampur Block", "Raipur Block", "Sundergarh Block", "Bilaspur Block", "Durg Block"]
        phcs = ["Rampur PHC", "Raipur PHC", "Sundergarh PHC", "Bilaspur Clinic", "Durg Community PHC"]
        villages = ["Village A", "Village B", "Village C", "Village D", "Village E"]

        for b_name in blocks:
            b_reg = Region(name=b_name, type="Block", district_id=dist.id)
            db.session.add(b_reg)
        db.session.commit()

        print("Seeding hospitals and doctors...")
        hospitals = []
        for p_name in phcs:
            h = Hospital(name=p_name, district="Delhi NCR", state="Delhi")
            db.session.add(h)
            hospitals.append(h)
        db.session.commit()

        # Seed Doctors
        docs_data = [
            ("MCI-98472-A", "Dr. Meera Sharma", "General Medicine", hospitals[0].id),
            ("MCI-10294-B", "Dr. Arjun Rao", "Pediatrics", hospitals[1].id),
            ("MCI-58291-C", "Dr. Anita Goel", "Cardiology", hospitals[2].id)
        ]
        
        doctors = []
        for lic, name, spec, hosp_id in docs_data:
            doc = Doctor(license_number=lic, name=name, specialty=spec, hospital_id=hosp_id)
            db.session.add(doc)
            doctors.append(doc)
            db.session.commit()

            # Create User login for Doctor
            hashed, salt = hash_password("password123")
            d_user = User(
                username=lic,
                password_hash=hashed,
                salt=salt,
                role="doctor",
                doctor_id=doc.id
            )
            db.session.add(d_user)
        db.session.commit()

        # Seed Govt official user
        hashed, salt = hash_password("password123")
        g_user = User(
            username="GOV-IND-4820",
            password_hash=hashed,
            salt=salt,
            role="govt"
        )
        db.session.add(g_user)
        db.session.commit()

        print("Generating 52 dynamic citizen profiles...")
        first_names = [
            "Aarav", "Neha", "Vikram", "Sanjay", "Sunita", "Rajesh", "Priyanka", "Amit", "Divya", "Santosh",
            "Ananya", "Rohan", "Meera", "Karan", "Kavita", "Deepak", "Jyoti", "Rahul", "Pooja", "Vijay",
            "Shalini", "Arun", "Aditi", "Harish", "Ritu", "Manish", "Swati", "Suresh", "Komal", "Abhishek",
            "Geeta", "Anil", "Preeti", "Sandeep", "Kiran", "Ajay", "Anita", "Ramesh", "Sita", "Yash",
            "Nisha", "Gaurav", "Simran", "Varun", "Priya", "Vivek", "Kriti", "Manoj", "Kiran", "Tarun",
            "Rekha", "Dinesh"
        ]
        last_names = [
            "Sharma", "Patel", "Gupta", "Verma", "Das", "Roy", "Krishnan", "Mishra", "Reddy", "Nair",
            "Sen", "Joshi", "Bose", "Choudhury", "Mehta", "Singh", "Yadav", "Kumar", "Pandey", "Iyer"
        ]
        genders = ["Male", "Female"]
        blood_groups = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-"]
        diseases = ["Type 2 Diabetes", "Hypertension", "Iron Deficiency Anemia", "Asthma", "High Cholesterol"]
        meds_dict = {
            "Type 2 Diabetes": [("Metformin 500mg", "Once daily"), ("Glimepiride 2mg", "Once daily before breakfast")],
            "Hypertension": [("Amlodipine 5mg", "Once daily"), ("Telmisartan 40mg", "Once daily in the morning")],
            "Iron Deficiency Anemia": [("Ferrous Sulfate 100mg", "Twice daily with meals")],
            "Asthma": [("Salbutamol Inhaler 100mcg", "As needed for shortness of breath")],
            "High Cholesterol": [("Atorvastatin 10mg", "Once daily at night")]
        }

        # Fixed target citizens for manual testing
        target_citizens = [
            ("Aarav Sharma", 45, "Male", "O+", "9876543210", "91-4829-1029-4821"),
            ("Sita Devi", 32, "Female", "A+", "9876543212", "91-1029-4829-1022")
        ]

        citizens = []
        for i in range(52):
            if i < len(target_citizens):
                name, age, gender, blood, phone, h_id = target_citizens[i]
            else:
                gender = random.choice(genders)
                # Ensure we have some pregnancy cases for female patients
                name = random.choice(first_names) + " " + random.choice(last_names)
                age = random.randint(18, 70)
                blood = random.choice(blood_groups)
                phone = f"98765{i:05d}"
                # Generate unique ABHA ID
                parts = [str(random.randint(10, 99)) for _ in range(4)]
                h_id = f"{parts[0]}-{parts[1]}-{parts[2]}-{parts[3]}"

            dob_year = datetime.now().year - age
            dob = f"{dob_year:04d}-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            
            # Select regional grouping
            block = blocks[i % len(blocks)]
            phc = phcs[i % len(phcs)]
            village = f"Village {random.randint(1, 4)}"

            height = random.randint(150, 185)
            weight = random.randint(50, 95)
            health_score = random.randint(65, 95)
            stability = "Excellent" if health_score >= 90 else ("Good" if health_score >= 80 else "Stable")

            c = Citizen(
                health_id=h_id,
                name=name,
                age=age,
                gender=gender,
                dob=dob,
                blood_group=blood,
                height=height,
                weight=weight,
                contact=phone,
                address=f"House No. {10 + i}, {village}, {block}",
                district="Delhi NCR",
                block=block,
                phc=phc,
                village=village,
                state="Delhi",
                emergency_contact=f"9876599{i:03d}",
                health_score=health_score,
                overall_stability=stability,
                family_history="Father had Diabetes." if i % 3 == 0 else "None.",
                lifestyle_notes="Performs regular physical activity." if i % 2 == 0 else "Sedentary lifestyle."
            )
            db.session.add(c)
            db.session.commit()
            citizens.append(c)

            # Create login User
            hashed, salt = hash_password("password123")
            u = User(
                username=h_id,
                password_hash=hashed,
                salt=salt,
                role="citizen",
                citizen_id=c.id
            )
            db.session.add(u)
            db.session.commit()

            # Generate medical records history for each citizen
            # 1. Base Timeline activation
            db.session.add(TimelineEvent(
                citizen_id=c.id,
                year=str(dob_year + 18),
                title="Universal Health Identity Issued",
                description="Profile registered under ABDM Sandbox protocols.",
                event_type="Registry"
            ))

            # 2. Add Chronic Condition / Pregnancy / Anemia
            has_disease = False
            selected_disease = None
            if i % 2 == 0:
                selected_disease = diseases[i % len(diseases)]
                # If male, do not assign pregnancy. Replace with diabetes/hypertension
                if selected_disease == "High Cholesterol" and gender == "Female" and age < 35:
                    selected_disease = "Pregnancy"
                elif selected_disease == "High Cholesterol" and age > 50:
                    selected_disease = "Hypertension"
                
                # Check for pregnancy assignment rules
                if selected_disease == "Pregnancy" and gender == "Male":
                    selected_disease = "Type 2 Diabetes"

                diag_year = str(datetime.now().year - random.randint(1, 3))
                db.session.add(Condition(
                    citizen_id=c.id,
                    name=selected_disease,
                    diagnosed_year=diag_year,
                    status="Active"
                ))
                db.session.add(TimelineEvent(
                    citizen_id=c.id,
                    year=diag_year,
                    title=f"Diagnosed with {selected_disease}",
                    description=f"Diagnosed at regional clinic. Status: Active.",
                    event_type="Diagnosis"
                ))
                has_disease = True

                # Link medications
                meds = meds_dict.get(selected_disease, [])
                if selected_disease == "Pregnancy":
                    meds = [("Iron Folic Acid", "Once daily at bedtime"), ("Calcium Carbonate", "Once daily after meals")]
                for m_name, freq in meds:
                    db.session.add(Medication(
                        citizen_id=c.id,
                        name=m_name,
                        started_year=diag_year,
                        active=True,
                        dosage="Standard",
                        frequency=freq,
                        instructions="Take with water."
                    ))

            # 3. Add Immunization
            db.session.add(Vaccination(
                citizen_id=c.id,
                vaccine_name="COVISHIELD",
                date=f"{datetime.now().year - 2}-05-10",
                status="Completed",
                dose_number=1
            ))
            db.session.add(Vaccination(
                citizen_id=c.id,
                vaccine_name="COVISHIELD",
                date=f"{datetime.now().year - 2}-08-12",
                status="Completed",
                dose_number=2
            ))
            db.session.add(TimelineEvent(
                citizen_id=c.id,
                year=str(datetime.now().year - 2),
                title="COVID-19 Vaccination Completed",
                description="Double dose immunization verified under COWIN registry.",
                event_type="Vaccination"
            ))

            # 4. Add Consultation Medical Record
            doc = random.choice(doctors)
            hosp_name = doc.hospital.name if doc.hospital else "Delhi Health Centre"
            consult_date = (datetime.now() - timedelta(days=random.randint(10, 100))).strftime('%Y-%m-%d')
            
            db.session.add(Consultation(
                citizen_id=c.id,
                doctor_id=doc.id,
                doctor_name=doc.name,
                date=consult_date,
                diagnosis=selected_disease or "Routine Check-up",
                prescription="Prescribed wellness lifestyle measures." if not selected_disease else meds[0][0],
                notes="Patient reports feeling healthy. Adherence verified."
            ))
            db.session.add(TimelineEvent(
                citizen_id=c.id,
                year=consult_date.split('-')[0],
                title="Doctor Consultation",
                description=f"Consulted {doc.name} at {hosp_name}.",
                event_type="Consultation"
            ))

            # Create Medical Record object for consultation
            db.session.add(MedicalRecord(
                citizen_id=c.id,
                hospital=hosp_name,
                date=consult_date,
                doctor=doc.name,
                record_type="Prescriptions",
                verified=True,
                open_access=True,
                file_path=f"/uploads/prescription_{c.id}.pdf",
                structured_summary=json.dumps({
                    "keyMetrics": f"Vitals normal. BP: {random.randint(110, 130)}/{random.randint(70, 85)} mmHg",
                    "clinicalNotes": f"Follow-up for general health. Stability status: {stability}.",
                    "recommendations": "Continue daily morning walk and clean diet."
                })
            ))

            # 5. Add Lab Results
            db.session.add(LabResult(
                citizen_id=c.id,
                test_name="Fasting Blood Glucose",
                value=str(random.randint(85, 145)),
                unit="mg/dL",
                date=consult_date,
                status="Above Normal" if health_score < 75 else "Normal",
                trend="Stable"
            ))
            db.session.add(LabResult(
                citizen_id=c.id,
                test_name="Hemoglobin",
                value=f"{random.uniform(9.5, 15.5):.1f}",
                unit="g/dL",
                date=consult_date,
                status="Low" if selected_disease == "Iron Deficiency Anemia" else "Normal",
                trend="Improving"
            ))

            # 6. Add Follow Up
            db.session.add(FollowUp(
                citizen_id=c.id,
                type="Consultation",
                description="Routine follow-up assessment",
                due_date=(datetime.now() + timedelta(days=random.randint(30, 90))).strftime('%Y-%m-%d'),
                status="Upcoming"
            ))

        db.session.commit()
        print(f"Database successfully seeded with {len(citizens)} patients, 3 doctors, and relational boundaries.")

if __name__ == '__main__':
    seed_data()
