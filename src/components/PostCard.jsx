// PostCard.jsx
import React, { useMemo, useState } from 'react';
import styles from './PostCard.module.css';

import { useDispatch, useSelector } from 'react-redux';
import {
    addCommentAsync,
    likePostAsync,
    unlikePostAsync,
    updatePost,
} from '../redux/slices/postsSlice';

import { toast } from 'react-toastify';

const PostCard = ({ post, isOwnPost, onDelete, onEdit }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);

    const isLiked = useMemo(
        () => post?.likes?.some((u) => u?._id === user?._id),
        [post?.likes, user?._id]
    );

    const formatDate = (date) => {
        if (!date) return 'Now';
        const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const handleEditClick = async () => {
        if (onEdit) return onEdit();

        const newTitle = window.prompt('Edit title', post?.title || '');
        if (newTitle === null) return;
        const newDesc = window.prompt('Edit description', post?.description || '');
        if (newDesc === null) return;

        try {
            await dispatch(updatePost({ id: post._id, data: { title: newTitle.trim(), description: newDesc.trim() } })).unwrap();
            toast.success('Post updated successfully');
        } catch (err) {
            toast.error(err?.message || 'Failed to update post');
        }
    };

    const handleLikeToggle = async () => {
        try {
            if (isLiked) {
                await dispatch(unlikePostAsync(post._id)).unwrap();
            } else {
                await dispatch(likePostAsync(post._id)).unwrap();
            }
        } catch (error) {
            toast.error(error?.message || 'Error');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            await dispatch(
                addCommentAsync({
                    id: post._id,
                    text: commentText,
                })
            ).unwrap();
            toast.success('Comment posted successfully');
            setCommentText('');
        } catch (error) {
            toast.error(error?.message);
        }
    };

    return (
        <div className={styles.card}>
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.authorRow}>
                    <div className={styles.avatar}>
                        {post?.userId?.imageUrl ? (
                            <img src={post.userId.imageUrl} alt={post.userId.name} />
                        ) : (
                            post?.userId?.name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div>
                        <div className={styles.authorName}>{post?.userId?.name}</div>
                        <div className={styles.authorTime}>{formatDate(post?.createdAt)}</div>
                    </div>
                </div>

                {isOwnPost && (
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn} onClick={handleEditClick}>
                            ✏️
                        </button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={onDelete}>
                            🗑️
                        </button>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className={styles.body}>
                <div className={styles.postTitle}>{post?.title}</div>
                <div className={styles.postDesc}>{post?.description}</div>
            </div>

            {/* IMAGE */}
            {post?.image && (
                <img
                    src={post.image}
                    alt="post"
                    className={styles.postImage}
                />
            )}

            {/* STATS */}
            <div className={styles.actions}>
                <div className={styles.actionGroup}>
                    <span>{post?.likes?.length || 0} Likes</span>
                </div>
                <div className={styles.actionGroup}>
                    <span>{post?.comments?.length || 0} Comments</span>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className={styles.actions} style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <button
                    className={`${styles.actionBtn} ${isLiked ? styles.actionBtnLiked : ''}`}
                    onClick={handleLikeToggle}
                >
                    ❤️ Like
                </button>

                <button
                    className={styles.actionBtn}
                    onClick={() => setShowComments(!showComments)}
                >
                    💬 Comment
                </button>

                <button className={styles.actionBtn}>🔗 Share</button>
            </div>

            {/* COMMENTS SECTION */}
            {showComments && (
                <div className={styles.comments}>
                    <div className={styles.commentsList}>
                        {post?.comments?.length > 0 ? (
                            post.comments.map((comment, index) => (
                                <div key={index} className={styles.commentItem}>
                                    <div className={styles.commentAvatar}>
                                        {comment?.userId?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className={styles.commentBubble}>
                                        <div className={styles.commentAuthor}>
                                            {comment?.userId?.name}
                                        </div>
                                        <div className={styles.commentText}>{comment?.text}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noComments}>No comments yet. Be the first!</div>
                        )}
                    </div>

                    <form className={styles.commentForm} onSubmit={handleComment}>
                        <input
                            type="text"
                            className={styles.commentInput}
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button type="submit" className={styles.commentSubmit}>
                            Post
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;