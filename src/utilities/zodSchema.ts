import { z } from 'zod';

/**
 * Zod schema for user registration form validation
 */
export const registrationSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username cannot exceed 30 characters" })
    .regex(/^[a-zA-Z0-9_-]+$/, { 
      message: "Username can only contain letters, numbers, underscores and hyphens" 
    }),
  
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email cannot exceed 100 characters" }),
  
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password cannot exceed 100 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  
  confirmPassword: z.string(),
  
  phone: z.string()
    .optional()
    .refine(val => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), {
      message: "Please enter a valid phone number"
    }),
  
  address: z.string().optional(),
  
  roles: z.enum(["petOwner", "petCarer"], {
    errorMap: () => ({ message: "Please select a valid role" })
  }),
  
  bio: z.string().optional(),
  
  gdprConsent: z.boolean().refine(val => val === true, {
    message: "You must accept the GDPR consent to register"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

/**
 * Type representing the registration form data
 */
export type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Error response type for form validation
 */
export type ValidationErrors = Partial<Record<keyof RegistrationFormData | 'form', string>>;

/**
 * Function to validate form data and return any errors
 */
export const validateRegistrationForm = (formData: unknown): { 
  success: boolean; 
  data?: RegistrationFormData; 
  errors?: ValidationErrors 
} => {
  try {
    const data = registrationSchema.parse(formData);
    return { success: true, data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Format Zod validation errors
      const errors: ValidationErrors = {};
      err.errors.forEach(error => {
        const path = error.path.join('.') as keyof ValidationErrors;
        errors[path] = error.message;
      });
      return { success: false, errors };
    }
    // Handle unexpected errors
    return { 
      success: false, 
      errors: { form: err instanceof Error ? err.message : 'Validation failed' }
    };
  }
};