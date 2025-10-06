"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar/Sidebar';
import ShowCard from '@/components/shows/ShowCard';
import styles from './shows.module.css';

const Shows = () => {
  const router = useRouter();
  const [shows, setShows] = useState<any[]>([]);
  const [filteredShows, setFilteredShows] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userShowIds, setUserShowIds] = useState<Set<string>>(new Set());
  const [popup, setPopup] = useState({ show: false, message: '' });

  const filterCategories = [
    { id: 'all', label: 'All' },
    { id: 'action', label: 'Action' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'fantasy', label: 'Fantasy' },
    {id: 'comedy', label: 'Comedy' },
    { id: 'drama', label: 'Drama' },
    { id: 'romance', label: 'Romance' },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('Fetching shows from API...');
        
        // Fetch shows from database with ratings included
        const showsResponse = await fetch('/api/shows?limit=100&sortBy=recent&includeRatings=true');
        
        console.log('Response status:', showsResponse.status);
        
        if (!showsResponse.ok) {
          const errorText = await showsResponse.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch shows: ${showsResponse.status}`);
        }
        
        const showsData = await showsResponse.json();
        console.log('Fetched shows data:', showsData);
        console.log('Number of shows:', showsData.length);
        
        // Check if showsData is an array
        if (!Array.isArray(showsData)) {
          console.error('Shows data is not an array:', showsData);
          throw new Error('Invalid data format received from API');
        }
        
        // Transform data for frontend
        const transformedShows = showsData.map((show: any) => ({
          ...show,
          id: show._id?.toString() || show._id,
          image: show.imageUrl || show.coverImageUrl || '/assets/card-images/default.jpeg',
          genre: show.genres || [],
          category: show.genres && show.genres.length > 0 ? show.genres[0].toLowerCase() : 'all',
        }));

        console.log('Transformed shows:', transformedShows);
        setShows(transformedShows);
        setFilteredShows(transformedShows);
        
        // Load user shows from your API
        try {
          const userShowsResponse = await fetch('/api/user-shows', {
            credentials: 'include',
          });
          if (userShowsResponse.ok) {
            const userShows = await userShowsResponse.json();
            console.log('User shows loaded:', userShows);
            // Extract showId correctly - it could be in showId._id or showId as string
            const showIds = userShows.map((s: any) => {
              if (typeof s.showId === 'object' && s.showId?._id) {
                return s.showId._id.toString();
              }
              return s.showId?.toString();
            }).filter(Boolean);
            console.log('Extracted show IDs:', showIds);
            setUserShowIds(new Set(showIds));
          }
        } catch (err) {
          console.log('Could not load user shows (user may not be logged in)');
        }

      } catch (error) {
        console.error('Error loading shows:', error);
        setShows([]);
        setFilteredShows([]);
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

  const handleAddToMyShows = async (showId: string) => {
    if (userShowIds.has(showId)) {
      setPopup({ show: true, message: 'This show is already in your list.' });
      setTimeout(() => setPopup({ show: false, message: '' }), 3000);
      return;
    }

    try {
      const response = await fetch('/api/user-shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          showId,
          isFavorite: false
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to add show');
      }
      
      const addedShow = await response.json();
      console.log('Show added:', addedShow);
      
      // Add the showId to local state
      setUserShowIds(prevIds => new Set([...prevIds, showId.toString()]));
      setPopup({ show: true, message: 'Show added successfully!' });
      setTimeout(() => setPopup({ show: false, message: '' }), 3000);
    } catch (error) {
      console.error('Failed to add show to user list', error);
      setPopup({ show: true, message: error instanceof Error ? error.message : 'Failed to add show. Please try again.' });
      setTimeout(() => setPopup({ show: false, message: '' }), 3000);
    }
  };

  const handleImageClick = (imageSrc: string, title: string, showId: string) => {
    const imageParam = encodeURIComponent(imageSrc);
    const titleParam = encodeURIComponent(title);
    const url = `/review?image=${imageParam}&title=${titleParam}&showId=${showId}`;
    router.push(url as any);
  };

  if (loading) {
    return (
      <div className={styles.showsRoot}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.loading}>
            <i className="fas fa-spinner fa-spin"></i>
            <span style={{ marginLeft: '10px' }}>Loading shows from database...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no shows at all (not filtered, but actually no shows)
  if (!loading && shows.length === 0) {
    return (
      <div className={styles.showsRoot}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.noResults}>
            <i className="fas fa-database"></i>
            <h3>No shows in available</h3>
            <p>Add some shows to your database to see them here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.showsRoot}>
      {popup.show && (
        <div className={styles.popup}>
          {popup.message}
        </div>
      )}
      
      {/* Glass Background Elements */}
      <div className={styles.glassOrb} style={{ top: '10%', left: '15%' }}></div>
      <div className={styles.glassOrb} style={{ top: '50%', right: '10%' }}></div>
      <div className={styles.glassOrb} style={{ bottom: '20%', left: '30%' }}></div>

      <Sidebar />

      <div className={styles.mainContent}>
        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search anime shows..."
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

        {/* Shows Grid */}
        {filteredShows.length > 0 ? (
          <div className={styles.showsGrid}>
            {filteredShows.map((show, index) => (
              <ShowCard
                key={show.id}
                show={show}
                index={index}
                onImageClick={() => handleImageClick(show.image, show.title, show.id)}
                isAdded={userShowIds.has(show.id)}
                onAddToMyShows={() => handleAddToMyShows(show.id)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <i className="fas fa-search"></i>
            <h3>No shows found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shows;
