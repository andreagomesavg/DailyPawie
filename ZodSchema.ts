import { z } from "zod";

// Función auxiliar para validar archivos de imagen
const isValidImageFile = (file: File | undefined): boolean => {
  if (!file) return false;
  return file.type.startsWith("image/");
};

// Esquema para validar el formulario de creación de mascotas
export const petFormSchema = z.object({
  // photo - Campo obligatorio, debe ser un archivo de imagen
  photo: z
    .instanceof(File, { message: "Photo is required" })
    .refine((file) => file.size > 0, {
      message: "Photo file cannot be empty",
    })
    .refine((file) => isValidImageFile(file), {
      message: "File must be a valid image (jpg, png, etc.)",
    }),

  // name - Campo obligatorio, debe tener al menos 2 caracteres
  name: z
    .string()
    .min(1, { message: "Pet name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .trim(),

  // species - Campo obligatorio, debe ser una de las opciones válidas
  species: z
    .enum(["dog", "cat", "another"], {
      errorMap: () => ({ message: "Please select a valid species" }),
    }),

  // breed - Campo opcional, máximo 50 caracteres
  breed: z
    .string()
    .max(50, { message: "Breed cannot exceed 50 characters" })
    .trim()
    .optional()
    .or(z.literal("")),

  // sex - Campo opcional, debe ser una de las opciones válidas
  sex: z
    .enum(["male", "female"], {
      errorMap: () => ({ message: "Sex must be either male or female" }),
    })
    .optional()
    .or(z.literal("")),

  // age - Campo opcional, debe ser un número positivo
  age: z
    .number({ invalid_type_error: "Age must be a number" })
    .positive({ message: "Age must be a positive number" })
    .optional()
    .or(z.string().refine((val) => !val || !isNaN(Number(val)), {
      message: "Age must be a valid number",
    }).transform(val => val === "" ? undefined : Number(val))),
});

// Tipo derivado del esquema para usar en componentes
export type PetFormData = z.infer<typeof petFormSchema>;

// Esquema para validar la carga exitosa de fotos
export const photoUploadSchema = z.object({
  id: z.string(),
  url: z.string().url({ message: "Invalid URL for uploaded photo" }),
});

// Esquema para validar la respuesta de creación de mascotas
export const petCreationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  species: z.string(),
  breed: z.string().optional(),
  sex: z.string().optional(),
  age: z.number().optional(),
  photo: z.object({
    id: z.string(),
    url: z.string().url(),
  }).optional(),
  petOwner: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Esquema para validar errores en la API
export const apiErrorSchema = z.object({
  message: z.string(),
  errors: z.array(
    z.object({
      message: z.string(),
      field: z.string().optional(),
    })
  ).optional(),
});