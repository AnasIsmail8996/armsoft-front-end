import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import styles from './Dashboard.module.css';   

import {
    createPost,
    deletePost,
    fetchPosts,
    fetchUserPosts,
    clearError,
    clearSuccess,
} from '../../redux/slices/postsSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const { posts, userPosts, loading, error, success, message } = useSelector((state) => state.posts);
    const { user } = useSelector((state) => state.auth);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        dispatch(fetchPosts({ page: 1, limit: 20 }));
        if (user?._id) {
            dispatch(fetchUserPosts({ userId: user._id, page: 1, limit: 20 }));
        }
    }, [dispatch, user?._id]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    useEffect(() => {
        if (success && message) {
            toast.success(message);
            dispatch(clearSuccess());
        }
    }, [success, message, dispatch]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Only image files allowed');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            toast.error('Title and description are required');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            if (selectedFile) formData.append('image', selectedFile);

            await dispatch(createPost(formData)).unwrap();
            resetForm();
            toast.success('Post created successfully!');
        } catch (err) {
            toast.error(err?.message || 'Failed to create post');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await dispatch(deletePost(postId)).unwrap();
            toast.success('Post deleted');
        } catch (err) {
            toast.error(err?.message || 'Failed to delete post');
        }
    };

    const ownPosts = userPosts.length ? userPosts : posts.filter(p => p?.userId?._id === user?._id);

    return (
        <div className={styles.dashboard}>
            <div className={styles.container}>

                {/* Welcome Header */}
                <div className={styles.welcomeBanner}>
                    <h1>Welcome back, <span>{user?.name?.split(' ')[0] || 'Creator'}</span> 👋</h1>
                    <p>Manage your posts and share new moments with the community.</p>
                </div>

                {/* Create Post Card */}
                <div className={styles.createCard}>
                    <h2 className={styles.sectionTitle}>Create New Post</h2>

                    <form onSubmit={handleCreatePost}>
                        <input
                            type="text"
                            className={styles.field}
                            placeholder="Post Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        <textarea
                            className={`${styles.field} ${styles.textarea}`}
                            placeholder="What's happening?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleFileChange}
                        />

                        <div className={styles.createActions}>
                            <button
                                type="button"
                                className={styles.uploadBtn}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                📸 Upload Photo
                            </button>

                            <button
                                type="submit"
                                className={styles.publishBtn}
                                disabled={loading || !title.trim() || !description.trim()}
                            >
                                {loading ? 'Posting...' : 'Publish Post'}
                            </button>
                        </div>
                    </form>

                    {previewUrl && (
                        <div className={styles.preview}>
                            <img src={previewUrl} alt="preview" />
                        </div>
                    )}
                </div>

                <div className={styles.grid}>
                    {/* My Posts */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>My Posts ({ownPosts.length})</h3>
                        
                        <div className={styles.postsList}>
                            {ownPosts.length > 0 ? (
                                ownPosts.map(post => (
                                    <div key={post._id} className={styles.postItem}>
                                        <div className={styles.postHeader}>
                                            <h4>{post.title}</h4>
                                            <button 
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeletePost(post._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <p className={styles.postDesc}>{post.description}</p>
                                        {post.image && <img src={post.image} alt="" className={styles.postImage} />}
                                    </div>
                                ))
                            ) : (
                                <p className={styles.empty}>You haven't posted anything yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Community Feed Snapshot */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Community Feed</h3>
                        <div className={styles.postsList}>
                            {posts.slice(0, 5).map(post => (
                                <div key={post._id} className={styles.feedItem}>
                                    <strong>{post.title}</strong>
                                    <p>{post.description?.substring(0, 120)}...</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;