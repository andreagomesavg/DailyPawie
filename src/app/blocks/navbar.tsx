"use client";

import { useState, useEffect } from "react";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { PawIcon } from "@/components/ui/PawIcon";

// Define interface for user object
interface UserInterface {
  id: string;
  name: string;
  email: string;
  roles: string;
}

const Navbar = () => {
  const [user, setUser] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Listen for focus events to refetch user data
    const handleFocus = () => {
      fetchUserData();
    };

    // Listen for storage events (in case login happens in another tab)
    const handleStorageChange = () => {
      fetchUserData();
    };

    // Listen for custom login events
    const handleLoginEvent = () => {
      fetchUserData();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleLoginEvent);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleLoginEvent);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Helper function to get user initials for avatar fallback
  const getUserInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 1);
  };

  return (
    <section className="py-1">
      <div className="w-full">
        <nav className="flex items-center justify-between px-5 py-0">
          <Link
            href={ `${process.env.NEXT_PUBLIC_SERVER_URL}`}
            className="flex items-center gap-2 text-[#001e4c] no-underline"
          >
            <PawIcon />
            <span className=" font-semibold tracking-tighter  text-[28px]">
              DailyPawie
            </span>
          </Link>
       
          
          {/* Auth Buttons - Conditionally rendered */}
          <div className="flex items-center hidden gap-4 lg:flex">
            {user && (
              <div>
                <a href="/my-dashboard" className="text-[#001e4c] no-underline hover:cursor-pointer hover:opacity-70 font-bold uppercase px-5">Dashboard</a>
              <Link href="/reminders" className="text-[#001e4c] no-underline hover:cursor-pointer hover:opacity-70 font-bold uppercase px-5">All Reminders</Link>
                </div>
               
          
          )}
            <Link  href="/news"  className="text-[#001e4c] no-underline hover:cursor-pointer hover:opacity-70 font-bold">NEWS </Link>
            
            <Link href="/contact" className="text-[#001e4c] no-underline hover:cursor-pointer hover:opacity-70 font-bold px-4 py-4 ">CONTACT </Link>
            
            {loading ? (
              <div className="w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center px-0 bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none">
                    <Avatar className="w-8 h-8 bg-[#001e4c] text-white">
                      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-[#001e4c] text-sm no-underline hover:cursor-pointer hover:opacity-70 font-semibold uppercase">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-none shadow-sm px-6">
                
                  <DropdownMenuItem asChild>
                    <a href="/my-dashboard" className="text-black no-underline hover:cursor-pointer hover:opacity-70">Dashboard</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/profile" className="text-black no-underline hover:cursor-pointer hover:opacity-70">Profile</a>
                  </DropdownMenuItem>
                  {user.roles === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="py-2 text-black no-underline border-t border-gray-500 rounded-t-none hover:cursor-pointer hover:opacity-70">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/sign-up" className="z-10 px-8  py-1   rounded-md font-normal text-lg 
                     text-white bg-[#001e4c] 
                     border-2 border-transparent
                     hover:bg-[#f4f6f5] hover:text-[#3479ba] 
                     transition-all duration-300 hover:cursor-pointer no-underline">Sign up</Link>
                
                <Link href="/login" className="z-10 px-8  py-1   rounded-md  text-lg 
                     hover:bg-[#f4f6f5]
                     border-2 
                      text-[#3479ba]  border-[#3479ba]
                     transition-all duration-300 hover:cursor-pointer no-underline font-normal">Log in</Link>
              </>
            )}
          </div>
          
          <Sheet >
            <SheetTrigger asChild className="bg-white border-none lg:hidden">
              <Button variant="outline" size="icon" >
                <MenuIcon className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="max-h-screen overflow-auto bg-white">
              <SheetHeader>
                <SheetTitle>
              
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4">
                {/* Show user info in mobile menu if logged in */}
                {user && (
                  <div className="flex items-center gap-3 py-3 mb-3 border-b">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xl text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}
                
                {/* Navigation links - only show when user is logged in */}
                {user && (
                  <div className="flex flex-col gap-6">
                    <Link href="/reminders" className="text-black no-underline hover:cursor-pointer hover:opacity-70">All Reminders</Link>
                    <a href="/my-dashboard" className="text-black no-underline hover:cursor-pointer hover:opacity-70">Dashboard</a>
                    <a href="/profile" className="text-black no-underline hover:cursor-pointer hover:opacity-70">Profile</a>
                    {user.roles === 'admin' && (
                      <Link href="/admin" className="text-black no-underline hover:cursor-pointer hover:opacity-70">Admin Panel</Link>
                    )}
                  </div>
                )}

                {/* News and Contact links - always visible */}
                <div className="flex flex-col gap-6 mt-6">
                  <Link href="/news" className="text-black no-underline hover:cursor-pointer hover:opacity-70">News</Link>
                  <Link href="/contact" className="text-black no-underline hover:cursor-pointer hover:opacity-70">Contact</Link>
                </div>
                
                <div className="flex flex-col gap-4 mt-6">
                  {!loading && user ? (
                    <>
                      <Button onClick={handleLogout} className={`z-10 px-8  py-1  mt-2 rounded-md font-normal text-lg 
                     text-white bg-[#3479ba] 
                     border-2 border-transparent
                     hover:bg-[#f4f6f5] hover:text-[#3479ba] hover:border-[#3479ba]
                     transition-all duration-300 hover:cursor-pointer `}>Logout</Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="outline"  className="w-full z-10 px-8  py-1   rounded-md  text-lg 
                     hover:bg-[#f4f6f5]
                     border-2 
                      text-[#3479ba]  border-[#3479ba]
                     transition-all duration-300 hover:cursor-pointer no-underline font-normal">Log in</Button>
                      </Link>
                      <Link href="/sign-up">
                        <Button className="w-full z-10 px-8  py-1   rounded-md font-normal text-lg 
                     text-white bg-[#001e4c] 
                     border-2 border-transparent
                     hover:bg-[#f4f6f5] hover:text-[#3479ba] 
                     transition-all duration-300 hover:cursor-pointer no-underline">Start for free</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </section>
  );
};

export { Navbar };