"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './review.module.css';
import Sidebar from '@/components/sidebar/Sidebar';
import { Header, AnimeInfo, ReviewForm } from '@/components/review';

const Review = () => {
  const searchParams = useSearchParams();
  const [rating, setRating] = useState(4);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [bestMoment, setBestMoment] = useState('');
  const [worstMoment, setWorstMoment] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState('');
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

  useEffect(() => {
    const showIdParam = searchParams.get('showId');

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
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/shows/${showId}`);
      const data = await response.json();
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

  const loadExistingReviews = async (showId: string) => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/reviews/anime/${showId}`);
      const data = await response.json();
      setExistingReviews(data);
    } catch (error) {
      console.error('Error loading existing reviews:', error);
    }
  };

  const loadEpisodeReviews = async (showId: string, seasonNumber: string, episodeNumber: string) => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/reviews/anime/${showId}/season/${seasonNumber}/episode/${episodeNumber}`);
      const data = await response.json();
      setEpisodeReviews(data);
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
    if (!reviewTitle || !reviewText) {
      alert('Please provide a title and content for your review.');
      return;
    }

    const reviewData = {
      animeId: showData.id,
      animeTitle: showData.title,
      animeImage: showData.image,
      rating,
      title: reviewTitle,
      content: reviewText,
      bestMoment: bestMoment || '',
      worstMoment: worstMoment || '',
      seasonNumber: selectedSeason || null,
      episodeNumber: selectedEpisode || null,
    };

    try {
      // Replace with your actual API call
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      
      if (response.ok) {
        alert('Review submitted successfully!');
        handleClearReview();
        // Refresh reviews after successful submission
        if (showData.id) {
          loadExistingReviews(showData.id);
          if (selectedSeason && selectedEpisode) {
            loadEpisodeReviews(showData.id, selectedSeason, selectedEpisode);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleClearReview = () => {
    setRating(0);
    setReviewTitle('');
    setReviewText('');
    setBestMoment('');
    setWorstMoment('');
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
        {/* Header */}
        <div className={styles.reviewHeader}>
          <Header />
        </div>

        {/* Two Column Layout */}
        <div className={styles.reviewColumns}>
          {/* Column 1: Anime Information */}
          <div className={styles.leftColumn}>
            <AnimeInfo 
              animeData={showData}
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
              bestMoment={bestMoment}
              setBestMoment={setBestMoment}
              worstMoment={worstMoment}
              setWorstMoment={setWorstMoment}
              onSubmit={handleSubmitReview}
              onClear={handleClearReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
