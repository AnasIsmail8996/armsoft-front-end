import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASE_URI || "http://localhost:3000/api";

axios.defaults.withCredentials = true;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        config.withCredentials = true;
        if (config.data instanceof FormData && config.headers) {
            delete config.headers['Content-Type'];
            delete config.headers['content-type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export const authAPI = {
    register: (data) => apiClient.post("/auth/register", data),
    login: (data) => apiClient.post("/auth/login", data),
    logout: () => apiClient.post("/auth/logout"),
    verifyOTP: (email, otp) => apiClient.post("/auth/otp-verify", { email, otp }),
    resendOTP: (email) => apiClient.post("/auth/otp-reset", { email }),
    forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
    changePassword: (token, newPassword) => apiClient.post("/auth/change-password", { token, newPassword }),
    getCurrentUser: () => apiClient.get("/auth/user"),
};

export const imageAPI = {
    uploadImage: (formData) => apiClient.post("/file/upload", formData),
};

export const postsAPI = {
    createPost: (data) => apiClient.post("/posts/create", data),
    getAllPosts: (page = 1, limit = 10) => apiClient.get(`/posts?page=${page}&limit=${limit}`),
    getPostById: (id) => apiClient.get(`/posts/${id}`),
    updatePost: (id, data) => apiClient.put(`/posts/update/${id}`, data),
    deletePost: (id) => apiClient.delete(`/posts/delete/${id}`),
    likePost: (id) => apiClient.put(`/posts/like/${id}`),
    unlikePost: (id) => apiClient.put(`/posts/like/${id}`),
    addComment: (id, data) => apiClient.post(`/posts/comment/${id}`, data),
    getPostComments: (id) => apiClient.get(`/posts/comments/${id}`),
    getUserPosts: (userId, page = 1, limit = 10) => apiClient.get(`/posts/user/${userId}?page=${page}&limit=${limit}`),
};

export default apiClient;