'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShowCard from '@/components/myshows/ShowCard';
import { client } from '@/utils/orpc';
import styles from './MyShowsSection.module.css';

interface Show {
  _id: string;
  title: string;
  image: string;
  imageUrl?: string;
  coverImageUrl?: string;
  genre?: string[];
  genres?: string[];
  rating: number;
}

interface UserShow {
  _id: string;
  showId: Show;
  isFavorite: boolean;
}

const MyShowsSection: React.FC = () => {
  const router = useRouter();
  const [shows, setShows] = useState<UserShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      // Use RPC to get user shows
      let data = await client.userShows.getMyShows({}) as any;
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.warn('User shows API returned non-array data:', data);
        data = [];
      }
      
      // Debug: Log the show data to see what images we're getting
      console.log('User shows data:', data);
      data.forEach((userShow: any, index: number) => {
        if (userShow.showId) {
          console.log(`Show ${index} - ${userShow.showId.title}:`, {
            image: userShow.showId.image,
            imageUrl: userShow.showId.imageUrl,
            coverImageUrl: userShow.showId.coverImageUrl
          });
        }
      });
      
      setShows(data);
    } catch (error) {
      console.error("Failed to load shows", error);
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userShowId: string) => {
    // Confirmation dialog
    if (!confirm('Are you sure you want to remove this show from your list?')) {
      return;
    }

    try {
      // Use RPC to remove show
      await client.userShows.removeShow({ showId: userShowId });

      // Remove from local state on success
      setShows(shows.filter(show => show._id !== userShowId));
    } catch (error) {
      console.error('Failed to delete show:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete show. Please try again.');
    }
  };

  const handleToggleFavorite = async (userShowId: string, isFavorite: boolean) => {
    try {
      // Use RPC to update favorite status
      await client.userShows.updateShow({ 
        showId: userShowId, 
        isFavorite 
      });

      // Update local state on success
      setShows(shows.map(show => 
        show._id === userShowId ? { ...show, isFavorite } : show
      ));
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update favorite status. Please try again.');
    }
  };

  const getImageSrc = (show: Show) => {
    // Priority: imageUrl, coverImageUrl, then image
    const image = show.imageUrl || show.coverImageUrl || show.image;
    if (image) {
      if (image.startsWith('http')) {
        return image;
      }
      // If it's a relative path, return as is (assuming it's already correct)
      return image;
    }
    // Return empty string if no image - don't use default
    return '';
  };

  const handleImageClick = (userShow: UserShow) => {
    const show = userShow.showId;
    const imageSrc = getImageSrc(show);
    const imageParam = encodeURIComponent(imageSrc);
    const titleParam = encodeURIComponent(show.title);
    const genreParam = encodeURIComponent(
      (show.genre && show.genre.length > 0) 
        ? show.genre[0] 
        : (show.genres && show.genres.length > 0) 
          ? show.genres[0] 
          : 'Unknown'
    );
    const showIdParam = show._id;

    router.push(`/review?image=${imageParam}&title=${titleParam}&genre=${genreParam}&showId=${showIdParam}`);
  };

  if (loading) {
    return (
      <div className={styles.myShowsSection}>
        <div className={styles.sectionHeader}>
          <h2>My Shows</h2>
        </div>
        <div className={styles.loading}>Loading your shows...</div>
      </div>
    );
  }

  return (
    <div className={styles.myShowsSection}>
      <div className={styles.sectionHeader}>
        <h2>My Favourite Shows</h2>
        {shows.length > 0 && (
          <span className={styles.showCount}>{shows.length} {shows.length === 1 ? 'show' : 'shows'}</span>
        )}
      </div>
      
      {shows.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven't added any shows yet.</p>
          <button 
            className={styles.addShowsButton} 
            onClick={() => router.push('/shows')}
          >
            Browse Shows
          </button>
        </div>
      ) : (
        <div className={styles.showsGrid}>
          {shows.map((userShow) => (
            <ShowCard
              key={userShow._id}
              userShow={userShow}
              onDelete={() => handleDelete(userShow._id)}
              onToggleFavorite={(isFavorite) => handleToggleFavorite(userShow._id, isFavorite)}
              onImageClick={() => handleImageClick(userShow)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyShowsSection;
