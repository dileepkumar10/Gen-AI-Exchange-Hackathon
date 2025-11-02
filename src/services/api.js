const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://gen-ai-exchange-hackathon-8y50.onrender.com';
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'wss://gen-ai-exchange-hackathon-8y50.onrender.com';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('access_token');
    this.websocket = null;
    this.wsCallbacks = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
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

  async validateToken() {
    if (!this.token) return false;
    try {
      await this.request('/protected');
      return true;
    } catch (error) {
      this.removeToken();
      return false;
    }
  }

  async uploadFiles(files) {
    return this.uploadFilesWithProgress(files);
  }

  async runAIAnalysis() {
    return this.request('/run-ai-analysis', {
      method: 'POST',
    });
  }

  async healthCheck() {
    return this.request('/');
  }

  // WebSocket Methods
  connectWebSocket(userId, callbacks = {}) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const wsUrl = `${WS_BASE_URL}/ws/${userId}`;
    this.websocket = new WebSocket(wsUrl);
    
    this.websocket.onopen = (event) => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      if (callbacks.onOpen) callbacks.onOpen(event);
    };
    
    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
        
        // Call specific callback based on message type
        const callback = this.wsCallbacks.get(data.type) || callbacks.onMessage;
        if (callback) {
          callback(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.websocket.onclose = (event) => {
      console.log('WebSocket disconnected');
      if (callbacks.onClose) callbacks.onClose(event);
      
      // Auto-reconnect logic
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
          this.connectWebSocket(userId, callbacks);
        }, 2000 * this.reconnectAttempts);
      }
    };
    
    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (callbacks.onError) callbacks.onError(error);
    };
  }
  
  disconnectWebSocket() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
  
  sendWebSocketMessage(message) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }
  
  onWebSocketMessage(type, callback) {
    this.wsCallbacks.set(type, callback);
  }
  
  removeWebSocketCallback(type) {
    this.wsCallbacks.delete(type);
  }

  // Enhanced upload with real-time progress
  async uploadFilesWithProgress(files, progressCallback, investorPreferences = null) {
    const formData = new FormData();
    
    if (files instanceof FileList || Array.isArray(files)) {
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }

    // Add investor preferences if provided
    if (investorPreferences) {
      formData.append('investor_preferences', JSON.stringify(investorPreferences));
    }

    // Setup progress tracking via WebSocket
    if (progressCallback) {
      this.onWebSocketMessage('analysis_progress', progressCallback);
      this.onWebSocketMessage('analysis_completed', progressCallback);
      this.onWebSocketMessage('analysis_error', progressCallback);
    }

    // Use V2 comprehensive analysis endpoint
    return this.request('/api/v2/comprehensive-analysis', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  }

  // V2 API Methods
  async getComprehensiveAnalysis(analysisId) {
    return this.request(`/api/v2/analysis/${analysisId}`);
  }

  async saveInvestorPreferences(preferences) {
    return this.request('/api/v2/investor-preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  async getInvestorPreferences() {
    return this.request('/api/v2/investor-preferences');
  }

  // Legacy upload method for backward compatibility
  async uploadFilesLegacy(files, progressCallback) {
    const formData = new FormData();
    
    if (files instanceof FileList || Array.isArray(files)) {
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }

    // Setup progress tracking via WebSocket
    if (progressCallback) {
      this.onWebSocketMessage('analysis_progress', progressCallback);
      this.onWebSocketMessage('analysis_completed', progressCallback);
      this.onWebSocketMessage('analysis_error', progressCallback);
    }

    return this.request('/upload-files', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  }

  // Market intelligence methods
  async getMarketIntelligence(companyName, sector) {
    return this.request(`/market-intelligence?company=${encodeURIComponent(companyName)}&sector=${encodeURIComponent(sector)}`);
  }

  async getCompetitiveAnalysis(companyData) {
    return this.request('/competitive-analysis', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  // Enhanced analysis methods
  async getAnalysisInsights(analysisId) {
    return this.request(`/analysis/${analysisId}/insights`);
  }

  async getPredictiveAnalytics(analysisData) {
    return this.request('/predictive-analytics', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
  }

  // Export methods
  async exportAnalysis(analysisId, format = 'pdf') {
    return this.request(`/export/${analysisId}?format=${format}`, {
      method: 'GET',
    });
  }

  // Live metrics
  async getLiveMetrics() {
    return this.request('/metrics/live');
  }

  // Notification methods
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  // Chat methods
  async sendChatMessage(message, context = null) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context
      }),
    });
  }

  async getChatSuggestions() {
    return this.request('/chat/suggestions');
  }

  // Report history methods
  async getReportHistory() {
    return this.request('/reports');
  }

  async deleteReport(reportId) {
    return this.request(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  }
}

const apiService = new ApiService();
export default apiService;
