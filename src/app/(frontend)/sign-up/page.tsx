"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateRegistrationForm, type ValidationErrors } from '@/utilities/zodSchema';
import { CircleAlert } from 'lucide-react';

const SimpleRegistrationForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    roles: 'petOwner', // Default role
    bio: '',
    gdprConsent: false, // Added for GDPR consent
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement; // Cast to access 'checked' property
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Use the validateRegistrationForm helper function
    const validation = validateRegistrationForm(formData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      setLoading(false);
      return;
    }
    
    try {
      // Prepare user data for Payload
      const userData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        roles: formData.roles,
        phone: formData.phone,
        address: formData.address,
        profileInfo: {
          bio: formData.bio,
        },
      };

      console.log("Submitting data:", userData);

      // Create user using Payload's standard API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Registration failed');
      }

      // Login the user automatically after registration
      const loginResponse = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        
        // Redirect based on user role
        if (loginData.user?.roles === 'admin') {
          router.push('/admin');
        } else {
          // Redirect regular users to their dashboard
          router.push('/my-dashboard');
        }
      } else {
        router.push('/login');
      }
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : 'Registration failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto border border-gray-300 bg-white rounded-lg shadow-md p-8">
        <h2 className="mt-6 text-3xl text-[#001e4c] pt-2  font-bold leading-none text-center 
          text-[36px] sm:text-[clamp(2.5rem,3vw+0.5rem,4.5rem)] tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-xl text-center text-gray-600">
          Or{' '}
          <Link href="/login" className="font-medium text-[#3479ba] hover:text-[#3479ba]">
            sign in to your account
          </Link>
        </p>
        
        <form className="mt-8 space-y-6 border-none shadow-none" onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <div className="p-3 text-xl font-medium text-center text-red-500 rounded-md bg-red-50">
              {errors.form}
            </div>
          )}
          
          <div className="space-y-4 rounded-md border-none shadow-none">
            <div>
              <label htmlFor="name" className="block text-xl font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`box-border relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] focus:z-10 sm:text-xl`}
                placeholder="Full Name"
              />
              {errors.name && (
                <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
                  <CircleAlert/><p className='my-0'>{errors.name}</p>
                </div>
                
              )}
            </div>
            
            <div>
              <label htmlFor="username" className="block text-xl font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className={`box-border relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] focus:z-10 sm:text-xl`}
                placeholder="Username"
              />
              {errors.username && (
               <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
                  <p className='my-0'>{errors.username}</p>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-xl font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`box-border relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] focus:z-10 sm:text-xl`}
                placeholder="Email address"
              />
              {errors.email && (
                 <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
                  <CircleAlert/><p className='my-0'>{errors.email}</p>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xl font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`box-border relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] focus:z-10 sm:text-xl`}
                placeholder="Password"
              />
              {errors.password && (
                 <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
                  <CircleAlert/><p className='my-0'>{errors.password}</p>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-xl font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`box-border relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] focus:z-10 sm:text-xl`}
                placeholder="Confirm Password"
              />
              {errors.confirmPassword && (
                <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
                  <CircleAlert/><p className='my-0'>{errors.confirmPassword}</p>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-xl font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                className={`box-border relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] focus:z-10 sm:text-xl`}
                placeholder="Phone Number"
              />
              {errors.phone && (
                <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
                  <CircleAlert/><p className='my-0'>{errors.phone}</p>
                </div>
              )}
            </div>    
            <div>
              <label htmlFor="roles" className="block text-xl font-medium text-gray-700">
                Role
              </label>
              <select
                id="roles"
                name="roles"
                value={formData.roles}
                onChange={handleChange}
                className={`box-border relative block w-full px-3 py-2 mt-1 text-gray-900 border ${errors.roles ? 'border-red-500' : 'border-gray-300'} rounded-md appearance-none focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] focus:z-10 sm:text-xl`}
              >
                <option value="petOwner">Pet Owner</option>
              </select>
              {errors.roles && (
                <p className="px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50">{errors.roles}</p>
              )}
            </div>
            
            <div className="flex items-center ">
              <input
                id="gdprConsent"
                name="gdprConsent"
                type="checkbox"
                checked={formData.gdprConsent}
                onChange={handleChange}
                className={`box-border h-5 w-5 text-[#3479ba] focus:ring-[#3479ba] ${errors.gdprConsent ? 'border-red-500' : 'border-gray-300'} rounded`}
              />
              <label htmlFor="gdprConsent" className="block ml-2 text-lg text-gray-700">
                I consent to the processing of my personal data
              </label>
            </div>
            {errors.gdprConsent && (
              <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
                  <CircleAlert/><p className='my-0'>{errors.gdprConsent}</p>
                </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md group hover:bg-[#3479ba] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3479ba] disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleRegistrationForm;