"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar/Sidebar';
import UserProfile from '@/components/mystuff/UserProfile';
import MyShowsSection from '@/components/mystuff/MyShowsSection';
import ReviewsSection from '@/components/mystuff/ReviewsSection';
import BlogSection from '@/components/mystuff/BlogSection';
import { client } from '@/utils/orpc';
import styles from './mystuff.module.css';
import { useAuth } from '@/lib/use-auth';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  likeCount: number;
  createdAt: string;
}

interface Review {
  _id: string;
  title: string;
  rating: number;
}

const MyStuff = () => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Effect to redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('Not authenticated - redirecting to login');
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchBlogPosts = useCallback(async () => {
    if (isAuthenticated) {
      try {
        // Use RPC API
        const data = await client.blogs.getMyBlogs({});
        setBlogPosts(data as any);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      }
    }
  }, [isAuthenticated]);

  const fetchReviews = useCallback(async () => {
    if (isAuthenticated) {
      try {
        // Use RPC API
        const data = await client.reviews.getMyReviews({});
        setReviews(data as any);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBlogPosts();
    fetchReviews();
  }, [fetchBlogPosts, fetchReviews]);

  if (isLoading) {
    return (
      <div className={styles.myStuffRoot}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.loading}>
            <i className="fas fa-spinner fa-spin"></i>
            <span style={{ marginLeft: '10px' }}>Loading your profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.myStuffRoot}>
      {/* Glass Background Elements */}
      <div className={styles.glassOrb} style={{ top: '10%', left: '15%' }}></div>
      <div className={styles.glassOrb} style={{ top: '50%', right: '10%' }}></div>
      <div className={styles.glassOrb} style={{ bottom: '20%', left: '30%' }}></div>

      <Sidebar />

      <div className={styles.mainContent}>
        <div className={`${styles.profileSection} ${styles.glassCard}`}>
          <div className={styles.sectionHeader}>User Profile</div>

          {/* First Row: User Info and Reviews side by side */}
          <div className={styles.profileRow}>
            <div className={styles.profileColumn}>
              <UserProfile />
            </div>
          </div>

          {/* My Shows Section */}
          <div className={styles.showsRow}>
            <MyShowsSection />
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyStuff;
