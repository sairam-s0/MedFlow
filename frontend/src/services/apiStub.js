// Real API Service connecting to the Flask backend

const API_BASE = window.location.origin.includes(':5173')
  ? 'http://127.0.0.1:5000/api'
  : `${window.location.origin}/api`;
const CITIZEN_ID = 'QR-12345-ABCD'; // Hardcoded for demo purposes

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

export const apiStub = {
  getCitizenProfile: async () => {
    try {
      const res = await fetch(`${API_BASE}/citizens/${CITIZEN_ID}`);
      const data = await res.json();
      logApiCall("GET", `/api/citizens/${CITIZEN_ID}`, res.status, data);
      
      // Map backend schema to frontend expectations
      // Parse medication name to extract dose
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
      console.error(err);
      return null;
    }
  },

  getMedicalRecords: async () => {
    try {
      const res = await fetch(`${API_BASE}/citizens/${CITIZEN_ID}/records`);
      const data = await res.json();
      logApiCall("GET", `/api/citizens/${CITIZEN_ID}/records`, res.status, data);
      
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
            // Map arbitrary JSON from backend into the keyMetrics string
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
          structuredSummary: {
            keyMetrics,
            clinicalNotes,
            recommendations
          }
        };
      }).reverse();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  getHealthTimeline: async () => {
    try {
      const res = await fetch(`${API_BASE}/citizens/${CITIZEN_ID}/timeline`);
      const data = await res.json();
      logApiCall("GET", `/api/citizens/${CITIZEN_ID}/timeline`, res.status, data);
      
      return data.map(e => ({
        year: parseInt(e.year, 10),
        title: e.title,
        type: e.event_type,
        details: e.description,
        doctor: e.title.includes('Consultation') ? 'Dr. Meera Sharma' : 'Clinical Staff',
        facility: e.title.includes('Consultation') ? 'Rampur Primary Health Centre' : 'MedFlow Linked Facility'
      })).sort((a, b) => b.year - a.year);
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  getGovtMetrics: async () => {
    try {
      const res = await fetch(`${API_BASE}/government/dashboard`);
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
      console.error(err);
      return null;
    }
  },

  addConsultation: async (consultationData) => {
    try {
      const payload = {
        health_id: CITIZEN_ID,
        doctor_name: "Dr. Virtual",
        date: new Date().toISOString().split('T')[0],
        ...consultationData
      };
      
      const res = await fetch(`${API_BASE}/doctors/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      logApiCall("POST", `/api/doctors/consultations`, res.status, data);
      return { status: "Success", recordId: data.consultation_id };
    } catch (err) {
      console.error(err);
      return { status: "Error" };
    }
  },

  uploadAndProcessDocument: async (selectedFile, category, onProgress) => {
    try {
      if (onProgress) onProgress("Uploading file to AI Vision Extractor...");
      
      // 1. Send file to AI extraction endpoint
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
        const message = aiData.message || aiData.error || extractRes.statusText;
        throw new Error(`AI extraction failed: ${message}`);
      }
      
      if (onProgress) onProgress("AI Extraction complete. Saving structured data...");
      
      logApiCall("POST", `/api/ai/extract`, extractRes.status, aiData);

      const extractedEvent = aiData.event || aiData;
      const failedExtraction = extractedEvent.extraction_confidence === "low"
        && !extractedEvent.hospital_or_clinic
        && !extractedEvent.doctor_name
        && (!extractedEvent.diagnosis || extractedEvent.diagnosis.length === 0)
        && (!extractedEvent.medications || extractedEvent.medications.length === 0)
        && (!extractedEvent.lab_results || extractedEvent.lab_results.length === 0)
        && (
          (extractedEvent.notes || "").includes("LLM parsing failed")
          || (extractedEvent.notes || "").includes("LLM text extraction failed")
        );

      if (failedExtraction) {
        throw new Error(extractedEvent.notes || "AI extraction failed. No record was saved.");
      }
      
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

      // 2. Save extracted data to the database
      const savePayload = {
        health_id: CITIZEN_ID,
        hospital: hospital,
        date: date,
        doctor: doctor,
        record_type: category || "Document",
        structured_summary: structuredSummary,
        ai_data: aiData // Pass the full structured AI response
      };
      
      const saveRes = await fetch(`${API_BASE}/citizens/${CITIZEN_ID}/records/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savePayload)
      });
      
      const saveData = await saveRes.json();
      logApiCall("POST", `/api/citizens/${CITIZEN_ID}/records/upload`, saveRes.status, saveData);

      if (!saveRes.ok) {
        throw new Error(saveData.message || saveData.error || "Could not save the extracted record.");
      }
      
      if (onProgress) onProgress("Record successfully ingested and linked to Timeline.");
      
      return { status: "Success", recordId: saveData.record_id };
    } catch (err) {
      console.error(err);
      if (onProgress) onProgress("Error: " + err.message);
      return { status: "Error", message: err.message };
    }
  },

  resetDatabase: async () => {
    // In a real app, you might hit a reset endpoint. For now, just reload.
    window.location.reload();
  }
};
