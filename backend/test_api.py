import requests
import json

BASE_URL = 'http://127.0.0.1:5000/api'
HEALTH_ID = 'QR-12345-ABCD'

def print_response(name, response):
    print(f"\n--- {name} ---")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def run_tests():
    # 1. Get Citizen Profile
    res = requests.get(f'{BASE_URL}/citizens/{HEALTH_ID}')
    print_response("Citizen Profile", res)

    # 2. Get Medical Records
    res = requests.get(f'{BASE_URL}/citizens/{HEALTH_ID}/records')
    print_response("Medical Records", res)

    # 3. Get Health Timeline
    res = requests.get(f'{BASE_URL}/citizens/{HEALTH_ID}/timeline')
    print_response("Health Timeline", res)

    # 4. Get Doctor Scan Summary
    res = requests.get(f'{BASE_URL}/doctors/scan/{HEALTH_ID}')
    print_response("Doctor Scan Summary", res)

    # 5. Government Dashboard
    res = requests.get(f'{BASE_URL}/government/dashboard')
    print_response("Government Dashboard", res)

    # 6. Government Analytics
    res = requests.get(f'{BASE_URL}/government/analytics')
    print_response("Government Analytics", res)

    # 7. Add Consultation
    payload = {
        "health_id": HEALTH_ID,
        "doctor_name": "Dr. AI",
        "date": "2025-07-04",
        "diagnosis": "Healthy",
        "prescription": "None",
        "notes": "Looks good."
    }
    res = requests.post(f'{BASE_URL}/doctors/consultations', json=payload)
    print_response("Add Consultation", res)

    # 8. Upload Record
    upload_payload = {
        "health_id": HEALTH_ID,
        "hospital": "Rampur Primary Health Centre",
        "date": "2025-07-04",
        "record_type": "Radiology",
        "structured_summary": {"Finding": "Normal X-Ray"}
    }
    res = requests.post(f'{BASE_URL}/citizens/{HEALTH_ID}/records/upload', json=upload_payload)
    print_response("Upload Record", res)

if __name__ == '__main__':
    run_tests()
