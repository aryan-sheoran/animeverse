import React from 'react';
import styles from './ReviewForm.module.css';

interface ReviewFormProps {
  rating: number;
  setRating: (rating: number) => void;
  reviewTitle: string;
  setReviewTitle: (title: string) => void;
  reviewText: string;
  setReviewText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  rating,
  setRating,
  reviewTitle,
  setReviewTitle,
  reviewText,
  setReviewText,
  onSubmit,
  onClear
}) => {
  const handleStarClick = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className={styles.reviewFormContainer}>
      <h2 className={styles.formTitle}>Share Your Review</h2>
      
      <form className={styles.reviewForm} onSubmit={handleSubmit}>
        {/* 10-Star Rating System */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Rate this Anime (out of 10)</label>
          <div className={styles.starsContainer}>
            <div className={styles.stars}>
              {[...Array(10)].map((_, index) => (
                <div
                  key={index}
                  className={`${styles.star} ${index < rating ? styles.active : ''}`}
                  onClick={() => handleStarClick(index)}
                >
                  <i className="fas fa-star"></i>
                </div>
              ))}
            </div>
            <div className={styles.ratingValue}>{rating}/10</div>
          </div>
        </div>

        {/* Review Title */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Review Title</label>
          <input
            type="text"
            className={styles.formControl}
            placeholder="Give your review a catchy title"
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
            required
          />
        </div>

        {/* Brief Review */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Brief Review</label>
          <textarea
            className={`${styles.formControl} ${styles.reviewTextarea}`}
            placeholder="Share your thoughts about this anime..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            rows={6}
          />
        </div>

        {/* Action Buttons */}
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            <i className="fas fa-paper-plane"></i>
            Submit Review
          </button>
          <button type="button" className={styles.clearButton} onClick={onClear}>
            <i className="fas fa-trash"></i>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
