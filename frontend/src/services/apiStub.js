// Real API Service connecting to the Flask backend
// Stores JWT in localStorage and handles authentication

const API_BASE = window.location.origin.includes(':5173')
  ? 'http://127.0.0.1:5000/api'
  : `${window.location.origin}/api`;

let activeCitizenId = '';
export const setActiveCitizenId = (id) => { activeCitizenId = id; };

// Helper to fetch authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('medflow_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Helper for making API requests
const request = async (method, path, body = null, isFormData = false) => {
  const headers = {
    ...getAuthHeader()
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, config);
  
  if (response.status === 401) {
    // Session expired, clear token
    localStorage.removeItem('medflow_token');
    localStorage.removeItem('medflow_user');
    window.location.reload();
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || response.statusText || "Request failed");
  }

  return response.json();
};

export const apiStub = {
  // Authentication & Registration
  login: async (username, password, role) => {
    const data = await request('POST', '/auth/login', { username, password, role });
    if (data.token) {
      localStorage.setItem('medflow_token', data.token);
      localStorage.setItem('medflow_user', JSON.stringify(data.user));
    }
    return data.user;
  },

  register: async (registrationData) => {
    const data = await request('POST', '/auth/register', registrationData);
    if (data.token) {
      localStorage.setItem('medflow_token', data.token);
      localStorage.setItem('medflow_user', JSON.stringify(data.user));
    }
    return data.user;
  },

  logout: async () => {
    localStorage.removeItem('medflow_token');
    localStorage.removeItem('medflow_user');
  },

  getLoggedInUser: () => {
    const userStr = localStorage.getItem('medflow_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Citizen Portal
  getCitizenProfile: async () => {
    const data = await request('GET', '/citizens/profile');
    
    // Map backend keys to frontend expected format
    const mappedMedications = data.medications ? data.medications.map(m => {
      return {
        name: m.name,
        started: m.started_year,
        dose: m.dosage || "Standard", 
        freq: m.frequency || "Once daily"
      };
    }) : [];

    const lastVisit = data.records && data.records.length > 0
      ? { date: data.records[0].date, doctor: data.records[0].doctor, facility: data.records[0].hospital }
      : { date: data.created_at ? data.created_at.split('T')[0] : '—', doctor: 'Attending Clinician', facility: 'Primary Health Centre' };

    return {
      id: data.health_id,
      name: data.name,
      age: data.age,
      gender: data.gender,
      dob: data.dob,
      bloodGroup: data.blood_group,
      height: data.height,
      weight: data.weight,
      phone: data.contact,
      emergencyContact: data.emergency_contact,
      currentConditions: data.conditions ? data.conditions.map(c => c.name) : [],
      allergies: data.allergies ? data.allergies.map(a => a.name) : [],
      currentMedications: mappedMedications,
      lastVisit
    };
  },

  updateCitizenProfile: async (updateData) => {
    return request('PUT', '/citizens/profile', updateData);
  },

  getCitizenPersonalAnalytics: async () => {
    return request('GET', '/citizens/analytics');
  },

  // Medical Records (Search, Filter, Paginate)
  getMedicalRecords: async (category = 'All', search = '', page = 1, perPage = 5) => {
    const queryParams = new URLSearchParams({
      category,
      search,
      page,
      per_page: perPage
    });
    
    if (activeCitizenId) {
      queryParams.append('health_id', activeCitizenId);
    }

    const data = await request('GET', `/citizens/records?${queryParams.toString()}`);
    
    // Map records list to frontend format
    const mapped = data.records.map(r => {
      let keyMetrics = "No specific metrics recorded.";
      let clinicalNotes = "Routine clinical observation.";
      let recommendations = "Standard care advised.";
      
      if (r.structured_summary) {
        keyMetrics = r.structured_summary.keyMetrics || keyMetrics;
        clinicalNotes = r.structured_summary.clinicalNotes || clinicalNotes;
        recommendations = r.structured_summary.recommendations || recommendations;
      }

      return {
        id: r.id,
        category: r.record_type,
        title: `${r.record_type} - ${r.hospital}`,
        hospital: r.hospital,
        date: r.date,
        doctor: r.doctor,
        verified: r.verified,
        pdfUrl: r.file_path || "#",
        structuredSummary: { keyMetrics, clinicalNotes, recommendations }
      };
    });

    return {
      records: mapped,
      total: data.total,
      pages: data.pages,
      current_page: data.current_page
    };
  },

  getHealthTimeline: async () => {
    const queryParams = new URLSearchParams();
    if (activeCitizenId) {
      queryParams.append('health_id', activeCitizenId);
    }
    const data = await request('GET', `/citizens/timeline?${queryParams.toString()}`);
    
    return data.map(e => ({
      year: parseInt(e.year, 10),
      title: e.title,
      type: e.event_type,
      details: e.description,
      doctor: e.title.includes('Consultation') ? 'Dr. Meera Sharma' : 'Clinical Staff',
      facility: 'Primary Health Facility'
    }));
  },

  getFollowups: async () => {
    const queryParams = new URLSearchParams();
    if (activeCitizenId) {
      queryParams.append('health_id', activeCitizenId);
    }
    return request('GET', `/citizens/followups?${queryParams.toString()}`);
  },

  // Document Upload and AI Ingestion (Two-step review wizard)
  extractDocumentAI: async (selectedFile) => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    return request('POST', '/ai/extract', formData, true);
  },

  saveConfirmedRecord: async (payload) => {
    return request('POST', '/citizens/records/upload', payload);
  },

  // Secure QR Generation & Verification
  generateQRToken: async () => {
    return request('POST', '/qr/generate');
  },

  verifyQRToken: async (token) => {
    return request('POST', '/qr/verify', { token });
  },

  // Doctor Dashboard
  getDoctorPatientSummary: async (healthId) => {
    return request('GET', `/doctors/scan/${healthId}`);
  },

  addConsultation: async (consultationData) => {
    const payload = {
      health_id: activeCitizenId,
      ...consultationData
    };
    return request('POST', '/doctors/consultations', payload);
  },

  // Government & Geographic Maps
  getGovtMetrics: async () => {
    const data = await request('GET', '/government/dashboard');
    return {
      registeredCitizens: data.registeredCitizens,
      activeChronicPatients: data.activeChronicPatients,
      followUpCompliance: data.followUpCompliance,
      pregnancyTracking: data.pregnancyTracking,
      vaccinationCoverage: data.vaccinationCoverage,
      pendingFollowUps: data.pendingFollowUps,
      commonDiseases: data.commonDiseases,
      trendingDiseases: data.trendingDiseases,
      medicineDemand: data.medicine_demand
    };
  },

  getMapMetrics: async (metric) => {
    return request('GET', `/map/analytics?metric=${metric}`);
  },

  resetDatabase: async () => {
    return request('POST', '/db/reset');
  }
};
