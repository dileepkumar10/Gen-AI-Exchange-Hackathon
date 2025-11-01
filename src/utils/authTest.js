// Test authentication persistence
export const testAuthPersistence = () => {
  console.log('=== Authentication Persistence Test ===');
  
  // Check if token exists in localStorage
  const token = localStorage.getItem('access_token');
  console.log('Token in localStorage:', token ? 'EXISTS' : 'NOT FOUND');
  
  if (token) {
    try {
      // Decode JWT payload (without verification - just for testing)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      console.log('Token expires:', new Date(payload.exp * 1000));
      console.log('Token valid:', payload.exp * 1000 > Date.now());
    } catch (error) {
      console.log('Token decode error:', error);
    }
  }
  
  console.log('=== End Test ===');
};

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  window.testAuth = testAuthPersistence;
}