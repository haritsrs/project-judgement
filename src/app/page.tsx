"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';  // Changed from next/router
import Image from 'next/image';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const LandingPage = () => {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);  // Added missing state

  useEffect(() => {
    // Trigger loaded animation on mount
    setIsLoaded(true);
  }, []);

  const handleStart = async () => {
    setIsExiting(true);

    // Wait for the fade-out animation before navigating
    await delay(2000);

    // Navigate to the next page
    router.push('/quiz'); // This now uses the new router
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
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
        <source src="/placeholder-video.mp4" type="video/mp4" />
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
        {/* Title Image */}
        <div className="w-full max-w-2xl px-4">
          <Image
            src="/placeholder-title.png"
            alt="Title"
            width={500}
            height={100}
            className="w-full h-auto"
          />
        </div>

        {/* Glassmorphism Start Button */}
        <button
          onClick={handleStart}
          className="group relative px-12 py-4 text-xl font-bold text-white/90 
                   backdrop-blur-md bg-white/10 border border-white/20 rounded-full
                   hover:bg-white/20 hover:border-white/30 hover:scale-105
                   transition-all duration-300 ease-out
                   shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
                   disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isExiting}
        >
          {/* Button Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-300/30 to-purple-300/30 blur-xl 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Button Content */}
          <div className="relative flex items-center space-x-2">
            <span>START</span>
            
            {/* Animated Arrow */}
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;