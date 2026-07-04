// API Stub Service simulating Flask REST endpoints for MedFlow
// Stores data in localStorage to enable a fully interactive demo experience

const INITIAL_CITIZEN_PROFILE = {
  id: "91-4829-1029-4821",
  name: "Aarav Sharma",
  age: 44,
  gender: "Male",
  bloodGroup: "O+",
  phone: "+91 98765 43210",
  emergencyContact: "Priyanka Sharma (Wife) - +91 98765 43211",
  currentConditions: ["Type 2 Diabetes", "Mild Hypertension"],
  allergies: ["Penicillin"],
  currentMedications: [
    { name: "Metformin", dose: "500mg", freq: "Once daily with dinner", started: "2022" },
    { name: "Amlodipine", dose: "5mg", freq: "Once daily in morning", started: "2023" }
  ],
  lastVisit: { date: "2025-05-12", doctor: "Dr. Ramesh Sharma", facility: "Rampur Primary Health Centre (PHC)" }
};

const INITIAL_RECORDS = [
  {
    id: "rec-101",
    category: "Prescriptions",
    title: "General OPD Prescription",
    hospital: "Rampur PHC",
    date: "2025-05-12",
    doctor: "Dr. Ramesh Sharma",
    verified: true,
    pdfUrl: "#",
    structuredSummary: {
      keyMetrics: "Blood Pressure: 135/85 mmHg, Fasting Blood Sugar: 128 mg/dL",
      clinicalNotes: "Patient complained of mild fatigue. Retained Metformin 500mg. Added Amlodipine 55mg daily for blood pressure management.",
      recommendations: "Limit salt intake, monitor daily blood sugar, return in 3 months."
    }
  },
  {
    id: "rec-102",
    category: "Lab Reports",
    title: "HbA1c Blood Panel Report",
    hospital: "District Pathology Lab, Lucknow",
    date: "2023-11-04",
    doctor: "Dr. Anita Goel (Pathologist)",
    verified: true,
    pdfUrl: "#",
    structuredSummary: {
      keyMetrics: "HbA1c: 6.8% (Target < 6.5%), Fasting Glucose: 118 mg/dL",
      clinicalNotes: "Glycemic control has significantly improved from 8.2% in 2021. Patient demonstrates high compliance with oral hypoglycemic agents.",
      recommendations: "Maintain current medical therapy. Repeat HbA1c test in 6 months."
    }
  },
  {
    id: "rec-103",
    category: "Discharge Summaries",
    title: "Typhoid Care Discharge Summary",
    hospital: "City General Hospital, Lucknow",
    date: "2018-08-20",
    doctor: "Dr. S. K. Sen",
    verified: true,
    pdfUrl: "#",
    structuredSummary: {
      keyMetrics: "Vitals stable, Widal Test: Positive (O & H titers > 1:160)",
      clinicalNotes: "Admitted with high grade fever and abdominal pain. Managed with IV Ceftriaxone for 5 days. Switched to oral Ciprofloxacin for discharge.",
      recommendations: "Complete 7-day course of oral antibiotics, soft diet, review after 1 week."
    }
  },
  {
    id: "rec-104",
    category: "Vaccination Records",
    title: "Adult Covid-19 Vaccination Certificate",
    hospital: "PHC Rampur Vaccination Booth",
    date: "2021-09-15",
    doctor: "N/A (Vaccinator ID: 481928)",
    verified: true,
    pdfUrl: "#",
    structuredSummary: {
      keyMetrics: "Vaccine: COVISHIELD, Dose: 2nd Dose, Batch: 482910A",
      clinicalNotes: "Patient received the second dose successfully. No immediate post-vaccination adverse events reported.",
      recommendations: "Continue standard safety protocols."
    }
  }
];

