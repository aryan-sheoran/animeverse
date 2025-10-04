"use client";

import React, { useState, useEffect } from 'react';
import styles from './ShowSeasonRatings.module.css';

interface SeasonRating {
  _id: string;
  seasonNumber: number;
  seasonTitle?: string;
  rating: number;
  review?: string;
}

interface ShowSeasonRatingsProps {
  showId: string;
  compact?: boolean;
}

const ShowSeasonRatings: React.FC<ShowSeasonRatingsProps> = ({ showId, compact = true }) => {
  const [seasonRatings, setSeasonRatings] = useState<SeasonRating[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showId) {
      loadSeasonRatings();
    }
  }, [showId]);

  const loadSeasonRatings = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      
      if (!userId) return;

      const response = await fetch(`/api/ratings/show/${showId}?userId=${userId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.warn('Failed to fetch season ratings');
        return;
      }
      
      const data = await response.json();
      setSeasonRatings(data);
    } catch (error) {
      console.error('Error loading season ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fas fa-star ${
          index < rating ? styles.filledStar : styles.emptyStar
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className={styles.seasonRatings}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
      </div>
    );
  }

  if (seasonRatings.length === 0) {
    return (
      <div className={styles.seasonRatings}>
        <div className={styles.noRatings}>
          <i className="fas fa-star-half-alt"></i>
          <span>No season ratings yet</span>
        </div>
      </div>
    );
  }

  if (compact) {
    // Compact view for show cards
    return (
      <div className={styles.seasonRatings}>
        <div className={styles.compactRatings}>
          {seasonRatings
            .sort((a, b) => a.seasonNumber - b.seasonNumber)
            .map(rating => (
              <div key={rating._id} className={styles.compactRating}>
                <span className={styles.seasonNum}>S{rating.seasonNumber}</span>
                <div className={styles.compactStars}>
                  {renderStars(rating.rating)}
                </div>
                <span className={styles.ratingValue}>{rating.rating}</span>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div className={styles.seasonRatings}>
      <h4 className={styles.ratingsTitle}>Your Season Ratings</h4>
      <div className={styles.expandedRatings}>
        {seasonRatings
          .sort((a, b) => a.seasonNumber - b.seasonNumber)
          .map(rating => (
            <div key={rating._id} className={styles.expandedRating}>
              <div className={styles.seasonInfo}>
                <span className={styles.seasonLabel}>
                  Season {rating.seasonNumber}
                </span>
                <span className={styles.seasonTitle}>{rating.seasonTitle}</span>
              </div>
              <div className={styles.ratingDisplay}>
                <div className={styles.stars}>
                  {renderStars(rating.rating)}
                </div>
                <span className={styles.ratingValue}>{rating.rating}/5</span>
              </div>
              {rating.review && (
                <p className={styles.reviewSnippet}>{rating.review}</p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ShowSeasonRatings;
