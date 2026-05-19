// Landing.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, deletePost, fetchPosts, updatePost } from '../redux/slices/postsSlice';
import { toast } from 'react-toastify';
import PostCard from '../components/PostCard';
import styles from './Landing.module.css';

const Landing = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { posts, loading, error } = useSelector((state) => state.posts);

    // Edit States
    const [editingPost, setEditingPost] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editImage, setEditImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // (removed unused local variables)

    useEffect(() => {
        dispatch(fetchPosts({ page: 1, limit: 6 }));
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Open Edit
    const handleEditClick = (post) => {
        if (!isAuthenticated) return navigate('/login');

        setEditingPost(post);
        setEditContent(post.content || '');
        setEditImage(null);
        setPreviewImage(post.image || '');
    };

    // Image Change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Update Post
    const handleUpdatePost = async (e) => {
        e.preventDefault();
        if (!editingPost || !editContent.trim()) return;

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('content', editContent);

        if (editImage) {
            formData.append('image', editImage);
        }

        try {
            await dispatch(updatePost({
                id: editingPost._id,
                formData
            })).unwrap();

            toast.success('Post updated successfully!');
            cancelEdit();                    // Close modal
            dispatch(fetchPosts({ page: 1, limit: 6 })); // Refresh
        } catch (err) {
            toast.error(err?.message || 'Failed to update post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancelEdit = () => {
        setEditingPost(null);
        setEditImage(null);
        setPreviewImage('');
    };

    const handleDeletePost = async (postId) => {
        if (!isAuthenticated) return navigate('/login');

        try {
            await dispatch(deletePost(postId)).unwrap();
            toast.success('Post deleted successfully');
        } catch (err) {
            toast.error(err?.message || 'Failed to delete post');
        }
    };

    return (
        <div className={styles.container}>
            {/* Hero Section (unchanged) */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <span className={styles.eyebrow}>
                        Connect • Share • Grow
                    </span>

                    <h1 className={styles.title}>
                        Build your <span className={styles.titleAccent}>social world</span> with meaningful connections.
                    </h1>

                    <p className={styles.subtitle}>
                        Share moments, connect with creators, explore trending content,
                        and grow your community with a modern social platform built for everyone.
                    </p>

                    <div className={styles.ctaButtons}>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                        >
                            Get Started
                        </button>

                        <button
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={() => navigate('/home')}
                        >
                            Explore Feed
                        </button>
                    </div>
                </div>

                <div className={styles.heroImage}>
                    <div className={styles.heroCard}>

                        <div className={styles.heroCardItem}>
                            <div
                                className={styles.heroCardAvatar}
                                style={{ background: '#6c63ff' }}
                            >
                                A
                            </div>

                            <div className={styles.heroCardText}>
                                <strong>Alex Johnson</strong>
                                <span>Posted a new design</span>
                            </div>

                            <div className={styles.heroCardBadge}>
                                Trending
                            </div>
                        </div>

                        <div className={styles.heroCardItem}>
                            <div
                                className={styles.heroCardAvatar}
                                style={{ background: '#ff6b9d' }}
                            >
                                S
                            </div>

                            <div className={styles.heroCardText}>
                                <strong>Sophia Lee</strong>
                                <span>Shared a new story</span>
                            </div>

                            <div className={styles.heroCardBadge}>
                                Live
                            </div>
                        </div>

                        <div className={styles.heroCardItem}>
                            <div
                                className={styles.heroCardAvatar}
                                style={{ background: '#38d9a9' }}
                            >
                                M
                            </div>

                            <div className={styles.heroCardText}>
                                <strong>Michael Ray</strong>
                                <span>Started following you</span>
                            </div>

                            <div className={styles.heroCardBadge}>
                                New
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Feed Section */}
            <section className={styles.features}>
                <div className={styles.sectionLabel}>COMMUNITY FEED</div>
                <h2 className={styles.sectionTitle}>Explore Latest Posts</h2>

                {loading && <p>Loading posts...</p>}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
                    {posts?.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            isOwnPost={isAuthenticated && user?._id === post.userId?._id}
                            onDelete={() => handleDeletePost(post._id)}
                            onEdit={() => handleEditClick(post)}
                        />
                    ))}
                </div>
            </section>

            {/* Edit Modal */}
            {editingPost && (
                <div className={styles.editModalOverlay}>
                    <div className={styles.editModal}>
                        <h3>Edit Post</h3>

                        <form onSubmit={handleUpdatePost}>
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="What's on your mind?"
                                rows={6}
                                required
                            />

                            <div className={styles.imageUploadArea}>
                                <label>Change Image (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {previewImage && (
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        className={styles.imagePreview}
                                    />
                                )}
                            </div>

                            <div className={styles.modalButtons}>
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className={styles.btnGhost}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.btnPrimary}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Landing;