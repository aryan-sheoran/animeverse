'use client';

import React, { useState, useEffect } from 'react';
import styles from './HeroCarousel.module.css';

interface HeroItem {
  id: string;
  homeId?: string;
  showId?: string;
  title: string;
  description: string;
  image: string;
  genres?: string[];
}

interface HeroCarouselProps {
  heroData: HeroItem[];
  onImageClick?: (image: string, title: string, description: string, showId?: string) => void;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ heroData, onImageClick }) => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Hero section auto-slide
  useEffect(() => {
    if (!heroData || heroData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroData]);

  const handleDotClick = (index: number) => {
    setCurrentHeroIndex(index);
  };

  const getSlideClass = (index: number) => {
    if (index === currentHeroIndex) {
      return `${styles.heroSlide} ${styles.active}`;
    } else if (index === (currentHeroIndex - 1 + heroData.length) % heroData.length) {
      return `${styles.heroSlide} ${styles.prev}`;
    } else if (index === (currentHeroIndex + 1) % heroData.length) {
      return `${styles.heroSlide} ${styles.next}`;
    } else {
      return `${styles.heroSlide} ${styles.hidden}`;
    }
  };

  if (!heroData || heroData.length === 0) {
    return <div className={styles.heroSection}>Loading...</div>;
  }

  const currentSlide = heroData[currentHeroIndex];

  return (
    <div className={styles.heroSection} id="hero-section">
      <div className={styles.heroContainer}>
        {heroData.map((item, index) => (
          <div 
            key={index}
            className={getSlideClass(index)}
            style={{ backgroundImage: `url(${item.image})` }}
            onClick={() => handleDotClick(index)}
          >
            {index === currentHeroIndex && (
              <>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                  <div className={styles.contentWrapper}>
                    <h1 className={styles.heroTitle}>{currentSlide?.title}</h1>
                    <p className={styles.heroDescription}>{currentSlide?.description}</p>
                    
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.primaryBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageClick && onImageClick(
                            currentSlide.image, 
                            currentSlide.title, 
                            currentSlide.description || '', 
                            currentSlide.showId || currentSlide.id
                          );
                        }}
                      >
                        <span>Review Now</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        
        {/* Progress Indicators */}
        <div className={styles.progressIndicators}>
          {heroData.map((_, index) => (
            <button
              key={index}
              className={`${styles.progressDot} ${index === currentHeroIndex ? styles.active : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className={styles.progressFill}></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
