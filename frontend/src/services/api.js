/**
 * Centralized API service client for SkillSync.
 * Handles HTTP requests, authentication headers, and standard error handling.
 */

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
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return handleResponse(res);
  },

  async login(credentials) {
    const res = await fetch('/api/auth/login', {
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
    const res = await fetch(`/api/users${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getUserById(id) {
    const res = await fetch(`/api/users/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getProfile() {
    const res = await fetch('/api/users/profile', {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch('/api/users/profile', {
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
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async getRequests(type) {
    const query = type ? `?type=${type}` : '';
    const res = await fetch(`/api/requests${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async acceptRequest(id) {
    const res = await fetch(`/api/requests/${id}/accept`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async rejectRequest(id) {
    const res = await fetch(`/api/requests/${id}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async cancelRequest(id) {
    const res = await fetch(`/api/requests/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

// 4. Matches & Recommendations Services
export const matchAPI = {
  async getMatches() {
    const res = await fetch('/api/matches', {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getRecommendations() {
    const res = await fetch('/api/matches/recommendations', {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
