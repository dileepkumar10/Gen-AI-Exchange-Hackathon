const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  getHeaders(isFormData = false) {
    const headers = {};
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.isFormData),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async signup(userData) {
    return this.request('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await this.request('/login', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });

    if (response.access_token) {
      this.setToken(response.access_token);
    }

    return response;
  }

  async logout() {
    this.removeToken();
  }

  isAuthenticated() {
    return !!this.token;
  }

  async uploadFiles(files) {
    const formData = new FormData();
    
    if (files instanceof FileList || Array.isArray(files)) {
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }

    return this.request('/upload-files', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  }

  async runAIAnalysis() {
    return this.request('/run-ai-analysis', {
      method: 'POST',
    });
  }

  async healthCheck() {
    return this.request('/');
  }
}

const apiService = new ApiService();
export default apiService;