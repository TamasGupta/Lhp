import React, { useState, useEffect } from 'react';
import { Sun, Moon, User } from 'lucide-react';
import Logo from '../assets/Preview.png'
type NavbarProps = {
  onThemeToggle: () => void;
  isDarkMode: boolean;
  handleSignOut: () => void;
};

export const Navbar: React.FC<NavbarProps> = ({ onThemeToggle, isDarkMode ,handleSignOut }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true); // Track navbar visibility
  const [lastScrollY, setLastScrollY] = useState(0); // Track the last scroll position

  // Function to handle the scroll event
  const handleScroll = () => {
    if (typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        // User is scrolling down, hide navbar
        setIsNavbarVisible(false);
      } else {
        // User is scrolling up, show navbar
        setIsNavbarVisible(true);
      }

      // Update the last scroll position
      setLastScrollY(currentScrollY);
    }
  };

  // Add scroll event listener on component mount
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleProfileToggle = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav
      className={`bg-gray-800 text-white shadow-lg fixed w-full top-0 transition-transform duration-300 ease-in-out z-50 ${
        isNavbarVisible ? 'transform-none' : '-translate-y-full'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-semibold flex items-center gap-3">
       
           <div className='w-10 h-10 rounded-full overflow-hidden'>
           <img src={Logo} alt='logo' className=""/>
           </div>
            <span className='greatVibes'>Last Hour Prep</span>
          
        </div>

        {/* Navigation Links */}

        {/* Theme Toggle Button */}
        <button
          className="p-2 rounded-full hover:bg-gray-700"
          onClick={onThemeToggle}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <Sun className="w-6 h-6 text-yellow-500" />
          ) : (
            <Moon className="w-6 h-6 text-gray-300" />
          )}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={handleProfileToggle}
            className="flex items-center p-2 rounded-full bg-gray-700 hover:bg-gray-600"
          >
            <User className="w-6 h-6" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg">
              <a href="/profile" className="block px-4 py-2 hover:bg-gray-200">Profile</a>
              <a href="/settings" className="block px-4 py-2 hover:bg-gray-200">Settings</a>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-200" onClick={handleSignOut}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
