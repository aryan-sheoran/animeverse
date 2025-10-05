"use client";

import React from 'react';
import styles from './ShowCard.module.css';
import ShowSeasonRatings from './ShowSeasonRatings';

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

interface ShowCardProps {
  userShow: UserShow;
  onDelete: () => void;
  onToggleFavorite: (isFavorite: boolean) => void;
  onImageClick: () => void;
}

const ShowCard: React.FC<ShowCardProps> = ({ userShow, onDelete, onToggleFavorite, onImageClick }) => {
  const { showId: show } = userShow;

  if (!show) {
    return null;
  }

  const getImageSrc = (show: Show) => {
    // Use the image property directly from the show data
    // It should already have the correct URL from the API
    if (show.image) {
      if (show.image.startsWith('http')) {
        return show.image;
      }
      // Return as is if it's a relative path
      return show.image;
    }
    // Return empty string if no image - don't use default logo
    return '';
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'plan': return '#FF9800';
      case 'dropped': return '#F44336';
      default: return '#757575';
    }
  };

  const imageSrc = getImageSrc(show);
  
  return (
    <div 
      className={styles.showCard} 
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.showImage} onClick={onImageClick}>
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={show.title}
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className={styles.noImagePlaceholder}>
            <span>No Image</span>
          </div>
        )}
      </div>

      <div className={styles.showInfo}>
        <h3 className={styles.showTitle}>{show.title}</h3>
        <p className={styles.showGenre}>
          {Array.isArray(show.genre) ? show.genre.join(', ') : 
           Array.isArray(show.genres) ? show.genres.join(', ') : 
           show.genre || show.genres || 'Unknown'}
        </p>

        <div className={styles.cardActions}>
          <button 
            className={styles.actionBtn}
            onClick={handleDeleteClick}
            title="Remove from list"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowCard;
