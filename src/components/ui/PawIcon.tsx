import { useState } from 'react';

// PawIcon Component
type PawIconSize = 'small' | 'medium' | 'large';

interface PawIconProps {
  color?: string;
  size?: PawIconSize;
  className?: string;
}

export const PawIcon = ({ color = "currentColor", size = "medium", className = "" }: PawIconProps) => {
  // Determine the size in pixels
  const sizeMap: Record<PawIconSize, number> = {
    small: 24,
    medium: 32,
    large: 48
  };

  const pixelSize = sizeMap[size];

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      width={pixelSize} 
      height={pixelSize}
      className={className}
      style={{ fill: color }}
    >
      <path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5s.3-86.2 32.6-96.8s70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5l0 1.6c0 25.8-20.9 46.7-46.7 46.7c-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2C84.9 480 64 459.1 64 433.3l0-1.6c0-10.4 1.6-20.8 5.2-30.5zM421.8 282.7c-24.5-14-29.1-51.7-10.2-84.1s54-47.3 78.5-33.3s29.1 51.7 10.2 84.1s-54 47.3-78.5 33.3zM310.1 189.7c-32.3-10.6-46.9-53.9-32.6-96.8s52.1-69.1 84.4-58.5s46.9 53.9 32.6 96.8s-52.1 69.1-84.4 58.5z" />
    </svg>
  );
};

// Demo App with different icon implementations
const PawIconDemo = () => {
  const [activeColor, setActiveColor] = useState("#0077cc");
  
  const colors = [
    { name: "Blue", value: "#0077cc" },
    { name: "Brown", value: "#8B4513" },
    { name: "Orange", value: "#FF8C00" },
    { name: "Purple", value: "#800080" },
    { name: "Green", value: "#2E8B57" }
  ];
  
  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Paw Icon Component Demo</h1>
      
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Color Options</h2>
        <div className="flex flex-wrap gap-4">
          {colors.map(color => (
            <button
              key={color.value}
              className="flex items-center gap-2 p-2 border border-gray-300 rounded hover:bg-gray-100"
              onClick={() => setActiveColor(color.value)}
              style={{ borderColor: color.value === activeColor ? color.value : '' }}
            >
              <PawIcon color={color.value} size="small" />
              <span>{color.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Size Variations</h2>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <PawIcon color={activeColor} size="small" />
            <span className="mt-2 text-xl">Small</span>
          </div>
          <div className="flex flex-col items-center">
            <PawIcon color={activeColor} size="medium" />
            <span className="mt-2 text-xl">Medium</span>
          </div>
          <div className="flex flex-col items-center">
            <PawIcon color={activeColor} size="large" />
            <span className="mt-2 text-xl">Large</span>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Button Examples</h2>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            <PawIcon color="white" size="small" />
            <span>Pet Services</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50">
            <PawIcon color="#0077cc" size="small" />
            <span>Find Pets</span>
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="mb-4 text-xl font-semibold">Services List</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {['Dog Walking', 'Pet Sitting', 'Grooming', 'Training'].map((service, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded bg-gray-50">
              <PawIcon color={colors[index % colors.length].value} size="small" />
              <span>{service}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PawIconDemo;