'use client';

import React from 'react';
import styles from './ReviewsSection.module.css';

interface Review {
  _id: string;
  title: string;
  rating: number;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const reviewsData = reviews && reviews.length > 0 ? reviews : [];
  const totalReviews = reviewsData.length;
  const averageRating = totalReviews > 0 
    ? (reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className={`${styles.reviewsInfo} ${styles.glassCard}`}>
      <h3>Reviews ({totalReviews})</h3>
      
      <div className={styles.statCard}>
        <div className={styles.statIcon}>📊</div>
        <div className={styles.statDetails}>
          <div className={styles.statNumber}>{totalReviews}</div>
          <div className={styles.statLabel}>Total Reviews</div>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.statIcon}>⭐</div>
        <div className={styles.statDetails}>
          <div className={styles.statNumber}>{averageRating}</div>
          <div className={styles.statLabel}>Average Rating</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
