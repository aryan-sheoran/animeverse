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
      // Import authClient dynamically to avoid SSR issues
      const { authClient } = await import('@/lib/auth-client');
      
      console.log('Updating profile with data:', profileData);
      
      // Use better-auth's updateUser method with additional fields
      const result = await authClient.updateUser({
        name: profileData.username || user?.name,
        // Cast to any to include additional fields
        ...(profileData as any),
      });
      
      console.log('Update result:', result);
      
      if (result.error) {
        console.error('Update error:', result.error);
        return { 
          success: false, 
          error: result.error.message || 'Failed to update profile' 
        };
      }
      
      return { 
        success: true, 
        message: 'Profile updated successfully!' 
      };
    } catch (error: any) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error?.message || 'Failed to update profile. Please try again.' 
      };
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
