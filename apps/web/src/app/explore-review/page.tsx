"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar/Sidebar';
import ShowCard from '@/components/shows/ShowCard';
import styles from './explore-review.module.css';

interface Show {
  id: string;
  _id: string;
  title: string;
  image: string;
  genre?: string[];
  category: string;
  rating: number | null;
  reviewCount: number;
}

const ExploreReview = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [filteredShows, setFilteredShows] = useState<Show[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const filterCategories = [
    { id: 'all', label: 'All Reviews' },
    { id: 'action', label: 'Action' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'drama', label: 'Drama' },
    { id: 'romance', label: 'Romance' }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const showsResponse = await fetch('/api/shows');
        const showsData = await showsResponse.json();

        // Format basic show data - only include shows with valid images
        const formattedShows = showsData
          .filter((show: any) => show.imageUrl) // Only shows with images
          .map((show: any) => ({
            ...show,
            id: show._id,
            image: show.imageUrl,
            category: show.genres && show.genres.length > 0 ? show.genres[0].toLowerCase() : 'action',
            rating: show.rating ?? null
          }));

        // For each show, fetch reviews and season ratings to compute average rating
        const showsWithRatings = await Promise.all(formattedShows.map(async (s: Show) => {
          try {
            // Fetch season ratings (5-point scale)
            const seasonRatingsRes = await fetch(`/api/ratings/show/${s._id}`);
            const seasonRatings = seasonRatingsRes.ok ? await seasonRatingsRes.json() : [];

            // Fetch reviews for this anime (reviews use 0-10 scale)
            let reviewRatings: any[] = [];
            try {
              const reviewsRes = await fetch(`/api/reviews/anime/${s._id}`);
              reviewRatings = reviewsRes.ok ? await reviewsRes.json() : [];
            } catch (revErr) {
              console.warn(`Failed to fetch reviews for show ${s._id}:`, revErr);
              reviewRatings = [];
            }

            // Normalize ratings: season ratings are 0-5 already; review ratings are 0-10 -> convert to 0-5
            const seasonVals = Array.isArray(seasonRatings) 
              ? seasonRatings.map((r: any) => Number(r.rating || 0)).filter((v: number) => !Number.isNaN(v))
              : [];
            const reviewVals = Array.isArray(reviewRatings)
              ? reviewRatings
                  .map((r: any) => {
                    const val = Number(r.rating);
                    return Number.isFinite(val) ? Math.max(0, Math.min(5, val / 2)) : null;
                  })
                  .filter((v): v is number => v !== null && !Number.isNaN(v))
              : [];

            const allVals = [...seasonVals, ...reviewVals];

            if (allVals.length === 0) {
              return { ...s, rating: s.rating ?? null, reviewCount: 0 };
            }

            const avg = allVals.reduce((sum, v) => sum + v, 0) / allVals.length;
            return { 
              ...s, 
              rating: Number(avg.toFixed(1)), 
              reviewCount: reviewRatings.length + seasonRatings.length 
            };
          } catch (err) {
            console.warn(`Failed to fetch ratings for show ${s._id}:`, err);
            return { ...s, rating: s.rating ?? null, reviewCount: 0 };
          }
        }));

        // Sort shows by review count and rating for better "explore" experience
        const sortedShows = showsWithRatings.sort((a, b) => {
          if (b.reviewCount !== a.reviewCount) {
            return b.reviewCount - a.reviewCount; // Most reviewed first
          }
          return (b.rating || 0) - (a.rating || 0); // Then by rating
        });

        setShows(sortedShows);
        setFilteredShows(sortedShows);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    filterAndSearchShows();
  }, [shows, activeFilter, searchQuery]);

  const filterAndSearchShows = () => {
    let filtered = shows;

    if (activeFilter !== 'all') {
      filtered = filtered.filter(show => show.category === activeFilter);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(show => 
        show.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredShows(filtered);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleImageClick = (imageSrc: string, title: string, showId: string) => {
    router.push(`/anime-reviews?showId=${showId}`);
  };

  if (loading) {
    return (
      <div className={styles.exploreReviewRoot}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.loading}>
            <i className="fas fa-spinner fa-spin"></i>
            <span style={{ marginLeft: '10px' }}>Loading anime reviews...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.exploreReviewRoot}>
      {/* Glass Background Elements */}
      <div className={styles.glassOrb} style={{ top: '10%', left: '15%' }}></div>
      <div className={styles.glassOrb} style={{ top: '50%', right: '10%' }}></div>
      <div className={styles.glassOrb} style={{ bottom: '20%', left: '30%' }}></div>

      <Sidebar />

      <div className={styles.mainContent}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>
            <i className="fas fa-search"></i>
            Explore Reviews
          </h1>
          <p className={styles.pageSubtitle}>
            Discover anime through community reviews and ratings
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search anime by title..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className={styles.filterButtons}>
            {filterCategories.map(category => (
              <button
                key={category.id}
                className={`${styles.filterBtn} ${activeFilter === category.id ? styles.active : ''}`}
                onClick={() => handleFilterChange(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            {filteredShows.length} anime {filteredShows.length === 1 ? 'found' : 'found'}
          </span>
          {activeFilter !== 'all' && (
            <span className={styles.activeFilter}>
              Filtered by: {filterCategories.find(cat => cat.id === activeFilter)?.label}
            </span>
          )}
        </div>

        {/* Shows Grid */}
        {filteredShows.length > 0 ? (
          <div className={styles.showsGrid}>
            {filteredShows.map((show, index) => (
              <ShowCard
                key={show.id}
                show={show}
                index={index}
                onImageClick={() => handleImageClick(show.image, show.title, show.id)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <i className="fas fa-search"></i>
            <h3>No anime found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreReview;
