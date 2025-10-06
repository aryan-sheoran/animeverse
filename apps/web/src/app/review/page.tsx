"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './review.module.css';
import Sidebar from '@/components/sidebar/Sidebar';
import { Header, AnimeInfo, ReviewForm } from '@/components/review';
import { client } from '@/utils/orpc';
import { toast } from 'sonner';

const ReviewContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [rating, setRating] = useState(4);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState('');
  const [isLoadingShowData, setIsLoadingShowData] = useState(false);
  const [showData, setShowData] = useState<{
    id: string | null;
    title: string;
    image: string;
    info: string;
    seasons: Array<{
      seasonNumber: number;
      title: string;
      episodes: number;
      status?: string;
    }>;
  }>({
    id: null,
    title: '',
    image: '',
    info: '',
    seasons: []
  });
  const [userSeasonRatings, setUserSeasonRatings] = useState<any[]>([]);
  const [existingReviews, setExistingReviews] = useState<any[]>([]);
  const [episodeReviews, setEpisodeReviews] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);

  useEffect(() => {
    const showIdParam = searchParams.get('showId');

    // Load user's reviews once
    loadMyReviews();

    if (showIdParam) {
      loadShowData(showIdParam);
      loadUserSeasonRatings(showIdParam);
      loadExistingReviews(showIdParam);
    } else {
      const imageParam = searchParams.get('image');
      const fullImageParam = searchParams.get('fullImage');
      const titleParam = searchParams.get('title');
      const infoParam = searchParams.get('info');
      setShowData(prev => ({
        ...prev,
        id: null,
        title: titleParam ? decodeURIComponent(titleParam) : 'Select a show to review',
        image: fullImageParam ? fullImageParam : (imageParam ? decodeURIComponent(imageParam) : ''),
        info: infoParam ? decodeURIComponent(infoParam) : '',
        seasons: []
      }));
    }
  }, [searchParams]);

  const loadShowData = async (showId: string) => {
    setIsLoadingShowData(true);
    try {
      // Fetch show data using RPC
      const data = await client.shows.getById({
        id: showId,
        includeRatings: false,
      }) as any;
      setShowData({
        id: data._id,
        title: data.title,
        image: data.coverImageUrl || data.cardImage,
        info: data.description,
        seasons: data.seasons || [],
      });
    } catch {
      console.error('Failed to load show data, falling back to URL params');
      const imageParam = searchParams.get('image');
      const fullImageParam = searchParams.get('fullImage');
      const titleParam = searchParams.get('title');
      const infoParam = searchParams.get('info');
      setShowData(prev => ({
        ...prev,
        id: showId,
        title: titleParam ? decodeURIComponent(titleParam) : 'Unknown Show',
        image: fullImageParam ? fullImageParam : (imageParam ? decodeURIComponent(imageParam) : '/assets/card-images/default.jpeg'),
        info: infoParam ? decodeURIComponent(infoParam) : '',
        seasons: [
          {
            seasonNumber: 1,
            title: 'Season 1',
            episodes: 12,
            status: 'Finished'
          },
          {
            seasonNumber: 2,
            title: 'Season 2',
            episodes: 12,
            status: 'Finished'
          }
        ],
      }));
    } finally {
      setIsLoadingShowData(false);
    }
  };

  const loadUserSeasonRatings = async (showId: string) => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/ratings/show/${showId}`);
      const data = await response.json();
      setUserSeasonRatings(data);
    } catch (error) {
      console.error('Error loading user season ratings:', error);
    }
  };

  const loadMyReviews = async () => {
    try {
      // Try REST API first as fallback
      const response = await fetch('/api/reviews/my-reviews', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMyReviews(data);
      }
    } catch (error) {
      console.error('Error loading my reviews:', error);
      // Silently fail - user might not be logged in
    }
  };

  const loadExistingReviews = async (showId: string) => {
    try {
      // Use REST API endpoint that already exists
      const response = await fetch(`/api/reviews/anime/${showId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setExistingReviews(data);
      }
    } catch (error) {
      console.error('Error loading existing reviews:', error);
    }
  };

  const loadEpisodeReviews = async (showId: string, seasonNumber: string, episodeNumber: string) => {
    try {
      // Use REST API endpoint
      const response = await fetch(`/api/reviews/anime/${showId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const allReviews = await response.json();
        // Filter for specific episode
        const filtered = allReviews.filter((review: any) => 
          review.seasonNumber === parseInt(seasonNumber) &&
          review.episodeNumber === parseInt(episodeNumber)
        );
        setEpisodeReviews(filtered);
      }
    } catch (error) {
      console.error('Error loading episode reviews:', error);
    }
  };

  // Load episode reviews when season/episode selection changes
  useEffect(() => {
    if (showData.id && selectedSeason && selectedEpisode) {
      loadEpisodeReviews(showData.id, selectedSeason, selectedEpisode);
    }
  }, [showData.id, selectedSeason, selectedEpisode]);

  const handleSeasonRatingUpdate = (updatedRating: any) => {
    setUserSeasonRatings(prev => {
      const existingIndex = prev.findIndex(
        (r: any) => r.seasonNumber === updatedRating.seasonNumber
      );
      
      if (existingIndex !== -1) {
        // Update existing rating
        const updated = [...prev];
        updated[existingIndex] = updatedRating;
        return updated;
      } else {
        // Add new rating
        return [...prev, updatedRating];
      }
    });
  };

  const handleSubmitReview = async () => {
    // Validate all required fields
    if (!showData.id) {
      toast.error('Please select a show to review.');
      return;
    }

    if (!showData.title) {
      toast.error('Show title is missing.');
      return;
    }

    if (!reviewTitle || reviewTitle.trim().length === 0) {
      toast.error('Please provide a title for your review.');
      return;
    }

    if (!reviewText || reviewText.trim().length < 10) {
      toast.error('Please provide review content (at least 10 characters).');
      return;
    }

    if (rating < 0 || rating > 10) {
      toast.error('Please provide a valid rating (0-10).');
      return;
    }

    // Check if user already reviewed this episode
    if (selectedEpisode) {
      const existingEpisodeReview = myReviews.find(
        (review: any) => 
          review.animeId === showData.id &&
          review.seasonNumber === parseInt(selectedSeason) &&
          review.episodeNumber === parseInt(selectedEpisode)
      );
      
      if (existingEpisodeReview) {
        toast.error('You have already reviewed this episode. Please edit your existing review instead.');
        return;
      }
    }

    const reviewData: any = {
      animeId: showData.id,
      animeTitle: showData.title,
      rating: rating,
      title: reviewTitle.trim(),
      content: reviewText.trim(),
    };

    // Add optional fields
    if (showData.image) {
      reviewData.animeImage = showData.image;
    }

    // Only add season/episode if both are selected
    if (selectedSeason && selectedEpisode) {
      reviewData.seasonNumber = parseInt(selectedSeason);
      reviewData.episodeNumber = parseInt(selectedEpisode);
    }

    console.log('Submitting review data:', {
      ...reviewData,
      titleLength: reviewData.title.length,
      contentLength: reviewData.content.length,
      ratingType: typeof reviewData.rating,
    });

    try {
      // Use REST API endpoint
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      toast.success('Review submitted successfully!');
      handleClearReview();
      // Refresh reviews after successful submission
      loadMyReviews();
      if (showData.id) {
        loadExistingReviews(showData.id);
        if (selectedSeason && selectedEpisode) {
          loadEpisodeReviews(showData.id, selectedSeason, selectedEpisode);
        }
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Extract more detailed error message
      let errorMessage = 'Failed to submit review. Please try again.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.issues) {
        // Zod validation errors
        errorMessage = error.issues.map((issue: any) => issue.message).join(', ');
      }
      
      toast.error(errorMessage);
    }
  };

  const handleClearReview = () => {
    setRating(0);
    setReviewTitle('');
    setReviewText('');
    setSelectedSeason('');
    setSelectedEpisode('');
  };

  return (
    <div className={styles.reviewRoot}>
      {/* Glass Background Elements */}
      <div className={`${styles.glassOrb} ${styles.orb1}`}></div>
      <div className={`${styles.glassOrb} ${styles.orb2}`}></div>
      <div className={`${styles.glassOrb} ${styles.orb3}`}></div>

      {/* Sidebar component */}
      <Sidebar />

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header with Back Button */}
        <div className={styles.reviewHeader}>
          <Header />
          <button
            onClick={() => router.push('/shows')}
            className={styles.backButton}
          >
            <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Two Column Layout */}
        <div className={styles.reviewColumns}>
          {/* Column 1: Anime Information */}
          <div className={styles.leftColumn}>
            <AnimeInfo 
              animeData={showData}
              isLoading={isLoadingShowData}
              selectedSeason={selectedSeason}
              setSelectedSeason={setSelectedSeason}
              selectedEpisode={selectedEpisode}
              setSelectedEpisode={setSelectedEpisode}
            />
          </div>

          {/* Column 2: Review Form */}
          <div className={styles.rightColumn}>
            <ReviewForm
              rating={rating}
              setRating={setRating}
              reviewTitle={reviewTitle}
              setReviewTitle={setReviewTitle}
              reviewText={reviewText}
              setReviewText={setReviewText}
              onSubmit={handleSubmitReview}
              onClear={handleClearReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading component for Suspense fallback
const ReviewLoading = () => {
  return (
    <div className={styles.reviewRoot}>
      <Sidebar />
      <div className={styles.reviewContainer}>
        <div style={{ textAlign: 'center', padding: '50px', color: '#e0e0e0' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
          <p style={{ marginTop: '20px' }}>Loading...</p>
        </div>
      </div>
    </div>
  );
};

// Main component with Suspense boundary
const Review = () => {
  return (
    <Suspense fallback={<ReviewLoading />}>
      <ReviewContent />
    </Suspense>
  );
};

export default Review;
