// utils/auth.js - Client-side auth utility functions

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem('brainbeats_token');
    const user = localStorage.getItem('brainbeats_user');
    
    if (!token || !user) return false;
    
    // Optional: Check if token is expired by decoding JWT
    // This is a simple validation, not secure as token can be tampered with
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token is expired, clear local storage
        logout();
        return false;
      }
    } catch (e) {
      console.error("Error parsing token:", e);
      return false;
    }
    
    return true;
  };
  
  /**
   * Get user data from localStorage
   * @returns {object|null} User data or null if not logged in
   */
  export const getUserData = () => {
    if (!isAuthenticated()) return null;
    
    try {
      return JSON.parse(localStorage.getItem('brainbeats_user'));
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  };
  
  /**
   * Get authentication token
   * @returns {string|null} JWT token or null if not authenticated
   */
  export const getToken = () => {
    return localStorage.getItem('brainbeats_token');
  };
  
  /**
   * Log out user (client-side only)
   */
  export const logout = () => {
    localStorage.removeItem('brainbeats_token');
    localStorage.removeItem('brainbeats_user');
  };
  
  /**
   * Add auth header to fetch request config
   * @param {object} config - Fetch request config
   * @returns {object} Updated config with auth header
   */
  export const withAuth = (config = {}) => {
    const token = getToken();
    
    if (!token) return config;
    
    return {
      ...config,
      headers: {
        ...config.headers,
        'x-auth-token': token
      }
    };
  };
  
  /**
   * Redirect to login if not authenticated
   * @param {string} [redirectUrl='/html/loginPage.html'] - URL to redirect to
   */
  export const requireAuth = (redirectUrl = '/html/loginPage.html') => {
    if (!isAuthenticated()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  };