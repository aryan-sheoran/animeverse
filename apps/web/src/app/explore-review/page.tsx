"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar/Sidebar';
import ShowCard from '@/components/shows/ShowCard';
import { client } from '@/utils/orpc';
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
        // Fetch shows with ratings using RPC
        const showsData = await client.shows.getAll({
          includeRatings: true,
        });

        // Format basic show data - only include shows with valid images
        const formattedShows = showsData
          .filter((show: any) => show.imageUrl) // Only shows with images
          .map((show: any) => ({
            ...show,
            id: show._id,
            image: show.imageUrl,
            category: show.genres && show.genres.length > 0 ? show.genres[0].toLowerCase() : 'action',
            rating: show.rating ?? 0,
            reviewCount: show.ratingCount ?? 0
          }));

        // Sort shows by review count and rating for better "explore" experience
        const sortedShows = formattedShows.sort((a: any, b: any) => {
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
        {/* Header Section with Title, Search, and Filters - All Horizontal */}
        <div className={styles.headerSection}>
          {/* Left: Title */}
          <h1 className={styles.pageTitle}>
            <i className="fas fa-search"></i>
            Explore Reviews
          </h1>

          {/* Middle: Search Bar */}
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
          </div>

          {/* Right: Filter Buttons */}
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
