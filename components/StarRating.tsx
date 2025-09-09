import React from 'react';

interface StarRatingProps {
  rating: number;
  isDisplayOnly?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, isDisplayOnly = false, onRatingChange }) => {
  const handleRating = (newRating: number) => {
    if (!isDisplayOnly && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <div className={`flex items-center ${isDisplayOnly ? 'star-rating-display' : 'flex-row-reverse justify-end'}`}>
      {[5, 4, 3, 2, 1].map((starValue) => (
        <React.Fragment key={starValue}>
          {!isDisplayOnly && (
            <input
              type="radio"
              id={`star${starValue}`}
              name="rating"
              value={starValue}
              checked={rating === starValue}
              onChange={() => handleRating(starValue)}
              className="star-rating-input"
            />
          )}
          <label
            htmlFor={`star${starValue}`}
            className="star-rating-label transition-colors"
            style={isDisplayOnly && starValue <= rating ? { color: '#f59e0b' } : {}}
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </label>
        </React.Fragment>
      ))}
    </div>
  );
};

export default StarRating;
