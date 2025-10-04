"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/sidebar/Sidebar';
import ShowCard from '@/components/shows/ShowCard';
import styles from './shows.module.css';

// Mock data for shows - replace with your API calls
const mockShows = [
  {
    _id: '1',
    id: '1',
    title: 'Attack on Titan',
    image: '/assets/card-images/aot.jpeg',
    genre: ['Action', 'Fantasy'],
    rating: 4.8,
  },
  {
    _id: '2',
    id: '2',
    title: 'Berserk',
    image: '/assets/card-images/berserk.jpeg',
    genre: ['Action', 'Fantasy'],
    rating: 4.9,
  },
  {
    _id: '3',
    id: '3',
    title: 'Black Clover',
    image: '/assets/card-images/black-clover.jpeg',
    genre: ['Action', 'Adventure'],
    rating: 4.5,
  },
  {
    _id: '4',
    id: '4',
    title: 'Demon Slayer',
    image: '/assets/card-images/demon.jpeg',
    genre: ['Action', 'Adventure'],
    rating: 4.7,
  },
  {
    _id: '5',
    id: '5',
    title: 'Jujutsu Kaisen',
    image: '/assets/card-images/jjk.jpeg',
    genre: ['Action', 'Fantasy'],
    rating: 4.6,
  },
  {
    _id: '6',
    id: '6',
    title: 'One Piece',
    image: '/assets/card-images/one.jpeg',
    genre: ['Adventure', 'Fantasy'],
    rating: 4.9,
  },
  {
    _id: '7',
    id: '7',
    title: 'Naruto',
    image: '/assets/card-images/naruto.jpeg',
    genre: ['Action', 'Adventure'],
    rating: 4.7,
  },
  {
    _id: '8',
    id: '8',
    title: 'Solo Leveling',
    image: '/assets/card-images/sololeveling.jpeg',
    genre: ['Action', 'Fantasy'],
    rating: 4.8,
  },
];

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
    { id: 'fantasy', label: 'Fantasy' }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Replace with your actual API calls
        // For now, using mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const showsData = mockShows.map(show => ({
          ...show,
          id: show._id,
          category: show.genre && show.genre.length > 0 ? show.genre[0].toLowerCase() : 'action',
        }));

        setShows(showsData);
        setFilteredShows(showsData);
        
        // Load user shows from your API
        // const userShowsResponse = await fetch('/api/user-shows');
        // const userShows = await userShowsResponse.json();
        // setUserShowIds(new Set(userShows.map(s => s.showId)));

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

  const handleAddToMyShows = async (showId: string) => {
    if (userShowIds.has(showId)) {
      setPopup({ show: true, message: 'This show is already in your list.' });
      setTimeout(() => setPopup({ show: false, message: '' }), 3000);
      return;
    }

    try {
      // Replace with your actual API call
      // await fetch('/api/user-shows', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ showId })
      // });
      
      setUserShowIds(prevIds => new Set([...prevIds, showId]));
      setPopup({ show: true, message: 'Show added successfully!' });
      setTimeout(() => setPopup({ show: false, message: '' }), 3000);
    } catch (error) {
      console.error('Failed to add show to user list', error);
      setPopup({ show: true, message: 'Failed to add show. Please try again.' });
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
            <span style={{ marginLeft: '10px' }}>Loading shows...</span>
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
