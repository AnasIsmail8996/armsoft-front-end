import { createSlice } from '@reduxjs/toolkit';

const getInitialMode = () => {
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme;
        }
    } catch (error) {
        // Ignore storage errors and fallback to light mode.
    }

    return 'light';
};

const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        mode: getInitialMode(),
    },
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
            try {
                localStorage.setItem('theme', state.mode);
            } catch (error) {
                // Ignore storage errors.
            }
        },
        setTheme: (state, action) => {
            if (action.payload !== 'light' && action.payload !== 'dark') {
                return;
            }

            state.mode = action.payload;
            try {
                localStorage.setItem('theme', state.mode);
            } catch (error) {
                // Ignore storage errors.
            }
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
