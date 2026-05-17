// Home.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import PostCard from '../components/PostCard';
import styles from './Home.module.css';

import {
    clearError,
    clearSuccess,
    createPost,
    deletePost,
    fetchPosts,
} from '../redux/slices/postsSlice';

const suggestedUsers = [
    { id: 1, name: 'Ariana Khan', tag: '@ariana.design' },
    { id: 2, name: 'David Noor', tag: '@david.dev' },
    { id: 3, name: 'Sara Malik', tag: '@sara.photo' },
];

const trendingTopics = ['#ReactJS', '#WebDesign', '#NodeBackend', '#CareerTips', '#MERNStack'];

const Home = () => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const { user } = useSelector((state) => state.auth);
    const { posts, loading, error, success, message } = useSelector((state) => state.posts);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        dispatch(fetchPosts({ page: 1, limit: 20 }));
    }, [dispatch]);

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

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }
        setSelectedFile(file);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedFile(null);
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
        } catch (err) {
            toast.error(err?.message || 'Failed to create post');
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await dispatch(deletePost(postId)).unwrap();
            toast.success('Post deleted');
        } catch (err) {
            toast.error(err?.message || 'Failed to delete post');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                {/* LEFT COLUMN - FEED */}
                <div>
                    {/* Welcome Banner */}
                    <div className={styles.welcomeBanner}>
                        <h1 className={styles.welcomeTitle}>
                            Welcome back, <em>{user?.name?.split(' ')[0] || 'Creator'}</em>
                        </h1>
                        <p className={styles.welcomeSub}>
                            Share updates, ideas, and stories with your network.
                        </p>
                        <div className={styles.welcomeTags}>
                            <span className={styles.tag}>Social Feed</span>
                            <span className={`${styles.tag} ${styles.tagOutline}`}>Realtime</span>
                            <span className={`${styles.tag} ${styles.tagOutline}`}>Creators</span>
                        </div>
                    </div>

                    {/* Create Post */}
                    <form onSubmit={handleCreatePost} className={styles.createPost}>
                        <div className={styles.createHeader}>
                            <h2>Create Post</h2>
                            <div className={styles.createDot} />
                        </div>

                        <input
                            type="text"
                            className={styles.field}
                            placeholder="Post Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            className={`${styles.field} ${styles.fieldTextarea}`}
                            placeholder="What's on your mind?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
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
                                📷 Upload Image
                            </button>

                            {selectedFile && (
                                <div className={styles.selectedFile}>
                                    Selected: {selectedFile.name}
                                </div>
                            )}

                            <button
                                type="submit"
                                className={styles.publishBtn}
                                disabled={loading}
                            >
                                {loading ? 'Posting...' : 'Publish Now'}
                            </button>
                        </div>
                    </form>

                    {/* Feed */}
                    <div className={styles.feedGrid}>
                        {posts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                isOwnPost={post?.userId?._id === user?._id}
                                onDelete={() => handleDeletePost(post._id)}
                                onEdit={() => toast.info('Edit feature coming soon')}
                            />
                        ))}
                    </div>

                    {/* Empty State */}
                    {!loading && posts.length === 0 && (
                        <div className={styles.emptyState}>
                            <h3>No posts yet</h3>
                            <p>Be the first to share something amazing!</p>
                        </div>
                    )}

                    {loading && posts.length === 0 && (
                        <div className={styles.loadingState}>
                            <p>Loading your feed...</p>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN - SIDEBAR */}
                <div className={styles.sidebar}>
                    {/* Suggested Users */}
                    <div className={styles.sideCard}>
                        <div className={styles.sideCardTitle}>Suggested Creators</div>
                        {suggestedUsers.map((item) => (
                            <div key={item.id} className={styles.userRow}>
                                <div className={styles.userMeta}>
                                    <div className={styles.userAvatar}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className={styles.userName}>{item.name}</div>
                                        <div className={styles.userTag}>{item.tag}</div>
                                    </div>
                                </div>
                                <button className={styles.followBtn}>Follow</button>
                            </div>
                        ))}
                    </div>

                    {/* Trending */}
                    <div className={styles.sideCard}>
                        <div className={styles.sideCardTitle}>Trending Now</div>
                        <div className={styles.trendList}>
                            {trendingTopics.map((topic) => (
                                <a key={topic} href="#" className={styles.trendItem}>
                                    <span className={styles.trendHash}>{topic}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className={styles.footerNote}>
                        SocialHub © {new Date().getFullYear()} • Made with ❤️
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;