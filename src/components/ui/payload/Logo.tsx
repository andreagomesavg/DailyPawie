import Image from "next/image";




export default async function Logo() {
    const logoPath = "/images/pot-icon.png";
      
     
      return (
          <div>
                <Image 
                  className="hidden object-contain h-20 dark:block" 
                  src={logoPath} 
                  alt="icon" 
                  width={1200}
                  height={800}
                />
              </div>
      )
}