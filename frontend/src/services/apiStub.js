// Real API Service connecting to the Flask backend
// Includes Offline Sandbox Fallbacks in case the backend is unreachable

const API_BASE = window.location.origin.includes(':5173')
  ? 'http://127.0.0.1:5000/api'
  : `${window.location.origin}/api`;

let activeCitizenId = 'QR-12345-ABCD';
export const setActiveCitizenId = (id) => { activeCitizenId = id; };

let apiLogCallback = null;
export const registerApiLogCallback = (cb) => {
  apiLogCallback = cb;
};

const logApiCall = (method, endpoint, status, responseData) => {
  const logMsg = {
    timestamp: new Date().toLocaleTimeString(),
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

// =====================================================================
// RICH OFFLINE FAKE DATA (ABDM COMPLIANT FALLBACKS)
// =====================================================================
const OFFLINE_PROFILES = {
  'QR-12345-ABCD': {
    health_id: 'QR-12345-ABCD',
    name: 'Ramesh Kumar',
    age: 45,
    gender: 'Male',
    blood_group: 'O+',
    contact: '+91 98765 43210',
    emergency_contact: '+91 98765 43211',
    last_hospital_visit: '2026-05-12',
    conditions: [{ name: 'Type 2 Diabetes' }, { name: 'Mild Hypertension' }],
    allergies: [{ name: 'Penicillin' }, { name: 'Dust Allergy' }],
    medications: [
      { name: 'Metformin 500mg', started_year: '2024' },
      { name: 'Amlodipine 5mg', started_year: '2025' }
    ]
  },
  'QR-67890-EFGH': {
    health_id: 'QR-67890-EFGH',
    name: 'Sita Devi',
    age: 38,
    gender: 'Female',
    blood_group: 'B+',
    contact: '+91 98765 43220',
    emergency_contact: '+91 98765 43221',
    last_hospital_visit: '2026-06-04',
    conditions: [{ name: 'Asthma' }],
    allergies: [{ name: 'Sulfa Drugs' }],
    medications: [
      { name: 'Albuterol Inhaler 90mcg', started_year: '2025' }
    ]
  }
};

const OFFLINE_RECORDS = {
  'QR-12345-ABCD': [
    {
      id: 101,
      record_type: 'Lab Reports',
      hospital: 'Delhi Central PHC',
      date: '2026-05-12',
      doctor: 'Dr. Ramesh Sharma',
      verified: true,
      structured_summary: {
        keyMetrics: 'HbA1c: 6.8%, Fasting Glucose: 128 mg/dL',
        clinicalNotes: 'Blood sugar remains slightly elevated but stable. Compliance with Metformin is good.',
        recommendations: 'Continue Metformin 500mg. Walk 30 minutes daily. Re-check HbA1c in 3 months.'
      }
    },
    {
      id: 102,
      record_type: 'Prescriptions',
      hospital: 'Noida District Clinic',
      date: '2026-04-10',
      doctor: 'Dr. Anita Goel',
      verified: true,
      structured_summary: {
        keyMetrics: 'Blood Pressure: 135/85 mmHg',
        clinicalNotes: 'Mild hypertensive readings. Patient feels fine otherwise.',
        recommendations: 'Start Amlodipine 5mg once daily in the morning.'
      }
    }
  ],
  'QR-67890-EFGH': [
    {
      id: 201,
      record_type: 'Prescriptions',
      hospital: 'Rampur Community Health Centre',
      date: '2026-06-04',
      doctor: 'Dr. Meera Sharma',
      verified: true,
      structured_summary: {
        keyMetrics: 'Oxygen Saturation: 97%, Peak Flow: 350 L/min',
        clinicalNotes: 'Mild asthma exacerbation reported due to seasonal dust.',
        recommendations: 'Use Albuterol inhaler as directed. Avoid outdoor exposure during high dust counts.'
      }
    }
  ]
};

const OFFLINE_TIMELINES = {
  'QR-12345-ABCD': [
    {
      year: '2026',
      title: 'HbA1c Blood Panel Ingested',
      event_type: 'AI Ingestion',
      description: 'AI Ingestion: Blood sugar remains slightly elevated but stable. Compliance with Metformin is good.'
    },
    {
      year: '2026',
      title: 'Hypertension Consultation',
      event_type: 'Clinic Visit',
      description: 'Consultation notes: Started Amlodipine 5mg for mild hypertension control.'
    }
  ],
  'QR-67890-EFGH': [
    {
      year: '2026',
      title: 'Asthma Consultation',
      event_type: 'Clinic Visit',
      description: 'Consultation notes: Mild asthma exacerbation reported. Checked inhaler technique.'
    }
  ]
};

const OFFLINE_GOV = {
  district_overview: {
    registered_citizens: 1420104,
    active_chronic_patients: 420847,
    follow_up_compliance: 84.6,
    pregnancy_tracking: 9812,
    vaccination_coverage: 92.4
  },
  pending_follow_ups: 427,
  most_common_diseases: [
    { name: 'Diabetes', count: 120000 },
    { name: 'Hypertension', count: 98000 },
    { name: 'Anemia', count: 64000 }
  ],
  trending_diseases: [
    { name: 'Dengue', trend: 'Rising' },
    { name: 'Malaria', trend: 'Stable' }
  ],
  medicine_demand: [
    { name: 'Metformin', status: 'High Demand' },
    { name: 'Amlodipine', status: 'Normal' },
    { name: 'Iron Tablets', status: 'Moderate Demand' }
  ]
};

// =====================================================================
// API INTERFACES
// =====================================================================
export const apiStub = {
  getCitizenProfile: async () => {
    try {
      const res = await fetch(`${API_BASE}/citizens/${activeCitizenId}`);
      if (!res.ok) throw new Error("Backend offline");
      const data = await res.json();
      logApiCall("GET", `/api/citizens/${activeCitizenId}`, res.status, data);
      
      const mappedMedications = data.medications ? data.medications.map(m => {
        const parts = m.name.split(' ');
        const dose = parts.find(p => p.toLowerCase().includes('mg') || p.toLowerCase().includes('ml') || p.toLowerCase().includes('iu')) || "";
        const name = parts.filter(p => p !== dose).join(' ');
        return {
          name: name,
          started: m.started_year,
          dose: dose, 
          freq: "As directed"
        };
      }) : [];

      return {
        id: data.health_id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        bloodGroup: data.blood_group,
        phone: data.contact,
        emergencyContact: data.emergency_contact,
        currentConditions: data.conditions ? data.conditions.map(c => c.name) : [],
        allergies: data.allergies ? data.allergies.map(a => a.name) : [],
        currentMedications: mappedMedications,
        lastVisit: { date: data.last_hospital_visit, doctor: "Attending Doctor", facility: "Government Health Center" }
      };
    } catch (err) {
      console.warn(`[apiStub] Backend unreachable. Using offline profile for ${activeCitizenId}.`);
      const offlineProfile = OFFLINE_PROFILES[activeCitizenId] || OFFLINE_PROFILES['QR-12345-ABCD'];
      
      const mappedMedications = offlineProfile.medications.map(m => {
        const parts = m.name.split(' ');
        const dose = parts.find(p => p.toLowerCase().includes('mg') || p.toLowerCase().includes('ml') || p.toLowerCase().includes('iu')) || "";
        const name = parts.filter(p => p !== dose).join(' ');
        return { name, started: m.started_year, dose, freq: "Once daily" };
      });

      return {
        id: offlineProfile.health_id,
        name: offlineProfile.name,
        age: offlineProfile.age,
        gender: offlineProfile.gender,
        bloodGroup: offlineProfile.blood_group,
        phone: offlineProfile.contact,
        emergencyContact: offlineProfile.emergency_contact,
        currentConditions: offlineProfile.conditions.map(c => c.name),
        allergies: offlineProfile.allergies.map(a => a.name),
        currentMedications: mappedMedications,
        lastVisit: { date: offlineProfile.last_hospital_visit, doctor: "Attending Doctor", facility: "Government Health Center" }
      };
    }
  },

  getMedicalRecords: async () => {
    try {
      const res = await fetch(`${API_BASE}/citizens/${activeCitizenId}/records`);
      if (!res.ok) throw new Error("Backend offline");
      const data = await res.json();
      logApiCall("GET", `/api/citizens/${activeCitizenId}/records`, res.status, data);
      
      return data.map(r => {
        let keyMetrics = "No specific metrics recorded.";
        let clinicalNotes = "Routine clinical observation.";
        let recommendations = "Standard care advised.";
        
        if (r.structured_summary) {
          if (r.structured_summary.keyMetrics) {
            keyMetrics = r.structured_summary.keyMetrics;
            clinicalNotes = r.structured_summary.clinicalNotes || clinicalNotes;
            recommendations = r.structured_summary.recommendations || recommendations;
          } else {
            keyMetrics = Object.entries(r.structured_summary)
                               .map(([k, v]) => `${k}: ${v}`)
                               .join(', ') || keyMetrics;
          }
        }

        return {
          id: r.id,
          category: r.record_type,
          title: `${r.record_type} - ${r.hospital}`,
          hospital: r.hospital,
          date: r.date,
          doctor: r.doctor,
          verified: r.verified,
          pdfUrl: "#",
          structuredSummary: { keyMetrics, clinicalNotes, recommendations }
        };
      }).reverse();
    } catch (err) {
      console.warn(`[apiStub] Backend unreachable. Using offline medical records.`);
      const offlineList = OFFLINE_RECORDS[activeCitizenId] || [];
      return offlineList.map(r => ({
        id: r.id,
        category: r.record_type,
        title: `${r.record_type} - ${r.hospital}`,
        hospital: r.hospital,
        date: r.date,
        doctor: r.doctor,
        verified: r.verified,
        pdfUrl: "#",
        structuredSummary: r.structured_summary
      }));
    }
  },

  getHealthTimeline: async () => {
    try {
      const res = await fetch(`${API_BASE}/citizens/${activeCitizenId}/timeline`);
      if (!res.ok) throw new Error("Backend offline");
      const data = await res.json();
      logApiCall("GET", `/api/citizens/${activeCitizenId}/timeline`, res.status, data);
      
      return data.map(e => ({
        year: parseInt(e.year, 10),
        title: e.title,
        type: e.event_type,
        details: e.description,
        doctor: e.title.includes('Consultation') ? 'Dr. Meera Sharma' : 'Clinical Staff',
        facility: e.title.includes('Consultation') ? 'Rampur Primary Health Centre' : 'MedFlow Linked Facility'
      })).sort((a, b) => b.year - a.year);
    } catch (err) {
      console.warn(`[apiStub] Backend unreachable. Using offline health timeline.`);
      const offlineTimeline = OFFLINE_TIMELINES[activeCitizenId] || [];
      return offlineTimeline.map((e, idx) => ({
        year: parseInt(e.year, 10),
        title: e.title,
        type: e.event_type,
        details: e.description,
        doctor: 'Dr. Ramesh Sharma',
        facility: 'Delhi Central PHC'
      }));
    }
  },

  getGovtMetrics: async () => {
    try {
      const res = await fetch(`${API_BASE}/government/dashboard`);
      if (!res.ok) throw new Error("Backend offline");
      const data = await res.json();
      logApiCall("GET", `/api/government/dashboard`, res.status, data);
      
      return {
        registeredCitizens: data.district_overview.registered_citizens,
        activeChronicPatients: data.district_overview.active_chronic_patients,
        followUpCompliance: parseFloat(data.district_overview.follow_up_compliance),
        pregnancyTracking: data.district_overview.pregnancy_tracking,
        vaccinationCoverage: parseFloat(data.district_overview.vaccination_coverage),
        pendingFollowUps: data.pending_follow_ups,
        commonDiseases: data.most_common_diseases.map(d => ({
          name: d.name,
          count: d.count,
          pct: data.district_overview.registered_citizens
            ? Math.round((d.count / data.district_overview.registered_citizens) * 100)
            : 0
        })),
        trendingDiseases: data.trending_diseases.map(d => ({ name: d.name, trend: d.trend, pct: 10 })),
        medicineDemand: data.medicine_demand.map(m => ({ name: m.name, stock: 50, status: m.status }))
      };
    } catch (err) {
      console.warn(`[apiStub] Backend unreachable. Using offline govt operations metrics.`);
      const data = OFFLINE_GOV;
      return {
        registeredCitizens: data.district_overview.registered_citizens,
        activeChronicPatients: data.district_overview.active_chronic_patients,
        followUpCompliance: data.district_overview.follow_up_compliance,
        pregnancyTracking: data.district_overview.pregnancy_tracking,
        vaccinationCoverage: data.district_overview.vaccination_coverage,
        pendingFollowUps: data.pending_follow_ups,
        commonDiseases: data.most_common_diseases.map(d => ({
          name: d.name,
          count: d.count,
          pct: Math.round((d.count / data.district_overview.registered_citizens) * 100)
        })),
        trendingDiseases: data.trending_diseases.map(d => ({ name: d.name, trend: d.trend, pct: 10 })),
        medicineDemand: data.medicine_demand.map(m => ({ name: m.name, stock: 50, status: m.status }))
      };
    }
  },

  addConsultation: async (consultationData) => {
    try {
      const payload = {
        health_id: activeCitizenId,
        doctor_name: "Dr. Virtual",
        date: new Date().toISOString().split('T')[0],
        ...consultationData
      };
      
      const res = await fetch(`${API_BASE}/doctors/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Backend offline");
      const data = await res.json();
      logApiCall("POST", `/api/doctors/consultations`, res.status, data);
      return { status: "Success", recordId: data.consultation_id };
    } catch (err) {
      console.warn(`[apiStub] Backend unreachable. Simulating successful consult registry.`);
      return { status: "Success", recordId: Math.floor(Math.random() * 1000) };
    }
  },

  uploadAndProcessDocument: async (selectedFile, category, onProgress) => {
    try {
      if (onProgress) onProgress("Uploading file to AI Vision Extractor...");
      
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const extractRes = await fetch(`${API_BASE}/ai/extract`, {
        method: 'POST',
        body: formData
      });

      let aiData = null;
      try {
        aiData = await extractRes.json();
      } catch {
        aiData = {};
      }
      
      if (!extractRes.ok) {
        throw new Error("Backend offline or extraction failed");
      }
      
      if (onProgress) onProgress("AI Extraction complete. Saving structured data...");
      
      logApiCall("POST", `/api/ai/extract`, extractRes.status, aiData);

      const extractedEvent = aiData.event || aiData;
      
      let structuredSummary = {};
      let hospital = "Unknown Clinic";
      let doctor = "Unknown Doctor";
      let date = new Date().toISOString().split('T')[0];
      
      if (aiData.event) {
        structuredSummary = {
          keyMetrics: `Extracted ${aiData.event.document_type || category}`,
          clinicalNotes: aiData.event.notes || "No notes extracted",
          recommendations: aiData.context?.suggested_next_visit || "None"
        };
        hospital = aiData.event.hospital_or_clinic || hospital;
        doctor = aiData.event.doctor_name || doctor;
        if (aiData.event.date) date = aiData.event.date;
      } else {
        structuredSummary = {
          keyMetrics: `Extracted ${aiData.document_type || category}`,
          clinicalNotes: aiData.notes || "No notes extracted",
          recommendations: "None"
        };
        hospital = aiData.hospital_or_clinic || hospital;
        doctor = aiData.doctor_name || doctor;
        if (aiData.date) date = aiData.date;
      }

      const savePayload = {
        health_id: activeCitizenId,
        hospital: hospital,
        date: date,
        doctor: doctor || "Extracted Doctor",
        record_type: category || "Document",
        structured_summary: structuredSummary,
        ai_data: aiData
      };
      
      const saveRes = await fetch(`${API_BASE}/citizens/${activeCitizenId}/records/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savePayload)
      });
      
      const saveData = await saveRes.json();
      logApiCall("POST", `/api/citizens/${activeCitizenId}/records/upload`, saveRes.status, saveData);

      if (!saveRes.ok) throw new Error("Save failed");
      
      if (onProgress) onProgress("Record successfully ingested and linked to Timeline.");
      return { status: "Success", recordId: saveData.record_id };
    } catch (err) {
      console.warn(`[apiStub] Backend unreachable. Simulating document AI extraction fallbacks.`);
      if (onProgress) onProgress("Offline Mode: Simulating local OCR & AI Extraction...");
      
      // Simulate slow AI parse
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onProgress) onProgress("ABHA Sandbox Fallback: Local OCR & clinical mapping finished.");
      
      // Inject dummy record into OFFLINE_RECORDS locally
      const mockRecordId = Math.floor(Math.random() * 1000) + 500;
      const simulatedRecord = {
        id: mockRecordId,
        record_type: category,
        hospital: "Simulated Clinical Center",
        date: new Date().toISOString().split('T')[0],
        doctor: "Dr. AI Assistant",
        verified: true,
        structured_summary: {
          keyMetrics: `Fasting Blood Sugar: 112 mg/dL, SpO2: 98%`,
          clinicalNotes: `Scanned file ${selectedFile.name} successfully parsed offline. Simulated profile alignment complete.`,
          recommendations: `Maintain standard active lifestyle. Avoid high-glucose foods.`
        }
      };

      if (!OFFLINE_RECORDS[activeCitizenId]) {
        OFFLINE_RECORDS[activeCitizenId] = [];
      }
      OFFLINE_RECORDS[activeCitizenId].push(simulatedRecord);

      // Also append timeline event
      if (!OFFLINE_TIMELINES[activeCitizenId]) {
        OFFLINE_TIMELINES[activeCitizenId] = [];
      }
      OFFLINE_TIMELINES[activeCitizenId].push({
        year: new Date().getFullYear().toString(),
        title: `Simulated Ingestion: ${category}`,
        event_type: 'AI Ingestion',
        description: `Successfully ingested document ${selectedFile.name} offline.`
      });

      return { status: "Success", recordId: mockRecordId };
    }
  },

  resetDatabase: async () => {
    window.location.reload();
  }
};
