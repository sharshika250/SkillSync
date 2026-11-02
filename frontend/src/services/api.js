/**
 * Centralized API service client for SkillSync.
 * Handles HTTP requests, authentication headers, and standard error handling.
 * Supports configurable VITE_API_URL for production cloud deployments.
 */

const RAW_API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://skillsync-backend-swo6.onrender.com');
const API_BASE = RAW_API_BASE.replace(/\/+$/, '');



const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };

  const savedUser = localStorage.getItem('skillsync_user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      if (user?.id || user?._id) {
        const userId = user.id || user._id;
        headers['x-user-id'] = userId;
        headers['Authorization'] = `Bearer ${userId}`;
      }
    } catch {
      // Ignore parse errors
    }
  }

  return headers;
};

const handleResponse = async (response) => {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = { success: false, message: 'Invalid response from server' };
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// 1. Auth Services
export const authAPI = {
  async register(formData) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return handleResponse(res);
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  }
};

// 2. User & Profile Services
export const userAPI = {
  async getAllUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.skill) query.append('skill', params.skill);
    if (params.offeredSkill) query.append('offeredSkill', params.offeredSkill);
    if (params.wantedSkill) query.append('wantedSkill', params.wantedSkill);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/api/users${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getUserById(id) {
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/api/users/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/api/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  }
};

// 3. Exchange Request Services
export const requestAPI = {
  async createRequest(payload) {
    const res = await fetch(`${API_BASE}/api/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async getRequests(type) {
    const query = type ? `?type=${type}` : '';
    const res = await fetch(`${API_BASE}/api/requests${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async acceptRequest(id) {
    const res = await fetch(`${API_BASE}/api/requests/${id}/accept`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async rejectRequest(id) {
    const res = await fetch(`${API_BASE}/api/requests/${id}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async cancelRequest(id) {
    const res = await fetch(`${API_BASE}/api/requests/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async confirmCompletion(id) {
    const res = await fetch(`${API_BASE}/api/requests/${id}/complete`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// 4. Matches & Recommendations Services
export const matchAPI = {
  async getMatches() {
    const res = await fetch(`${API_BASE}/api/matches`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getRecommendations() {
    const res = await fetch(`${API_BASE}/api/matches/recommendations`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// 5. Skill Verification & Assessment Services
export const assessmentAPI = {
  async getAvailableSkills() {
    const res = await fetch(`${API_BASE}/api/assessments/skills`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getQuestions(skill, params = {}) {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    const res = await fetch(`${API_BASE}/api/assessments/skill/${encodeURIComponent(skill)}${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async submitMCQ(data) {
    const res = await fetch(`${API_BASE}/api/assessments/submit-mcq`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async submitPractical(data) {
    const res = await fetch(`${API_BASE}/api/assessments/submit-practical`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getHistory() {
    const res = await fetch(`${API_BASE}/api/assessments/history`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// 6. Scheduling & Sessions Services
export const sessionAPI = {
  async schedule(data) {
    const res = await fetch(`${API_BASE}/api/sessions/schedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getSessions() {
    const res = await fetch(`${API_BASE}/api/sessions`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// 7. Reviews & Reputation Services
export const reviewAPI = {
  async createReview(data) {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getUserReviews(userId) {
    const res = await fetch(`${API_BASE}/api/reviews/user/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// 8. Learning Management Services
export const learningAPI = {
  async getSummary() {
    const res = await fetch(`${API_BASE}/api/learning`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createGoal(data) {
    const res = await fetch(`${API_BASE}/api/learning/goals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async toggleMilestone(goalId, milestoneId) {
    const res = await fetch(`${API_BASE}/api/learning/goals/${goalId}/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async addJournalEntry(goalId, note) {
    const res = await fetch(`${API_BASE}/api/learning/goals/${goalId}/journal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ note })
    });
    return handleResponse(res);
  }
};

// 9. AI-Powered Services
export const aiAPI = {
  async getRoadmap(skill, currentLevel, targetLevel) {
    const res = await fetch(`${API_BASE}/api/ai/roadmap`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skill, currentLevel, targetLevel })
    });
    return handleResponse(res);
  },

  async analyzeGap(skill) {
    const res = await fetch(`${API_BASE}/api/ai/gap-analysis`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skill })
    });
    return handleResponse(res);
  },

  async getRecommendations() {
    const res = await fetch(`${API_BASE}/api/ai/recommendations`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async askAssistant(skill, query) {
    const res = await fetch(`${API_BASE}/api/ai/ask-assistant`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skill, query })
    });
    return handleResponse(res);
  }
};

// 10. Communication & Notifications Services
export const communicationAPI = {
  async sendMessage(receiverId, content) {
    const res = await fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiverId, content })
    });
    return handleResponse(res);
  },

  async getConversations() {
    const res = await fetch(`${API_BASE}/api/messages`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getMessages(partnerId) {
    const res = await fetch(`${API_BASE}/api/messages/${partnerId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// 11. Admin Services
export const adminAPI = {
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/api/admin/analytics`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async toggleSuspension(userId) {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/suspend`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createReport(reportedUserId, reason, details) {
    const res = await fetch(`${API_BASE}/api/admin/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reportedUserId, reason, details })
    });
    return handleResponse(res);
  },

  async getReports() {
    const res = await fetch(`${API_BASE}/api/admin/reports`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async resolveReport(id, status, actionTaken) {
    const res = await fetch(`${API_BASE}/api/admin/reports/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, actionTaken })
    });
    return handleResponse(res);
  },

  async createAssessment(data) {
    const res = await fetch(`${API_BASE}/api/admin/assessments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }
};
