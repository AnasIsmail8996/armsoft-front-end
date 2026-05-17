import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postsAPI } from '../../services/api';

const normalizeError = (error, fallbackMessage) =>
    error?.response?.data || { message: fallbackMessage };

const extractPosts = (payload) => payload?.data ?? [];

export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
        try {
            const response = await postsAPI.getAllPosts(page, limit);
            return response.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error, 'Failed to fetch posts'));
        }
    }
);

export const fetchUserPosts = createAsyncThunk(
    'posts/fetchUserPosts',
    async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await postsAPI.getUserPosts(userId, page, limit);
            return response.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error, 'Failed to fetch user posts'));
        }
    }
);

export const fetchPostById = createAsyncThunk(
    'posts/fetchPostById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await postsAPI.getPostById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error, 'Failed to fetch post'));
        }
    }
);

export const createPost = createAsyncThunk(
    'posts/createPost',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await postsAPI.createPost(formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error, 'Failed to create post'));
        }
    }
);

export const updatePost = createAsyncThunk(
    'posts/updatePost',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await postsAPI.updatePost(id, formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error, 'Failed to update post'));
        }
    }
);

export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async (id, { rejectWithValue }) => {
        try {
            await postsAPI.deletePost(id);
            return id;
        } catch (error) {
            return rejectWithValue(normalizeError(error, 'Failed to delete post'));
        }
    }
);

export const likePost = createAsyncThunk(
    'posts/likePost',
    async (id, { rejectWithValue }) => {
        try {
            const response = await postsAPI.likePost(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error, 'Failed to like post'));
        }
    }
);

export const unlikePost = createAsyncThunk(
    'posts/unlikePost',
    async (id, { rejectWithValue }) => {
        try {
            const response = await postsAPI.unlikePost(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error, 'Failed to unlike post'));
        }
    }
);

export const addComment = createAsyncThunk(
    'posts/addComment',
    async ({ id, text }, { rejectWithValue }) => {
        try {
            const response = await postsAPI.addComment(id, { text });
            return response.data;
        } catch (error) {
            return rejectWithValue(normalizeError(error, 'Failed to add comment'));
        }
    }
);

const initialState = {
    posts: [],
    userPosts: [],
    currentPost: null,
    loading: false,
    error: null,
    success: false,
    message: '',
    pagination: {
        page: 1,
        limit: 10,
        totalPages: 1,
        totalPosts: 0,
    },
};

const replacePost = (list, post) => {
    const index = list.findIndex((item) => item._id === post._id);
    if (index === -1) {
        return [post, ...list];
    }

    const nextList = [...list];
    nextList[index] = post;
    return nextList;
};

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = extractPosts(action.payload);
                state.pagination = {
                    page: action.meta?.arg?.page ?? 1,
                    limit: action.meta?.arg?.limit ?? 10,
                    totalPages: Math.max(1, Math.ceil((action.payload?.totalPosts || state.posts.length || 0) / (action.meta?.arg?.limit ?? 10))),
                    totalPosts: action.payload?.totalPosts ?? state.posts.length,
                };
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch posts';
            })
            .addCase(fetchUserPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.userPosts = extractPosts(action.payload);
                state.pagination = {
                    page: action.meta?.arg?.page ?? 1,
                    limit: action.meta?.arg?.limit ?? 10,
                    totalPages: Math.max(1, Math.ceil((action.payload?.totalPosts || state.userPosts.length || 0) / (action.meta?.arg?.limit ?? 10))),
                    totalPosts: action.payload?.totalPosts ?? state.userPosts.length,
                };
            })
            .addCase(fetchUserPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch user posts';
            })
            .addCase(fetchPostById.fulfilled, (state, action) => {
                state.currentPost = action.payload?.data ?? null;
            })
            .addCase(createPost.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.loading = false;
                const createdPost = action.payload?.data;
                if (createdPost) {
                    state.posts = [createdPost, ...state.posts];
                    state.userPosts = [createdPost, ...state.userPosts];
                    state.currentPost = createdPost;
                }
                state.success = true;
                state.message = action.payload?.message || 'Post created successfully';
            })
            .addCase(createPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to create post';
            })
            .addCase(updatePost.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                state.loading = false;
                const updatedPost = action.payload?.data;
                if (updatedPost) {
                    state.posts = replacePost(state.posts, updatedPost);
                    state.userPosts = replacePost(state.userPosts, updatedPost);
                    if (state.currentPost?._id === updatedPost._id) {
                        state.currentPost = updatedPost;
                    }
                }
                state.success = true;
                state.message = action.payload?.message || 'Post updated successfully';
            })
            .addCase(updatePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update post';
            })
            .addCase(deletePost.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = state.posts.filter((post) => post._id !== action.payload);
                state.userPosts = state.userPosts.filter((post) => post._id !== action.payload);
                state.success = true;
                state.message = 'Post deleted successfully';
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to delete post';
            })
            .addCase(likePost.fulfilled, (state, action) => {
                const updatedPost = action.payload?.data;
                if (!updatedPost) return;
                state.posts = replacePost(state.posts, updatedPost);
                state.userPosts = replacePost(state.userPosts, updatedPost);
                if (state.currentPost?._id === updatedPost._id) {
                    state.currentPost = updatedPost;
                }
            })
            .addCase(unlikePost.fulfilled, (state, action) => {
                const updatedPost = action.payload?.data;
                if (!updatedPost) return;
                state.posts = replacePost(state.posts, updatedPost);
                state.userPosts = replacePost(state.userPosts, updatedPost);
                if (state.currentPost?._id === updatedPost._id) {
                    state.currentPost = updatedPost;
                }
            })
            .addCase(addComment.fulfilled, (state, action) => {
                const updatedPost = action.payload?.data;
                if (!updatedPost) return;
                state.posts = replacePost(state.posts, updatedPost);
                state.userPosts = replacePost(state.userPosts, updatedPost);
                if (state.currentPost?._id === updatedPost._id) {
                    state.currentPost = updatedPost;
                }
            });
    },
});

export const { clearError, clearSuccess } = postsSlice.actions;
export const createPostAsync = createPost;
export const updatePostAsync = updatePost;
export const deletePostAsync = deletePost;
export const likePostAsync = likePost;
export const unlikePostAsync = unlikePost;
export const addCommentAsync = addComment;
// Also export raw thunk names for backwards compatibility with existing imports
export default postsSlice.reducer;