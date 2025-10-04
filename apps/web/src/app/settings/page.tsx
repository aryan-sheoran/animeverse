'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/use-auth';
import Sidebar from '@/components/sidebar/Sidebar';
import ProfileSettings from '@/components/settings/ProfileSettings';
import styles from './settings.module.css';

const Settings = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleProfileUpdate = async (profileData: any) => {
    try {
      // TODO: Implement profile update with your backend
      // For now, we'll simulate success
      console.log('Profile data to update:', profileData);
      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile. Please try again.' };
    }
  };

  if (isLoading) {
    return (
      <div className={styles.settingsRoot}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className={styles.settingsRoot}>
      {/* Glass Background Elements */}
      <div className={styles.glassOrb} style={{ top: '10%', left: '15%' }}></div>
      <div className={styles.glassOrb} style={{ top: '50%', right: '10%' }}></div>
      <div className={styles.glassOrb} style={{ bottom: '20%', left: '30%' }}></div>

      <Sidebar />

      <div className={styles.mainContent}>
        <div className={styles.settingsContainer}>
          <h1 className={styles.pageTitle}>Profile Settings</h1>

          <div className={styles.settingsContent}>
            <ProfileSettings 
              user={user} 
              onUpdate={handleProfileUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
