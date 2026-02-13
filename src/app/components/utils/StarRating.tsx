import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

interface StarRatingProps {
  score: number;
  showScore?: boolean;
  size?: "sm" | "lg" | "xl" | "2xl";
}

const StarRating: React.FC<StarRatingProps> = ({ 
  score, 
  showScore = true, 
  size = "lg" 
}) => {
  return (
    <div className="flex items-center justify-left gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <FontAwesomeIcon
          key={index}
          icon={faStar}
          className={index < score ? "text-yellow-400" : "text-gray-300"}
          size={size}
        />
      ))}
      {showScore && <span className="ml-1">({score})</span>}
    </div>
  );
};

export default StarRating;