const INITIAL_TIMELINE = [
  { year: 2018, title: "Typhoid Hospitalization", type: "Discharge Summary", details: "Admitted at City Hospital for enteric fever. 5 days IV antibiotics. Fully recovered.", doctor: "Dr. S. K. Sen", facility: "City General Hospital" },
  { year: 2021, title: "Covid-19 Vaccination", type: "Vaccination", details: "Completed 2-dose immunization course of Covishield.", doctor: "Staff Nurse", facility: "PHC Rampur" },
  { year: 2021, title: "Type 2 Diabetes Diagnosis", type: "Diagnosis", details: "Diagnosed following routine blood screening showing HbA1c of 8.2%. Metformin 500mg daily prescribed.", doctor: "Dr. Ramesh Sharma", facility: "Rampur PHC" },
  { year: 2022, title: "Metformin Dosage Maintained", type: "Medication Adjustment", details: "HbA1c improved to 7.4%. Tolerated metformin well. Reinforce dietary restriction.", doctor: "Dr. Ramesh Sharma", facility: "Rampur PHC" },
  { year: 2023, title: "HbA1c Control Improved", type: "Lab Follow-up", details: "HbA1c down to 6.8% showing stable glycemic control. BP observed slightly elevated at 140/90.", doctor: "Dr. Anita Goel", facility: "District Pathology Lab" },
  { year: 2025, title: "Hypertension Metformin Adjustment", type: "Prescription", details: "Amlodipine 5mg added daily for mild hypertension management. Fasting blood sugar stable at 128 mg/dL.", doctor: "Dr. Ramesh Sharma", facility: "Rampur PHC" }
];

const INITIAL_GOVT_METRICS = {
  registeredCitizens: 1420850,
  activeChronicPatients: 324510,
  followUpCompliance: 84.2,
  pregnancyTracking: 12408,
  vaccinationCoverage: 94.6,
  pendingFollowUps: 427,
  commonDiseases: [
    { name: "Diabetes", count: 184500, pct: 40 },
    { name: "Hypertension", count: 142000, pct: 31 },
    { name: "Anemia", count: 98000, pct: 21 },
    { name: "Asthma", count: 54000, pct: 12 }
  ],
  trendingDiseases: [
    { name: "Dengue", trend: "up", pct: 24 },
    { name: "Viral Fever", trend: "up", pct: 12 },
    { name: "Malaria", trend: "down", pct: -8 }
  ],
  medicineDemand: [
    { name: "Insulin (IU)", stock: 85, status: "Stable" },
    { name: "Paracetamol (500mg)", stock: 42, status: "Low Stock Alert" },
    { name: "Iron Tablets", stock: 94, status: "High Supply" }
  ]
};

// Initialize localStorage if empty
const initLocalStorage = () => {
  if (!localStorage.getItem("medflow_profile")) {
    localStorage.setItem("medflow_profile", JSON.stringify(INITIAL_CITIZEN_PROFILE));
  }
  if (!localStorage.getItem("medflow_records")) {
    localStorage.setItem("medflow_records", JSON.stringify(INITIAL_RECORDS));
  }
  if (!localStorage.getItem("medflow_timeline")) {
    localStorage.setItem("medflow_timeline", JSON.stringify(INITIAL_TIMELINE));
  }
  if (!localStorage.getItem("medflow_govt")) {
    localStorage.setItem("medflow_govt", JSON.stringify(INITIAL_GOVT_METRICS));
  }
};

initLocalStorage();

// REST API logger function
let apiLogCallback = null;
export const registerApiLogCallback = (cb) => {
  apiLogCallback = cb;
};

const logApiCall = (method, endpoint, status, responseData) => {
  const timestamp = new Date().toLocaleTimeString();
  const logMsg = {
    timestamp,
    method,
    endpoint,
    status,
    response: JSON.stringify(responseData).substring(0, 100) + "..."
  };
  if (apiLogCallback) {
    apiLogCallback(logMsg);
  }
  console.log(`[MedFlow REST API] ${method} ${endpoint} - ${status}`, responseData);
};

