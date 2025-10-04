"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [isActive, setIsActive] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await authClient.getSession();
        if (session && 'data' in session && session.data) {
          setUser(session.data.user || null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  // Handle logout
  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth <= 992 && isActive) {
        const sidebar = document.querySelector(`.${styles.sidebar}`);
        const menuToggle = document.querySelector('.menu-icon-toggle');

        if (sidebar && !sidebar.contains(event.target as Node) && 
            menuToggle && !menuToggle.contains(event.target as Node)) {
          setIsActive(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isActive]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setIsActive(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main menu items
  const menuItems = [
    { path: '/home', icon: 'fas fa-home', label: 'Home' },
    { path: '/shows', icon: 'fas fa-tv', label: 'Shows' },
    { path: '/myStuff', icon: 'fas fa-folder', label: 'My Stuff' },
    { path: '/myShows', icon: 'fas fa-tv', label: 'My Shows' },
    { path: '/explore-review', icon: 'fas fa-search', label: 'Explore Reviews' },
    { path: '/settings', icon: 'fas fa-cog', label: 'Settings' }
  ];

  // Function to get username with fallback
  const getDisplayName = () => {
    if (loading) return 'Loading...';
    if (!user) return 'Guest';
    return user.name || user.email || 'User';
  };

  // Function to get user status
  const getUserStatus = () => {
    if (loading) return 'Loading...';
    if (!user) return 'Guest';
    return user?.isPremium ? 'Premium User' : 'Online';
  };

  return (
    <>
      <div className={`menu-icon-toggle ${styles.menuIconToggle}`} onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </div>

      <div className={`${styles.sidebar} ${isActive ? styles.active : ''}`}>
        <div className={styles.logo}>
          <span style={{ color: 'white' }}>ANIME</span>DB
        </div>

        <div className={styles.menu}>
          <div className={styles.menuTitle}>MENU</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path as any}
              className={`${styles.menuItem} ${pathname === item.path ? styles.active : ''}`}
            >
              <span className={styles.menuIcon}>
                <i className={item.icon}></i>
              </span>
              {item.label}
            </Link>
          ))}

          {/* Add logout button */}
          {user && (
            <button
              onClick={handleLogout}
              className={`${styles.menuItem} ${styles.logoutBtn}`}
            >
              <span className={styles.menuIcon}>
                <i className="fas fa-sign-out-alt"></i>
              </span>
              Logout
            </button>
          )}
        </div>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {loading ? (
              <div className={styles.avatarSkeleton}>
                <i className="fas fa-user"></i>
              </div>
            ) : (
              <img
                src="/assets/card-images/berserk.jpeg"
                alt="User Avatar"
              />
            )}
            <div className={styles.statusIndicator}></div>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {getDisplayName()}
            </div>
            <div className={styles.userStatus}>
              {getUserStatus()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
