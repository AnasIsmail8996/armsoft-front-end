/**
 * Authentication Utilities
 * Handles secure token management and authentication logic
 */

/**
 * Token is stored in httpOnly cookies by backend for security
 * Frontend should NEVER directly manipulate the token
 * 
 * WHY httpOnly Cookies:
 * ✅ Protected from XSS attacks (JS can't access)
 * ✅ Automatically sent with requests (withCredentials)
 * ✅ Protected from CSRF with SameSite flag
 * ✅ Secure flag for HTTPS only
 */

/**
 * Check if user is authenticated
 * Uses Redux state as source of truth
 */
export const isAuthenticated = (authState) => {
    return authState?.isAuthenticated === true;
};

/**
 * Get current user from Redux
 */
export const getCurrentUser = (authState) => {
    return authState?.user || null;
};

/**
 * Check if auth check is in progress
 * Use this to show loading states in components
 */
export const isAuthLoading = (authState) => {
    return authState?.authLoading === true;
};

/**
 * Check if auth check is complete
 * Useful for conditional rendering
 */
export const isAuthChecked = (authState) => {
    return authState?.authChecked === true;
};

/**
 * Clear auth error from Redux state
 * Import from authSlice.actions
 */
export const handleAuthError = (error) => {
    console.error('Auth Error:', error);
    // Error handling is managed by Redux action handlers
    // Components can access error from Redux state
};

/**
 * Session validation helper
 * Checks if user session is still valid
 */
export const validateSession = async (authAPI) => {
    try {
        const response = await authAPI.getCurrentUser();
        return response.data.user;
    } catch (error) {
        console.error('Session validation failed:', error);
        return null;
    }
};

/**
 * Token refresh strategy (if needed)
 * Note: Since using httpOnly cookies, refresh is handled by backend
 * Backend can set both access and refresh tokens in cookies
 */
export const shouldRefreshToken = (error) => {
    // If 401 Unauthorized, token might be expired
    return error?.response?.status === 401;
};

/**
 * Logout helper
 * Clears Redux state, backend clears cookies
 */
export const handleLogout = (dispatch, logoutAction) => {
    dispatch(logoutAction());
    // Backend logout endpoint also clears httpOnly cookies
};

/**
 * SECURITY BEST PRACTICES IMPLEMENTED:
 * 
 * 1. Token Storage:
 *    ✅ httpOnly cookie (not accessible via JavaScript)
 *    ✅ Automatic with axios withCredentials
 *    ✅ Not stored in localStorage (XSS safe)
 * 
 * 2. Request Handling:
 *    ✅ axios withCredentials: true
 *    ✅ Token auto-sent in requests
 *    ✅ No manual Authorization header needed
 * 
 * 3. State Management:
 *    ✅ Redux state persisted via redux-persist
 *    ✅ User data cached in Redux
 *    ✅ Survives page refresh
 * 
 * 4. Auth Check:
 *    ✅ fetchCurrentUser on app mount
 *    ✅ Validates token via /auth/user endpoint
 *    ✅ Rehydrates user from localStorage on refresh
 *    ✅ Shows loading state during check
 * 
 * 5. CSRF Protection:
 *    ✅ Backend sets SameSite=Strict on cookies
 *    ✅ Backend implements CSRF tokens if needed
 * 
 * 6. Protected Routes:
 *    ✅ PrivetRoute checks Redux state
 *    ✅ Waits for authLoading to complete
 *    ✅ Redirects if not authenticated
 */

export default {
    isAuthenticated,
    getCurrentUser,
    isAuthLoading,
    isAuthChecked,
    handleAuthError,
    validateSession,
    shouldRefreshToken,
    handleLogout,
};
