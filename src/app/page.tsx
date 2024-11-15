"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleStart = () => {
    // Add your navigation or action logic here
    console.log('Start clicked');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/placeholder-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay to make video darker and ensure text is readable */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50" />

      {/* Content Container */}
      <div className={`relative z-10 h-full flex flex-col items-center justify-center space-y-8 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
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
                   shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
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