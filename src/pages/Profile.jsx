// Profile.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import PostCard from '../components/PostCard';
import styles from './Profile.module.css';
import "/src/index.css"
import { clearError, deletePost, fetchUserPosts } from '../redux/slices/postsSlice';

const Profile = () => {
    const dispatch = useDispatch();
    const { userId } = useParams();

    const { user: currentUser } = useSelector((state) => state.auth);
    const { userPosts, loading, error } = useSelector((state) => state.posts);

    const [activeTab, setActiveTab] = useState('posts');

    const effectiveUserId = userId === 'me' ? currentUser?._id : userId;

    useEffect(() => {
        if (effectiveUserId) {
            dispatch(fetchUserPosts({ userId: effectiveUserId, page: 1, limit: 30 }));
        }
    }, [dispatch, effectiveUserId]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const posts = useMemo(() => (Array.isArray(userPosts) ? userPosts : []), [userPosts]);

    const profileUser = useMemo(() => {
        return posts.length > 0 ? posts[0]?.userId : currentUser;
    }, [posts, currentUser]);

    const tabbedPosts = useMemo(() => {
        switch (activeTab) {
            case 'likes':
                return posts.filter((p) => (p?.likes?.length || 0) > 0);
            case 'comments':
                return posts.filter((p) => (p?.comments?.length || 0) > 0);
            case 'shared':
                return posts.slice(0, 5);
            default:
                return posts;
        }
    }, [activeTab, posts]);

    const stats = useMemo(() => ({
        posts: posts.length,
        likes: posts.reduce((sum, p) => sum + (p?.likes?.length || 0), 0),
        comments: posts.reduce((sum, p) => sum + (p?.comments?.length || 0), 0),
        followers: 1240 + posts.length * 5,
        following: 487,
    }), [posts]);

    const handleDeletePost = async (postId) => {
        try {
            await dispatch(deletePost(postId)).unwrap();
            toast.success('Post deleted successfully');
        } catch (err) {
            toast.error(err?.message || 'Failed to delete post');
        }
    };

    if (loading && posts.length === 0) {
        return (
            <div className={styles.loader}>
                <div className={styles.spinner} />
                <div className={styles.loaderText}>Loading profile...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                {/* Profile Header */}
                <div className={styles.profileHeader}>
                    <div className={styles.coverImage} />

                    <div className={styles.profileContent}>
                        <div className={styles.profileTopRow}>
                            <div className={styles.profileAvatar}>
                                {profileUser?.imageUrl ? (
                                    <img src={profileUser.imageUrl} alt={profileUser.name} />
                                ) : (
                                    profileUser?.name?.charAt(0)?.toUpperCase() || 'U'
                                )}
                            </div>

                            <div className={styles.profileNameBlock}>
                                <div className={styles.profileName}>{profileUser?.name}</div>
                                <div className={styles.profileEmail}>{profileUser?.email}</div>
                                <div className={styles.profileBio}>
                                    Building beautiful digital experiences
                                </div>
                            </div>

                            <button className={styles.followBtn}>Follow</button>
                        </div>

                        {/* Stats */}
                        <div className={styles.statsRow}>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{stats.posts}</div>
                                <div className={styles.statLabel}>Posts</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{stats.likes}</div>
                                <div className={styles.statLabel}>Likes</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{stats.comments}</div>
                                <div className={styles.statLabel}>Comments</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{stats.followers}</div>
                                <div className={styles.statLabel}>Followers</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{stats.following}</div>
                                <div className={styles.statLabel}>Following</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabsCard}>
                    {['posts', 'likes', 'comments', 'shared'].map((tab) => (
                        <button
                            key={tab}
                            className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Posts */}
                <div className={styles.postsList}>
                    {tabbedPosts.length > 0 ? (
                        tabbedPosts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                isOwnPost={post?.userId?._id === currentUser?._id}
                                onDelete={() => handleDeletePost(post._id)}
                                onEdit={() => toast.info('Edit coming soon')}
                            />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyTitle}>No content found</div>
                            <div className={styles.emptyDesc}>
                                Switch tabs or create more activity
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;