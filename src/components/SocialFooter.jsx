// SocialFooter.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import styles from './Footer.module.css';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const SocialFooter = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState(0);

    const handleNavClick = (index, path) => {
        setActiveTab(index);
        navigate(path);
    };

    return (
        <>
            {/* Desktop Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerLeft}>
                        © {new Date().getFullYear()} SocialHub • Made with ❤️ for creators
                    </div>

                    <div className={styles.footerLinks}>
                        <span 
                            className={styles.footerLink}
                            onClick={() => navigate('/')}
                        >
                            Home
                        </span>
                        <span 
                            className={styles.footerLink}
                            onClick={() => navigate('/home')}
                        >
                            Feed
                        </span>
                        <span 
                            className={styles.footerLink}
                            onClick={() => navigate(`/profile/${user?._id || 'me'}`)}
                        >
                            Profile
                        </span>
                        <span 
                            className={styles.footerLink}
                            onClick={() => navigate(isAuthenticated ? '/home' : '/login')}
                        >
                            Create Post
                        </span>
                    </div>
                </div>
            </footer>

            {/* Mobile Bottom Navigation */}
            <div className={styles.mobileBottomNav}>
                <div className={styles.navContainer}>
                    <div 
                        className={`${styles.navItem} ${activeTab === 0 ? styles.active : ''}`}
                        onClick={() => handleNavClick(0, '/')}
                    >
                        <HomeOutlinedIcon />
                        <span>Home</span>
                    </div>

                    <div 
                        className={`${styles.navItem} ${activeTab === 1 ? styles.active : ''}`}
                        onClick={() => handleNavClick(1, '/home')}
                    >
                        <AddCircleOutlineOutlinedIcon />
                        <span>Create</span>
                    </div>

                    <div 
                        className={`${styles.navItem} ${activeTab === 2 ? styles.active : ''}`}
                        onClick={() => handleNavClick(2, `/profile/${user?._id || 'me'}`)}
                    >
                        <PersonOutlineOutlinedIcon />
                        <span>Profile</span>
                    </div>

                    <div 
                        className={`${styles.navItem} ${activeTab === 3 ? styles.active : ''}`}
                        onClick={() => handleNavClick(3, '/home')}
                    >
                        <NotificationsNoneOutlinedIcon />
                        <span>Alerts</span>
                    </div>

                    <div 
                        className={`${styles.navItem} ${activeTab === 4 ? styles.active : ''}`}
                        onClick={() => handleNavClick(4, '/home')}
                    >
                        <SettingsOutlinedIcon />
                        <span>More</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SocialFooter;