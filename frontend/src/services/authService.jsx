import apiClient from './api.jsx';

/**
 * Authentication Service
 * Handles user authentication operations
 */

/**
 * Login user
 */
export const login = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        
        if (response.success && response.data?.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Sign up new user
 */
export const signup = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register', userData);
        
        if (response.success && response.data?.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

/**
 * Get auth token
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

export default {
    login,
    signup,
    logout,
    getCurrentUser,
    isAuthenticated,
    getToken
};
