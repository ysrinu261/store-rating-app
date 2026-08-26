import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ currentRating = 0, onRatingSubmit, disabled = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className="focus:outline-none disabled:cursor-not-allowed"
          onClick={() => onRatingSubmit(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-6 h-6 transition-colors duration-150 ${
              star <= (hover || currentRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
