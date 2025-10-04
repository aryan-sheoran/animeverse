"use client";

import React, { useState } from 'react';
import styles from './ShowCard.module.css';
import ShowSeasonRatings from './ShowSeasonRatings';

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

interface ShowCardProps {
  userShow: UserShow;
  onDelete: () => void;
  onToggleFavorite: (isFavorite: boolean) => void;
  onImageClick: () => void;
}

const ShowCard: React.FC<ShowCardProps> = ({ userShow, onDelete, onToggleFavorite, onImageClick }) => {
  const { showId: show } = userShow;
  const [isFavorite, setIsFavorite] = useState(userShow.isFavorite);

  if (!show) {
    return null;
  }

  const getImageSrc = (show: Show) => {
    if (show.image) {
      if (show.image.startsWith('http')) {
        return show.image;
      }
      return `/assets/card-images/${show.image}`;
    }
    return '/assets/card-images/logo.png';
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);
    onToggleFavorite(newFavoriteStatus);
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

  return (
    <div 
      className={styles.showCard} 
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.showImage} onClick={onImageClick}>
        <img src={getImageSrc(show)} alt={show.title} />

        <button 
          className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''}`}
          onClick={handleFavoriteClick}
        >
          <i className={isFavorite ? "fas fa-heart" : "far fa-heart"}></i>
        </button>
      </div>

      <div className={styles.showInfo}>
        <h3 className={styles.showTitle}>{show.title}</h3>
        <p className={styles.showGenre}>{Array.isArray(show.genre) ? show.genre.join(', ') : show.genre}</p>
        
        <div className={styles.showRating}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <i 
                key={i} 
                className={`fas fa-star ${i < Math.floor(show.rating) ? styles.filled : ''}`}
              ></i>
            ))}
          </div>
          <span className={styles.ratingValue}>{show.rating}</span>
        </div>

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
