
import React from 'react';

interface DiagonalArrowProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const DiagonalArrow: React.FC<DiagonalArrowProps> = ({
  width = 35,
  height = 34,
  color = "#330099",
  className = '',
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 35 34" 
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_3002_1046)">
        <path 
          d="M15.3787 9.2218C15.9033 9.74647 17.2051 10.0116 18.3874 10.1446C19.9105 10.3185 21.457 10.2528 22.9461 9.89355C24.0626 9.62414 25.3093 9.19068 25.9853 8.51469M25.9853 8.51469C25.3093 9.19068 24.8751 10.438 24.6064 11.5538C24.2479 13.0437 24.1821 14.5902 24.3547 16.1118C24.4883 17.2948 24.7549 18.598 25.2782 19.1213M25.9853 8.51469L9.01471 25.4853" 
          stroke={color} 
          strokeWidth="2"
        />
      </g>
      <defs>
        <clipPath id="clip0_3002_1046">
          <rect width="24" height="24" fill="white" transform="translate(17.5 0.0294189) rotate(45)"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default DiagonalArrow;