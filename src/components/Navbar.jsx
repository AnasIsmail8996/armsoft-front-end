// Navbar.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import styles from './Navbar.module.css';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

import { logoutUser } from '../redux/slices/authSlice';
import { toggleTheme } from '../redux/slices/themeSlice';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [mobileOpen, setMobileOpen] = useState(false);

    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { mode } = useSelector((state) => state.theme);

    const initials = useMemo(() => 
        user?.name?.slice(0, 1)?.toUpperCase() || 'U', [user?.name]
    );

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (err) {
            dispatch(logoutUser());
            navigate('/login');
        }
    };

    const navItems = [
        { label: 'Home', icon: <HomeOutlinedIcon />, path: '/' },
        { 
            label: 'Create', 
            icon: <AddCircleOutlineOutlinedIcon />, 
            path: '/home',
            show: isAuthenticated 
        },
        { 
            label: 'Profile', 
            icon: <PersonOutlineOutlinedIcon />, 
            path: `/profile/${user?._id || 'me'}`,
            show: isAuthenticated 
        },
    ];

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                {/* Logo */}
                <div className={styles.logo} onClick={() => navigate('/')}>
                    SocialHub
                </div>

                {/* Desktop Menu */}
                <div className={styles.navMenu}>
                    {navItems.map((item) => 
                        item.show !== false && (
                            <button
                                key={item.label}
                                className={styles.navLink}
                                onClick={() => navigate(item.path)}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        )
                    )}
                </div>

                {/* Right Side */}
                <div className={styles.authSection}>
                    {/* Theme Toggle */}
                    <button
                        className={styles.themeBtn}
                        onClick={() => dispatch(toggleTheme())}
                    >
                        {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
                    </button>

                    {isAuthenticated ? (
                        <>
                            <button className={styles.logoutBtn} onClick={handleLogout}>
                                Logout
                            </button>
                            <div 
                                className={styles.avatar}
                                onClick={() => navigate(`/profile/${user?._id || 'me'}`)}
                            >
                                {initials}
                            </div>
                        </>
                    ) : (
                        <button
                            className={styles.navLink}
                            style={{ background: 'var(--accent-primary)', color: 'white' }}
                            onClick={() => navigate('/login')}
                        >
                            <LoginOutlinedIcon style={{ fontSize: 20 }} />
                            Login
                        </button>
                    )}

                    {/* Mobile Menu Button */}
                    <button 
                        className={styles.mobileMenuBtn}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* Mobile Menu (Simple Dropdown) */}
            {mobileOpen && (
                <div style={{
                    background: 'var(--surface-base)',
                    borderTop: '1px solid var(--border-light)',
                    padding: '16px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    {navItems.map((item) => 
                        item.show !== false && (
                            <button
                                key={item.label}
                                className={styles.navLink}
                                style={{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }}
                                onClick={() => {
                                    navigate(item.path);
                                    setMobileOpen(false);
                                }}
                            >
                                {item.icon} {item.label}
                            </button>
                        )
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;