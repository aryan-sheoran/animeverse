"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/sidebar/Sidebar';
import { client } from '@/utils/orpc';
import styles from './anime-reviews.module.css';

interface Review {
  _id: string;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  seasonNumber?: number;
  episodeNumber?: number;
  animeTitle?: string;
  animeImage?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface AnimeInfo {
  _id: string;
  title: string;
  imageUrl?: string;
  coverImageUrl?: string;
  description?: string;
  genres?: string[];
  rating: number | null;
  ratingCount?: number;
}

const AnimeReviewsContent = () => {
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [animeInfo, setAnimeInfo] = useState<AnimeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showId, setShowId] = useState<string | null>(null);

  useEffect(() => {
    const loadAnimeReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get anime ID from search params
        const paramShowId = searchParams.get('showId');
        
        if (!paramShowId) {
          setError('No anime ID provided');
          setLoading(false);
          return;
        }

        setShowId(paramShowId);
        console.log('🔍 Loading reviews for show ID:', paramShowId);
        console.log('🔍 Show ID type:', typeof paramShowId);
        console.log('🔍 Show ID length:', paramShowId.length);
        console.log('🔍 Show ID value (JSON):', JSON.stringify(paramShowId));
        console.log('🔍 Show ID value (raw):', paramShowId);

        // Fetch anime details and reviews in parallel using RPC
        console.log('📡 Fetching show and reviews via RPC');
        
        // Fetch reviews using RPC
        let reviewsData: any[] = [];
        try {
          console.log('📡 Calling client.reviews.getByAnimeId with:', { animeId: paramShowId, limit: 100, skip: 0 });
          reviewsData = await client.reviews.getByAnimeId({ 
            animeId: paramShowId,
            limit: 100,
            skip: 0
          });
          console.log('✅ Raw reviews response:', reviewsData);
          console.log('✅ Reviews type:', typeof reviewsData);
          console.log('✅ Is Array:', Array.isArray(reviewsData));
        } catch (err) {
          console.error('❌ Failed to fetch reviews:', err);
          console.error('❌ Error details:', JSON.stringify(err, null, 2));
          reviewsData = [];
        }

        // Fetch show data using RPC
        let showData: any = null;
        try {
          console.log('📡 Calling client.shows.getById with:', { id: paramShowId, includeRatings: true });
          showData = await client.shows.getById({ 
            id: paramShowId, 
            includeRatings: true 
          });
          console.log('✅ Raw show response:', showData);
        } catch (err) {
          console.error('❌ Failed to fetch show:', err);
          console.error('❌ Error details:', JSON.stringify(err, null, 2));
        }

        // Handle reviews
        console.log('📊 Processing reviews data...');
        console.log('📊 Number of reviews:', Array.isArray(reviewsData) ? reviewsData.length : 0);
        if (Array.isArray(reviewsData) && reviewsData.length > 0) {
          console.log('📝 First review:', JSON.stringify(reviewsData[0], null, 2));
          console.log('👤 First review user object:', reviewsData[0].user);
          console.log('👤 User object type:', typeof reviewsData[0].user);
          console.log('👤 User name:', reviewsData[0].user?.name);
          console.log('👤 User keys:', reviewsData[0].user ? Object.keys(reviewsData[0].user) : 'no user');
        }
        
        // Ensure we have an array and set reviews
        const reviewsArray = Array.isArray(reviewsData) ? reviewsData : [];
        console.log('📋 Setting reviews state with:', reviewsArray.length, 'reviews');
        setReviews(reviewsArray);

        // Handle show data
        if (showData) {
          console.log('✅ Loaded show data:', showData);
          setAnimeInfo(showData as any);
        } else {
          console.error('❌ Failed to fetch show');
          setError('Failed to load anime information');
          
          // Set minimal fallback info
          const fallbackTitle = searchParams.get('title') 
            ? decodeURIComponent(searchParams.get('title')!) 
            : 'Unknown Anime';
          
          setAnimeInfo({
            _id: paramShowId,
            title: fallbackTitle,
            rating: null
          });
        }

      } catch (error) {
        console.error('Error loading anime reviews:', error);
        setError('Failed to load reviews. Please try again later.');
        
        // Set fallback anime info
        const paramShowId = searchParams.get('showId');
        const fallbackTitle = searchParams.get('title') 
          ? decodeURIComponent(searchParams.get('title')!) 
          : 'Unknown Anime';
        
        setAnimeInfo({
          _id: paramShowId || '',
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
          {animeInfo && (
            <div className={styles.animeDetails}>
              <h1 className={styles.animeTitle}>{animeInfo.title}</h1>
              {animeInfo.description && (
                <p className={styles.animeDescription}>{animeInfo.description}</p>
              )}
              {animeInfo.genres && animeInfo.genres.length > 0 && (
                <div className={styles.genreTags}>
                  {animeInfo.genres.map((genre, index) => (
                    <span key={index} className={styles.genreTag}>{genre}</span>
                  ))}
                </div>
              )}
              {animeInfo.rating !== null && animeInfo.rating > 0 && (
                <div className={styles.animeRating}>
                  <span className={styles.ratingValue}>{(animeInfo.rating * 2).toFixed(1)}/10</span>
                  <div className={styles.stars}>
                    {renderStars(animeInfo.rating * 2)}
                  </div>
                  {animeInfo.ratingCount && (
                    <span className={styles.ratingCount}>({animeInfo.ratingCount} ratings)</span>
                  )}
                </div>
              )}
              <p className={styles.reviewCount}>
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </p>
            </div>
          )}
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

          {loading && (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              <span style={{ marginLeft: '10px' }}>Loading reviews...</span>
            </div>
          )}
          
          {!loading && reviews && reviews.length > 0 ? (
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
                          {typeof review.user === 'object' && review.user !== null 
                            ? (review.user.name || 'Unknown User')
                            : 'Anonymous User'}
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
          ) : !loading && reviews && reviews.length === 0 ? (
            <div className={styles.noReviews}>
              <i className="fas fa-comment-slash"></i>
              <h3>No reviews yet</h3>
              <p>Be the first to review this anime!</p>
              {showId && (
                <div style={{ marginTop: '15px', fontSize: '0.85rem', opacity: 0.6 }}>
                  <p>Show ID: {showId}</p>
                  <p>Looking for reviews with animeId matching this show's ID</p>
                  <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#ffaa00' }}>
                    Debug: Check browser console for detailed logs
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Loading component for Suspense fallback
const ReviewsLoading = () => {
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
};

// Main component with Suspense boundary
const AnimeReviews = () => {
  return (
    <Suspense fallback={<ReviewsLoading />}>
      <AnimeReviewsContent />
    </Suspense>
  );
};

export default AnimeReviews;
