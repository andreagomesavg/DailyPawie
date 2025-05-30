"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { CircleAlert } from 'lucide-react';

// Login validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

type LoginData = z.infer<typeof loginSchema>;
type ValidationErrors = Partial<Record<keyof LoginData | 'form', string>>;

const validateLoginForm = (data: LoginData) => {
  try {
    loginSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as keyof LoginData] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { form: 'Validation failed' } };
  }
};

const LoginPage = () => {
  const router = useRouter(); // Ahora sí se usa
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user changes it
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate form data
    const validation = validateLoginForm(formData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Dispatch custom event to notify navbar of login
        window.dispatchEvent(new CustomEvent('userLogin'));
        
        // Use router instead of window.location for better UX
        if (data.user?.roles === 'admin') {
          router.push('/admin');
        } else {
          router.push('/my-dashboard');
        }
      } else {
        const errorData = await response.json();
        setErrors({ form: errorData.message || 'Login failed' });
      }
    } catch (_err) {
      setErrors({ form: 'An error occurred while logging in' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-[#3479ba]/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#3479ba]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl text-[#001e4c] pt-2 font-bold leading-none text-center 
          text-[36px] sm:text-[clamp(2.5rem,3vw+0.5rem,4.5rem)] tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Log in to your account to continue</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <div className="flex flex-row px-3 py-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
              <CircleAlert className="w-5 h-5" />
              <p className="my-0 text-base font-medium">{errors.form}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xl font-medium text-gray-700">
                Email address
              </label>
              <div className="relative mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`box-border mx-auto block w-11/12 px-3 py-3 pl-10 text-gray-900 placeholder-gray-400 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] sm:text-lg`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2 w-11/12 mx-auto">
                  <CircleAlert className="w-4 h-4" />
                  <p className="my-0 text-sm">{errors.email}</p>
                </div>
              )}
            </div>
            
            <div className="mx-auto">
              <label htmlFor="password" className="block text-xl font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`box-border mx-auto block w-11/12 px-3 py-3 pl-10 text-gray-900 placeholder-gray-400 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] sm:text-lg`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2 w-11/12 mx-auto">
                  <CircleAlert className="w-4 h-4" />
                  <p className="my-0 text-sm">{errors.password}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto">
            <button
              type="submit"
              disabled={loading}
              className="box-border hover:cursor-pointer relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white bg-[#3479ba] border border-transparent rounded-md group hover:bg-[#3479ba]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3479ba] disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;