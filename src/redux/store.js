// redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import postsReducer from "./slices/postsSlice";
import themeReducer from "./slices/themeSlice";

// Persist config for auth state
const authPersistConfig = {
    key: "auth",
    storage,
    whitelist: ["user", "isAuthenticated"], // Persist these fields
    blacklist: ["token", "loading", "error", "success", "message"], // Don't persist these
};

// Persist config for theme state
const themePersistConfig = {
    key: "theme",
    storage,
    whitelist: ["mode"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);

const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        posts: postsReducer,
        theme: persistedThemeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    "persist/PERSIST",
                    "persist/REHYDRATE",
                    "persist/PAUSE",
                    "persist/PURGE",
                    "persist/REGISTER",
                    "persist/FLUSH",
                ],
                ignoredPaths: ["persist"],
            },
        }),
});

export const persistor = persistStore(store);

export default store;