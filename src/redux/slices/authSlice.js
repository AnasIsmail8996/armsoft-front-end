import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

const clearSessionStorage = () => {
    try {
        const savedTheme = localStorage.getItem('theme');
        localStorage.clear();
        if (savedTheme) {
            localStorage.setItem('theme', savedTheme);
        }
    } catch (error) {
        // Ignore storage errors.
    }
};

// Async Thunks
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authAPI.register(userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: 'Registration failed' }
            );
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authAPI.login(credentials);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: 'Login failed' }
            );
        }
    }
);

export const verifyOTP = createAsyncThunk(
    'auth/verifyOTP',
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const response = await authAPI.verifyOTP(email, otp);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: 'OTP verification failed' }
            );
        }
    }
);

export const resendOTP = createAsyncThunk(
    'auth/resendOTP',
    async (email, { rejectWithValue }) => {
        try {
            const response = await authAPI.resendOTP(email);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: 'Failed to resend OTP' }
            );
        }
    }
);

export const forgotPasswordRequest = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await authAPI.forgotPassword(email);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: 'Failed to send reset link' }
            );
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async ({ token, newPassword }, { rejectWithValue }) => {
        try {
            const response = await authAPI.changePassword(token, newPassword);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: 'Failed to change password' }
            );
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.logout();
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: 'Logout failed' }
            );
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.getCurrentUser();
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: 'Failed to load current user' }
            );
        }
    }
);

// Initial State
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    authChecked: false,
    authLoading: true, // True until auth check completes
    loading: false,
    error: null,
    success: false,
    message: '',
};

// Auth Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
            state.message = '';
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.authChecked = true;
            state.success = false;
            state.message = '';
            clearSessionStorage();
        },
    },
    extraReducers: (builder) => {
        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
                state.authChecked = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Registration failed';
            });

        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.message = action.payload.message;
                state.authChecked = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Login failed';
            });

        // Verify OTP
        builder
            .addCase(verifyOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
                state.authChecked = true;
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'OTP verification failed';
            });

        // Resend OTP
        builder
            .addCase(resendOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resendOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
            })
            .addCase(resendOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to resend OTP';
            });

        // Forgot Password
        builder
            .addCase(forgotPasswordRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotPasswordRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
            })
            .addCase(forgotPasswordRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to send reset link';
            });

        // Change Password
        builder
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to change password';
            });
        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.authChecked = true;
                state.success = true;
                state.message = 'Logged out successfully';
                clearSessionStorage();
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Logout failed';
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.authChecked = true;
                clearSessionStorage();
            })
            .addCase(fetchCurrentUser.pending, (state) => {
                state.authLoading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.authLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.authChecked = true;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.authLoading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.authChecked = true;
                state.error = null;
            });
    },
});

export const { clearError, clearSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
