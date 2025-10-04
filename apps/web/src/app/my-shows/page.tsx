"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar/Sidebar';
import ShowCard from '@/components/myshows/ShowCard';
import styles from './my-shows.module.css';

interface Show {
  _id: string;
  title: string;
  image: string;
  genre?: string[];
  rating: number;
}

interface UserShow {
  _id: string;
  showId: Show;
  isFavorite: boolean;
}

const MyShows = () => {
  const router = useRouter();
  const [shows, setShows] = useState<UserShow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 6;

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await fetch('/api/user-shows', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          console.error('Failed to fetch user shows');
          setShows([]);
          return;
        }
        
        const data = await response.json();
        setShows(data);
      } catch (error) {
        console.error("Failed to load shows", error);
        setShows([]);
      } finally {
        setLoading(false);
      }
    };

    const checkForNewShows = () => {
      const newShowAdded = localStorage.getItem('newShowAdded');
      if (newShowAdded === 'true') {
        localStorage.removeItem('newShowAdded');
        fetchShows();
      }
    };

    // Check when the component mounts
    fetchShows();
    checkForNewShows();

    // Also check when the window gets focus
    window.addEventListener('focus', checkForNewShows);

    return () => {
      window.removeEventListener('focus', checkForNewShows);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const getImageSrc = (show: Show) => {
    if (show.image) {
      if (show.image.startsWith('http')) {
        return show.image;
      }
      return `/assets/card-images/${show.image}`;
    }
    return '/assets/card-images/logo.png';
  };

  const handleImageClick = (userShow: UserShow) => {
    const show = userShow.showId;
    const imageSrc = getImageSrc(show);
    const imageParam = encodeURIComponent(imageSrc);
    const titleParam = encodeURIComponent(show.title);
    router.push(`/review?image=${imageParam}&title=${titleParam}&showId=${show._id}`);
  };

  const handleDeleteShow = async (userShowId: string) => {
    try {
      const response = await fetch(`/api/user-shows/${userShowId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete show');
      }
      
      setShows(shows.filter(userShow => userShow._id !== userShowId));
    } catch (error) {
      console.error("Failed to delete show", error);
      alert('Failed to delete show. Please try again.');
    }
  };

  const handleToggleFavorite = async (userShowId: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/user-shows/${userShowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isFavorite }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }
      
      const updatedShow = await response.json();
      setShows(shows.map(userShow => 
        userShow._id === userShowId ? updatedShow : userShow
      ));
      
      const showTitle = shows.find(userShow => userShow._id === userShowId)?.showId.title;
      const message = isFavorite ? 'added to' : 'removed from';
      alert(`${showTitle} has been ${message} favorites!`);
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  // Filter and sort logic
  const filteredAndSortedShows = () => {
    let filtered = shows;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(userShow => 
        userShow.showId && (
          userShow.showId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (userShow.showId.genre && userShow.showId.genre.join(' ').toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    }

    // Apply sorting
    if (sortBy === 'name') {
      return [...filtered].sort((a, b) => {
        if (!a.showId || !b.showId) return 0;
        return a.showId.title.localeCompare(b.showId.title);
      });
    } else if (sortBy === 'rating') {
      return [...filtered].sort((a, b) => {
        if (!a.showId || !b.showId) return 0;
        return b.showId.rating - a.showId.rating;
      });
    }
    
    return filtered;
  };

  const currentShows = filteredAndSortedShows().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAndSortedShows().length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className={styles.myShowsRoot}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.loading}>
            <i className="fas fa-spinner fa-spin"></i>
            <span style={{ marginLeft: '10px' }}>Loading your shows...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.myShowsRoot}>
      {/* Glass Background Elements */}
      <div className={styles.glassOrb} style={{ top: '10%', left: '15%' }}></div>
      <div className={styles.glassOrb} style={{ top: '50%', right: '10%' }}></div>
      <div className={styles.glassOrb} style={{ bottom: '20%', left: '30%' }}></div>

      <Sidebar />

      <div className={styles.mainContent}>
        <div className={styles.showsSection}>
          {/* Section Header */}
          <div className={styles.sectionHeader}>
            <h1>My Shows</h1>
          </div>

          {/* Filter Section */}
          <div className={styles.filterSection}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search shows..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <i className="fas fa-search"></i>
            </div>
            <div className={styles.filterOptions}>
              <select 
                className={styles.sortSelect}
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="recent">Recently Added</option>
                <option value="name">Name (A-Z)</option>
                <option value="rating">Rating (High-Low)</option>
              </select>
            </div>
          </div>

          {/* Shows Grid */}
          {currentShows.length > 0 ? (
            <>
              <div className={styles.showsGrid}>
                {currentShows.filter(userShow => userShow.showId).map((userShow) => (
                  <ShowCard 
                    key={userShow._id}
                    userShow={userShow}
                    onDelete={() => handleDeleteShow(userShow._id)}
                    onToggleFavorite={(isFavorite: boolean) => handleToggleFavorite(userShow._id, isFavorite)}
                    onImageClick={() => handleImageClick(userShow)}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  {currentPage < totalPages && (
                    <button
                      className={styles.pageBtn}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className={styles.noShows}>
              <i className="fas fa-tv"></i>
              <h3>No shows found</h3>
              <p>Try adjusting your search or filter criteria, or add a new show to your list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyShows;
