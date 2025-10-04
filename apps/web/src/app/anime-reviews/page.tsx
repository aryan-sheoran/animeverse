"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/sidebar/Sidebar';
import styles from './anime-reviews.module.css';

interface Review {
  _id: string;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  seasonNumber?: number;
  episodeNumber?: number;
  user?: {
    username: string;
  };
}

interface AnimeInfo {
  title: string;
  rating: number | null;
}

const AnimeReviews = () => {
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [animeInfo, setAnimeInfo] = useState<AnimeInfo>({
    title: '',
    rating: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnimeReviews = async () => {
      try {
        setLoading(true);
        
        // Get anime ID from search params
        const showId = searchParams.get('showId');
        
        if (!showId) {
          setError('No anime ID provided');
          setLoading(false);
          return;
        }

        // Fetch anime details and reviews in parallel
        try {
          const [reviewsResponse, showResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/reviews/anime/${showId}`, {
              credentials: 'include',
            }),
            fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/shows/${showId}`, {
              credentials: 'include',
            })
          ]);

          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData);
          }

          if (showResponse.ok) {
            const showData = await showResponse.json();
            setAnimeInfo({
              title: showData.title,
              rating: showData.rating
            });
          } else {
            // Fallback to search params if show data not available
            const fallbackTitle = searchParams.get('title') 
              ? decodeURIComponent(searchParams.get('title')!) 
              : 'Unknown Anime';
            
            setAnimeInfo({
              title: fallbackTitle,
              rating: null
            });
          }
        } catch (fetchError) {
          console.error('Error fetching data:', fetchError);
          
          // Set fallback anime info from search params
          const fallbackTitle = searchParams.get('title') 
            ? decodeURIComponent(searchParams.get('title')!) 
            : 'Unknown Anime';
          
          setAnimeInfo({
            title: fallbackTitle,
            rating: null
          });
        }

      } catch (error) {
        console.error('Error loading anime reviews:', error);
        setError('Failed to load reviews');
        
        // Set fallback anime info from search params
        const fallbackTitle = searchParams.get('title') 
          ? decodeURIComponent(searchParams.get('title')!) 
          : 'Unknown Anime';
        
        setAnimeInfo({
          title: fallbackTitle,
          rating: null
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnimeReviews();
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }

    const emptyStars = 10 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className={styles.animeReviewsRoot}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.loading}>
            <i className="fas fa-spinner fa-spin"></i>
            <span style={{ marginLeft: '10px' }}>Loading reviews...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.animeReviewsRoot}>
      {/* Glass Background Elements */}
      <div className={styles.glassOrb} style={{ top: '10%', left: '15%' }}></div>
      <div className={styles.glassOrb} style={{ top: '50%', right: '10%' }}></div>
      <div className={styles.glassOrb} style={{ bottom: '20%', left: '30%' }}></div>

      <Sidebar />

      <div className={styles.mainContent}>
        {/* Anime Header */}
        <div className={styles.animeHeader}>
          <div className={styles.animeDetails}>
            <h1 className={styles.animeTitle}>{animeInfo.title}</h1>
            {animeInfo.rating && (
              <div className={styles.animeRating}>
                <span className={styles.ratingValue}>{(animeInfo.rating * 2).toFixed(1)}/10</span>
                <div className={styles.stars}>
                  {renderStars(animeInfo.rating * 2)}
                </div>
              </div>
            )}
            <p className={styles.reviewCount}>
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <h2 className={styles.sectionTitle}>
            <i className="fas fa-comments"></i>
            Community Reviews
          </h2>

          {error && (
            <div className={styles.error}>
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {reviews.length > 0 ? (
            <div className={styles.reviewsList}>
              {reviews.map((review) => (
                <div key={review._id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <div className={styles.avatar}>
                        <i className="fas fa-user"></i>
                      </div>
                      <div className={styles.reviewerDetails}>
                        <h4 className={styles.reviewerName}>
                          {review.user?.username || 'Anonymous'}
                        </h4>
                        <p className={styles.reviewDate}>
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      <span className={styles.ratingValue}>{review.rating}/10</span>
                      <div className={styles.stars}>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>

                  <div className={styles.reviewContent}>
                    <h3 className={styles.reviewTitle}>{review.title}</h3>
                    <p className={styles.reviewText}>{review.content}</p>
                    
                    {(review.seasonNumber || review.episodeNumber) && (
                      <div className={styles.reviewContext}>
                        {review.seasonNumber && (
                          <span className={styles.contextTag}>
                            Season {review.seasonNumber}
                          </span>
                        )}
                        {review.episodeNumber && (
                          <span className={styles.contextTag}>
                            Episode {review.episodeNumber}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noReviews}>
              <i className="fas fa-comment-slash"></i>
              <h3>No reviews yet</h3>
              <p>Be the first to review this anime!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeReviews;