// Exported API calls mimicking Flask endpoint routing
export const apiStub = {
  // GET /api/citizen/profile
  getCitizenProfile: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem("medflow_profile"));
        logApiCall("GET", "/api/citizen/91-4829-1029-4821/profile", 200, data);
        resolve(data);
      }, 600);
    });
  },

  // GET /api/citizen/records
  getMedicalRecords: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem("medflow_records"));
        logApiCall("GET", "/api/citizen/91-4829-1029-4821/records", 200, data);
        resolve(data);
      }, 600);
    });
  },

  // GET /api/citizen/timeline
  getHealthTimeline: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem("medflow_timeline"));
        logApiCall("GET", "/api/citizen/91-4829-1029-4821/timeline", 200, data);
        // Sort timeline descending by year
        const sorted = [...data].sort((a, b) => b.year - a.year);
        resolve(sorted);
      }, 700);
    });
  },

  // GET /api/govt/analytics
  getGovtMetrics: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem("medflow_govt"));
        logApiCall("GET", "/api/govt/analytics", 200, data);
        resolve(data);
      }, 600);
    });
  },

  // POST /api/doctor/consultation
  addConsultation: async (consultationData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const profile = JSON.parse(localStorage.getItem("medflow_profile"));
        const records = JSON.parse(localStorage.getItem("medflow_records"));
        const timeline = JSON.parse(localStorage.getItem("medflow_timeline"));
        const govt = JSON.parse(localStorage.getItem("medflow_govt"));
        
        const currentYear = new Date().getFullYear();
        const recordId = `rec-${Math.floor(100 + Math.random() * 900)}`;

        // 1. Add to medical records
        const newRecord = {
          id: recordId,
          category: "Prescriptions",
          title: `Consultation Prescription - ${consultationData.diagnosis}`,
          hospital: "Rampur PHC",
          date: new Date().toISOString().split('T')[0],
          doctor: "Dr. Ramesh Sharma",
          verified: true,
          pdfUrl: "#",
          structuredSummary: {
            keyMetrics: `Diagnosis: ${consultationData.diagnosis}`,
            clinicalNotes: consultationData.notes || "Routine follow up.",
            recommendations: `Prescribed medications: ${consultationData.prescription}`
          }
        };
        records.unshift(newRecord);
        localStorage.setItem("medflow_records", JSON.stringify(records));

        // 2. Add to timeline
        const newTimelineEvent = {
          year: currentYear,
          title: `Consultation: ${consultationData.diagnosis}`,
          type: "Prescription",
          details: `${consultationData.notes}. Prescribed: ${consultationData.prescription}`,
          doctor: "Dr. Ramesh Sharma",
          facility: "Rampur PHC"
        };
        timeline.unshift(newTimelineEvent);
        localStorage.setItem("medflow_timeline", JSON.stringify(timeline));

        // 3. Update Citizen profile conditions & medications
        if (consultationData.diagnosis && !profile.currentConditions.includes(consultationData.diagnosis)) {
          profile.currentConditions.push(consultationData.diagnosis);
        }
        if (consultationData.prescription) {
          // simple parsing: e.g. "Insulin 10IU daily, Paracetamol 500mg as needed"
          const meds = consultationData.prescription.split(',').map(m => m.trim());
          meds.forEach(med => {
            const parts = med.split(' ');
            const name = parts[0] || med;
            const dose = parts[1] || "";
            const freq = parts.slice(2).join(' ') || "As directed";
            profile.currentMedications.push({
              name, dose, freq, started: currentYear.toString()
            });
          });
        }
        profile.lastVisit = {
          date: new Date().toISOString().split('T')[0],
          doctor: "Dr. Ramesh Sharma",
          facility: "Rampur PHC"
        };
        localStorage.setItem("medflow_profile", JSON.stringify(profile));

        // 4. Update government metrics slightly (simulate real-time database update!)
        govt.registeredCitizens += 1;
        govt.pendingFollowUps = Math.max(0, govt.pendingFollowUps - 1);
        localStorage.setItem("medflow_govt", JSON.stringify(govt));

        logApiCall("POST", "/api/doctor/consultation", 201, { status: "Success", recordId });
        resolve({ status: "Success", recordId });
      }, 1000);
    });
  },

  // POST /api/records/upload (mocking AI pipeline)
  uploadAndProcessDocument: async (fileName, category, onProgress) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (progress === 25) onProgress("Performing OCR Text Extraction...");
        if (progress === 50) onProgress("Normalizing Medical Entities using Gemini...");
        if (progress === 75) onProgress("Validating JSON against National Clinical Schema...");
        if (progress === 100) {
          clearInterval(interval);
          
          // Add document to client database
          const records = JSON.parse(localStorage.getItem("medflow_records"));
          const timeline = JSON.parse(localStorage.getItem("medflow_timeline"));
          const profile = JSON.parse(localStorage.getItem("medflow_profile"));
          const govt = JSON.parse(localStorage.getItem("medflow_govt"));
          
          const recordId = `rec-${Math.floor(100 + Math.random() * 900)}`;
          const currentYear = new Date().getFullYear();

          let title = "Extracted Lab Report";
          let keyMetrics = "Blood Sugar: Fasting 130 mg/dL, HbA1c: 6.9%";
          let clinicalNotes = "Gemini extracted: Mild hyperglycemia detected. Diabetic treatment compliance is reasonable.";
          let recommendations = "Check HbA1c level in 3 months.";

          if (fileName.toLowerCase().includes("vacc")) {
            title = "Extracted Vaccination Certificate";
            keyMetrics = "Vaccine: Covid Booster, Status: Completed";
            clinicalNotes = "Gemini extracted booster shot information successfully.";
            recommendations = "N/A";
          } else if (fileName.toLowerCase().includes("discharge")) {
            title = "Extracted Discharge Summary";
            keyMetrics = "Diagnosis: Acute Bronchitis resolved";
            clinicalNotes = "Gemini extracted: Patient hospital stay 3 days, stable at discharge.";
            recommendations = "Avoid heavy dust environments, routine checkup in 2 weeks.";
          }

          const newRecord = {
            id: recordId,
            category: category || "Lab Reports",
            title,
            hospital: "Metro Diagnostic Hub",
            date: new Date().toISOString().split('T')[0],
            doctor: "Dr. A. Verma",
            verified: true,
            pdfUrl: "#",
            structuredSummary: { keyMetrics, clinicalNotes, recommendations }
          };

          records.unshift(newRecord);
          localStorage.setItem("medflow_records", JSON.stringify(records));

          // Also insert a timeline node
          const newTimelineEvent = {
            year: currentYear,
            title: `Processed File: ${title}`,
            type: "Lab Report Upload",
            details: `AI Normalization complete. ${keyMetrics}. Checked by Dr. A. Verma.`,
            doctor: "Dr. A. Verma",
            facility: "Metro Diagnostic Hub"
          };
          timeline.unshift(newTimelineEvent);
          localStorage.setItem("medflow_timeline", JSON.stringify(timeline));

          // Update profile conditions if a new one is found
          if (title.includes("Bronchitis") && !profile.currentConditions.includes("Acute Bronchitis")) {
            profile.currentConditions.push("Acute Bronchitis");
            localStorage.setItem("medflow_profile", JSON.stringify(profile));
          }

          // Update govt trending stats
          govt.activeChronicPatients += 1;
          localStorage.setItem("medflow_govt", JSON.stringify(govt));

          logApiCall("POST", "/api/records/upload", 202, { status: "Accepted", recordId });
          resolve({ status: "Success", recordId });
        }
      }, 1000);
    });
  },

  // Reset database helper for demo re-runs
  resetDatabase: () => {
    localStorage.setItem("medflow_profile", JSON.stringify(INITIAL_CITIZEN_PROFILE));
    localStorage.setItem("medflow_records", JSON.stringify(INITIAL_RECORDS));
    localStorage.setItem("medflow_timeline", JSON.stringify(INITIAL_TIMELINE));
    localStorage.setItem("medflow_govt", JSON.stringify(INITIAL_GOVT_METRICS));
    logApiCall("POST", "/api/system/reset", 200, { status: "Reset complete" });
  }
};
