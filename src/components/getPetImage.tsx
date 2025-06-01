import Image from 'next/image'

interface PetImageProps {
  pet: {
    photo?: {
      url?: string
      alt?: string
      sizes?: {
        thumbnail?: {
          url?: string
        }
        medium?: {
          url?: string
        }
      }
    }
    name: string
  }
  size?: 'thumbnail' | 'medium' | 'large'
  className?: string
}

export default function PetImage({ pet, size = 'medium', className = '' }: PetImageProps) {
  // Función para obtener la URL correcta basada en el tamaño
  const getImageUrl = () => {
    if (!pet.photo) return null
    
    // Si se especifica un tamaño y existe, usar ese
    if (size !== 'large' && pet.photo.sizes?.[size]?.url) {
      return pet.photo.sizes[size].url
    }
    
    // Sino, usar la URL original
    return pet.photo.url
  }

  const imageUrl = getImageUrl()
  
  if (!imageUrl) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No image</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imageUrl}
        alt={pet.photo?.alt || `Foto de ${pet.name}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}

// Ejemplo de uso en un componente de lista de mascotas
export function PetCard({ pet }: { pet: any }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <PetImage 
        pet={pet} 
        size="medium"
        className="w-full h-48"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{pet.name}</h3>
        <p className="text-gray-600">{pet.species} - {pet.breed}</p>
      </div>
    </div>
  )
}

// Ejemplo de uso en el perfil detallado de mascota
export function PetProfile({ pet }: { pet: any }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PetImage 
          pet={pet} 
          size="large"
          className="w-full h-96 rounded-lg"
        />
        <div>
          <h1 className="text-3xl font-bold mb-4">{pet.name}</h1>
          <div className="space-y-2">
            <p><span className="font-medium">Especie:</span> {pet.species}</p>
            <p><span className="font-medium">Raza:</span> {pet.breed}</p>
            <p><span className="font-medium">Edad:</span> {pet.age}</p>
            <p><span className="font-medium">Peso:</span> {pet.weight}kg</p>
          </div>
        </div>
      </div>
    </div>
  )
}