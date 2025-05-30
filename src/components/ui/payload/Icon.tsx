import Image from "next/image";

export default function Icon() {
  // Simple approach: directly reference the image from public folder
  const iconPath = "/images/pot-icon.png";
  
  return (
    <div>
      <Image 
        className="hidden object-contain h-20 dark:block" 
        src={iconPath} 
        alt="icon" 
        width={1200}
        height={800}
      />
    </div>
  );
}