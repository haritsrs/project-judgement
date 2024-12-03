"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const LandingPage = () => {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger loaded animation on mount
    setIsLoaded(true);
  }, []);

  const handleStart = async () => {
    setIsExiting(true);

    // Wait for the fade-out animation before navigating
    await delay(500);

    // Navigate to the next page
    router.push('/quiz');
  };

  return (
    <div 
      onClick={handleStart} 
      className="relative h-screen w-full overflow-hidden cursor-pointer"
    >
      {/* Fade-to-black Overlay */}
      <div 
        className={`absolute inset-0 bg-black z-50 transition-opacity duration-2000 pointer-events-none
                   ${isExiting ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className={`absolute top-0 left-0 w-full h-full object-cover
                   transition-opacity duration-1000
                   ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      >
        <source src="/lobby.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay to Darken Video */}
      <div className={`absolute top-0 left-0 w-full h-full bg-black/50
                      transition-opacity duration-1000
                      ${isExiting ? 'opacity-0' : 'opacity-100'}`} 
      />

      {/* Content Container */}
      <div className={`relative z-10 h-full flex flex-col items-center justify-center space-y-8
                      fade-in ${isLoaded ? 'fade-in-loaded' : ''}
                      ${isExiting ? 'opacity-0 scale-95' : ''}`}
      >
        {/* Title Image *
        <div className="w-full max-w-2xl px-4">
          <Image
            src="/"
            alt="Title"
            width={500}
            height={100}
            className="w-full h-auto"
          />
        </div>/}

        {/* Click Anywhere to Start Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-white text-2xl font-bold 
            opacity-70 animate-pulse 
            transition-opacity duration-500 
            ${isExiting ? 'opacity-0' : 'opacity-70'}`}
          >
            Click Anywhere to Start
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;