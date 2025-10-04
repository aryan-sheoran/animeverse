'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './UserProfile.module.css';
import { useAuth } from '@/lib/use-auth';

const UserProfile = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleEditProfile = () => {
    router.push('/settings' as any);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (isLoading) return '...';
    if (!user) return 'GU';
    if (user?.name) {
      return user.name.substring(0, 2).toUpperCase();
    }
    return user?.email ? user.email.substring(0, 2).toUpperCase() : 'SJ';
  };

  const getUserName = () => {
    if (isLoading) return 'Loading...';
    if (!user) return 'Guest User';
    return user?.name || user?.email || 'User';
  };

  const getUserBadge = () => {
    if (isLoading) return 'Loading...';
    if (!user) return 'Guest';
    return (user as any)?.isPremium ? 'Premium User' : 'Standard User';
  };

  const getUserLocation = () => {
    if (isLoading) return 'Loading...';
    if (!user) return 'Not specified';
    return (user as any)?.location || 'Not specified';
  };

  const getUserBio = () => {
    if (isLoading) return 'Loading...';
    if (!user) return 'No bio available';
    return (user as any)?.bio || 'No bio available';
  };

  const getFavoriteAnime = () => {
    if (isLoading) return 'Loading...';
    if (!user) return 'No favorites set';
    
    // Fix: Check if favoriteAnime exists as a string (not array)
    const favoriteAnime = (user as any)?.favoriteAnime;
    if (favoriteAnime && typeof favoriteAnime === 'string' && favoriteAnime.trim() !== '') {
      return favoriteAnime;
    }
    
    return 'No favorites set';
  };

  // Add error boundary handling
  const renderUserProfile = () => {
    try {
      return (
        <div className={`${styles.userInfo} ${styles.glassCard}`}>
          <div className={styles.userDetails}>
            <div className={styles.userAvatar}>
              {getUserInitials()}
            </div>
            <div className={styles.userName}>{getUserName()}</div>
            <div className={styles.userBadge}>{getUserBadge()}</div>
            <button className={styles.editProfileBtn} onClick={handleEditProfile}>
              <i>✏️</i> Edit Profile
            </button>
          </div>

          <div className={styles.userInfoDetails}>
            <div className={styles.userInfoItem}>
              <div className={styles.userInfoLabel}>Location</div>
              <div className={styles.userInfoValue}>{getUserLocation()}</div>
            </div>

            <div className={styles.userInfoItem}>
              <div className={styles.userInfoLabel}>Bio</div>
              <div className={styles.userInfoValue}>{getUserBio()}</div>
            </div>

            <div className={styles.favoriteAnime}>
              <span className={styles.favoriteAnimeIcon}>🎬</span>
              <div>
                <div className={styles.userInfoLabel}>Favorite Anime</div>
                <div className={styles.userInfoValue}>{getFavoriteAnime()}</div>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering user profile:', error);
      return (
        <div className={`${styles.userInfo} ${styles.glassCard}`}>
          <div className={styles.loading}>Error loading user profile. Please try again.</div>
        </div>
      );
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`${styles.userInfo} ${styles.glassCard}`}>
        <div className={styles.loading}>Loading user profile...</div>
      </div>
    );
  }

  return (
    <div>
      {renderUserProfile()}
    </div>
  );
};

export default UserProfile;
