'use client';

import React, { useEffect, useRef } from 'react';
import styles from './PopularShows.module.css';

interface PopularShow {
  id: string;
  showId?: string;
  image: string;
  title: string;
  description?: string;
  type?: string;
}

interface PopularShowsProps {
  popularShows: PopularShow[];
  onImageClick?: (image: string, title: string, description: string, showId?: string) => void;
}

const PopularShows: React.FC<PopularShowsProps> = ({ popularShows = [], onImageClick }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(6); // Start at first real card

  // Carousel setup - Fixed infinite loop with proper cloning
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || !popularShows || popularShows.length === 0) {
      return;
    }

    // Skip carousel setup if we have fewer than 3 shows - just display them normally
    if (popularShows.length < 3) {
      return;
    }

    const gap = 20;
    const cardWidth = 220;
    const visibleCards = Math.min(6, popularShows.length); // Adjust visible cards based on available shows
    const scrollAmount = cardWidth + gap;
    
    // Remove any existing clones first
    carousel.querySelectorAll('[aria-hidden="true"]').forEach(clone => clone.remove());

    // Get original cards (only original cards, not clones)
    const originalCards = Array.from(carousel.children).filter(child => !child.hasAttribute('aria-hidden'));
    const cardCount = originalCards.length;

    // Create clones for infinite scrolling
    const firstSetClones = originalCards.slice(0, visibleCards).map(card => {
      const clone = card.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      return clone;
    });

    const lastSetClones = originalCards.slice(-visibleCards).map(card => {
      const clone = card.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      return clone;
    });

    // Add clones to carousel
    lastSetClones.forEach(clone => carousel.insertBefore(clone, carousel.firstChild));
    firstSetClones.forEach(clone => carousel.appendChild(clone));

    // Reset to initial position (start at first real card)
    currentIndexRef.current = visibleCards; // Start at index 6 (first real card)
    
    const updatePosition = (smooth = true) => {
      if (smooth) {
        carousel.style.transition = 'transform 0.5s ease-in-out';
      } else {
        carousel.style.transition = 'none';
      }
      const translateX = -currentIndexRef.current * scrollAmount;
      carousel.style.transform = `translateX(${translateX}px)`;
      
      // Force reflow after position change
      if (!smooth) {
        // eslint-disable-next-line no-unused-expressions
        carousel.offsetHeight;
      }
    };

    const handleTransitionEnd = (e: TransitionEvent) => {
      // Only handle transitions for the carousel itself, not child elements
      if (e.target !== carousel) return;
      
      // If we're at the end clones, jump to the real first cards
      if (currentIndexRef.current >= cardCount + visibleCards) {
        currentIndexRef.current = visibleCards;
        updatePosition(false);
      } else if (currentIndexRef.current <= 0) {
        currentIndexRef.current = cardCount;
        updatePosition(false);
      }
    };

    // Set up event handlers
    const nextHandler = () => {
      currentIndexRef.current++;
      updatePosition(true);
    };

    const prevHandler = () => {
      // If we're exactly at the first real card, move to the cloned area before decrement
      if (currentIndexRef.current === visibleCards) {
        currentIndexRef.current = visibleCards - 1;
        updatePosition(true);
      } else {
        currentIndexRef.current--;
        updatePosition(true);
      }
    };

    // Store handlers for external use
    (carousel as any).nextHandler = nextHandler;
    (carousel as any).prevHandler = prevHandler;

    carousel.addEventListener('transitionend', handleTransitionEnd);

    // Set initial position without animation
    updatePosition(false);

    return () => {
      carousel.removeEventListener('transitionend', handleTransitionEnd);
      // remove clones on cleanup
      carousel.querySelectorAll('[aria-hidden="true"]').forEach(clone => clone.remove());
    };
  }, [popularShows]);

  const handleCarouselNext = () => {
    const carousel = carouselRef.current;
    if (carousel && (carousel as any).nextHandler) {
      (carousel as any).nextHandler();
    }
  };

  const handleCarouselPrev = () => {
    const carousel = carouselRef.current;
    if (carousel && (carousel as any).prevHandler) {
      (carousel as any).prevHandler();
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Popular This Week</h2>
      </div>
      <div className={styles.popularCarouselWrapper}>
        <div className={styles.popularListCarousel} ref={carouselRef}>
          {popularShows.map((show, index) => (
            <div 
              key={index} 
              className={styles.episodeCard} 
              onClick={() => onImageClick && onImageClick(show.image, show.title, show.description || '', show.showId || show.id)}
            >
              <div className={styles.episodeThumbnail}>
                <img src={show.image} alt={show.title} />
              </div>
              <div className={styles.episodeInfo}>
                <h3>{show.title}</h3>
              </div>
            </div>
          ))}
        </div>
        {popularShows.length > 6 && (
          <>
            <button className={`${styles.prevBtn} ${styles.popularPrev}`} onClick={handleCarouselPrev}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className={`${styles.nextBtn} ${styles.popularNext}`} onClick={handleCarouselNext}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PopularShows;
