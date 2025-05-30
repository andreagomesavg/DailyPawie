import { useState } from 'react';

// HeartIcon Component with flexible sizing
export const HeartIcon = ({ 
  color = "#fafcff", 
  width = 16,
  height = 16,
  className = ""
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      width={width} 
      height={height}
      className={className}
    >
      <path 
        fill={color} 
        d="M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4l87 0c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31l104.5 0c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240l-132 0c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9L16 240c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9l0-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1l0 5.8c0 16.9-2.8 33.5-8.3 49.1z" 
      />
    </svg>
  );
};

// Demo showing various small sizes
const SmallHeartIconDemo = () => {
  const sizes = [
    { width: 12, height: 12, label: '12px' },
    { width: 16, height: 16, label: '16px' },
    { width: 20, height: 20, label: '20px' },
    { width: 24, height: 24, label: '24px' }
  ];
  
  const colors = [
    { name: "White", value: "#fafcff" },
    { name: "Pink", value: "#E91E63" },
    { name: "Red", value: "#F44336" },
    { name: "Blue", value: "#2196F3" }
  ];
  
  const [activeColor, setActiveColor] = useState("#fafcff");
  
  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-bold">Small Heart Icon</h1>
      
      <div className="mb-6">
        <h2 className="mb-2 text-lg">Color Options</h2>
        <div className="flex flex-wrap gap-3 p-3 bg-gray-800 rounded">
          {colors.map(color => (
            <button
              key={color.value}
              className="flex items-center gap-1 p-1 rounded hover:bg-gray-700"
              onClick={() => setActiveColor(color.value)}
              style={{ backgroundColor: color.value === activeColor ? '#4A5568' : '' }}
            >
              <HeartIcon color={color.value} width={12} height={12} />
              <span className="text-xl text-white">{color.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="mb-2 text-lg">Size Options</h2>
        <div className="flex items-center gap-6 p-3 bg-gray-800 rounded">
          {sizes.map((size) => (
            <div key={size.label} className="flex flex-col items-center">
              <HeartIcon color={activeColor} width={size.width} height={size.height} />
              <span className="mt-1 text-xl text-white">{size.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="mb-2 text-lg">Usage Examples</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-1 p-2 bg-gray-800 rounded">
            <HeartIcon color={activeColor} width={12} height={12} />
            <span className="text-xl text-white">Like</span>
          </div>
          <div className="flex items-center gap-1 p-2 bg-gray-800 rounded">
            <HeartIcon color={activeColor} width={12} height={12} />
            <span className="text-xl text-white">Favorite</span>
          </div>
          <div className="flex items-center gap-1 p-2 bg-gray-800 rounded">
            <span className="text-xl text-white">2.5k</span>
            <HeartIcon color={activeColor} width={12} height={12} />
          </div>
          <div className="flex items-center gap-1 p-2 bg-gray-800 rounded">
            <HeartIcon color={activeColor} width={16} height={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmallHeartIconDemo;