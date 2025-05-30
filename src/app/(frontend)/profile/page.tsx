"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from "sonner";

// Define TypeScript interfaces for better type safety
interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface StatusMessage {
  type: 'success' | 'error';
  message: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  phone?: string;
  address?: string;
  profileInfo?: {
    bio?: string;
    avatar?: {
      url: string;
      id: string;
    };
  };
  roles?: string;
}

const ProfilePage = () => {
  const router = useRouter();
  
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
  });
  
  // State for password management
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // State for loading and status indicators
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileStatus, setProfileStatus] = useState<StatusMessage | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<StatusMessage | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Removed unused avatar-related state variables since avatar functionality is commented out

  // Fetch user data directly instead of relying on auth context
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        
        // If user is admin, you can redirect to admin dashboard (optional)
        if (data.user?.roles === 'admin') {
          router.push('/admin');
          return;
        }

        setUser(data.user);
        
        // Populate form data
        if (data.user) {
          setFormData({
            name: data.user.name || '',
            username: data.user.username || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            address: data.user.address || '',
            bio: data.user.profileInfo?.bio || '',
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Don't redirect on general errors - only on 401
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Removed unused avatar-related functions since functionality is commented out

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileStatus(null);

    if (!user) {
      setSavingProfile(false);
      return;
    }

    try {
      // Prepare user data update
      const userData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        profileInfo: {
          bio: formData.bio,
          // Preserve existing avatar if it exists
          ...(user.profileInfo?.avatar && { avatar: user.profileInfo.avatar.id }),
        },
      };

      // Update user profile
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.errors?.[0]?.message || 'Failed to update profile');
      }

      // Set success message
      setProfileStatus({
        type: 'success',
        message: 'Profile updated successfully'
      });
      
      toast.success("Profile updated successfully");

      // Refresh user data
      const refreshResponse = await fetch('/api/users/me', {
        credentials: 'include',
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setUser(refreshData.user);
      }
    } catch (err) {
      setProfileStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'An error occurred'
      });
      
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordStatus(null);

    // Validate password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'New passwords do not match'
      });
      
      toast.error('New passwords do not match');
      setSavingPassword(false);
      return;
    }

    if (!user) {
      setSavingPassword(false);
      return;
    }

    try {
      // Update password
      const response = await fetch(`/api/users/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.errors?.[0]?.message || 'Failed to update password');
      }

      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Set success message
      setPasswordStatus({
        type: 'success',
        message: 'Password updated successfully'
      });
      
      toast.success("Password updated successfully");
    } catch (err) {
      setPasswordStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'An error occurred'
      });
      
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSavingPassword(false);
    }
  };

  // Status alert component for reusability
  const StatusAlert = ({ status }: { status: StatusMessage | null }) => {
    if (!status) return null;
    
    return (
      <Alert variant={status.type === 'success' ? 'default' : 'destructive'} className="mb-4">
        <div className="flex items-center gap-2">
          {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <AlertTitle>{status.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
        </div>
        <AlertDescription>{status.message}</AlertDescription>
      </Alert>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-[#3479ba] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only return null if we've actually confirmed there's no user
  if (!loading && !user) {
    return null;
  }

  // At this point, we know user is not null
  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className={`text-[clamp(2.5rem,3vw+0.5rem,4.5rem)] text-[#001e4c] font-semibold`}>My Profile</h2>
          <p className="mt-2 text-xl text-gray-600">
            Manage your account settings and profile information
          </p>
        </div>

        <div className="flex flex-col justify-center mx-auto mb-8 lg:flex-row lg:items-start">
          {/* Avatar section is commented out - remove if not needed */}

          <div className="w-full mx-auto lg:w-2/3">
            <Tabs defaultValue="profile">
              <TabsList className="flex p-1 mb-6 border border-blue-100 rounded-full shadow-sm bg-blue-50">
                <TabsTrigger value="profile" className='flex-1 py-2.5 px-4 rounded-full text-xl font-medium transition-all text-gray-500 data-[state=active]:bg-white data-[state=active]:text-[#3479ba] data-[state=active]:shadow-sm hover:text-blue-500'>Profile Information</TabsTrigger>
                <TabsTrigger value="password"  className='flex-1 py-2.5 px-4 rounded-full text-xl font-medium transition-all text-gray-500 data-[state=active]:bg-white data-[state=active]:text-[#3479ba] data-[state=active]:shadow-sm hover:text-blue-500'>Password</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal information and contact details
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleProfileSubmit}>
                    <CardContent className="space-y-4">
                      <StatusAlert status={profileStatus} />

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="name" className="block mb-1">
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            className='w-11/12'
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="username" className="block mb-1">
                            Username
                          </Label>
                          <Input
                            id="username"
                            name="username"
                             className='w-11/12'
                            value={formData.username}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email" className="block mb-1">
                          Email address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                           className='w-11/12'
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="block mb-1">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                           className='w-11/12'
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="address" className="block mb-1">
                          Address
                        </Label>
                        <Textarea
                          id="address"
                          name="address"
                           className='w-11/12'
                          value={formData.address}
                          onChange={handleChange}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bio" className="block mb-1">
                          Bio
                        </Label>
                        <Textarea
                          id="bio"
                          name="bio"
                        className='w-11/12'
                          value={formData.bio}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Tell us a little about yourself"
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        disabled={savingProfile}
                        className={`z-10 px-8  py-2  mt-2 rounded-md font-normal text-lg 
                            text-white bg-[#3479ba] 
                            border-2 border-transparent
                            hover:bg-[#f4f6f5] hover:text-[#3479ba] hover:border-[#3479ba]
                            transition-all duration-300 hover:cursor-pointer mx-auto`}
                      >
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handlePasswordSubmit}>
                    <CardContent className="space-y-4">
                      <StatusAlert status={passwordStatus} />

                      <div>
                        <Label htmlFor="currentPassword" className="block mb-1">
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          className='w-11/12'
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="newPassword" className="block mb-1">
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                           className='w-11/12'
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="block mb-1">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                           className='w-11/12'
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        disabled={savingPassword}
                        className={`z-10 px-8  py-1  mt-2 rounded-md font-normal text-lg 
                            text-white bg-[#3479ba] 
                            border-2 border-transparent
                            hover:bg-[#f4f6f5] hover:text-[#3479ba] hover:border-[#3479ba]
                            transition-all duration-300 hover:cursor-pointer `}
                      >
                        {savingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;