'use client'

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const Webcam = dynamic(() => import('react-webcam'), { ssr: false });

export default function BBResultPage() {
  const [stage, setStage] = useState<'video' | 'results'>('video');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamRef = useRef<any>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement && stage === 'video') {
      const playPromise = videoElement.play();

      // Handle potential autoplay restrictions
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Video started successfully
            console.log('Video playback started');
          })
          .catch((error) => {
            console.error('Error attempting to play video:', error);
            // Optionally, add a user interaction requirement
            videoElement.addEventListener('click', () => {
              videoElement.play();
            });
          });
      }
    }
  }, [stage]);

  const handleVideoEnd = () => {
    setStage('results');
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  };

  // Video Stage
  if (stage === 'video') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <video 
          ref={videoRef}
          src="/videos/bb-result-intro.mp4"
          className="max-w-full max-h-full"
          onEnded={handleVideoEnd}
          playsInline
          preload="auto"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Results Stage
  return (
    <div className="min-h-screen flex">
      {/* Left Side: Result Image */}
      <div className="w-1/2 bg-gray-100 p-8 flex items-center justify-center">
        <div className="relative w-full h-[600px]">
          <Image 
            src="/images/bb-result-comparison.jpg" 
            alt="Body Builder Result"
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Right Side: Camera Comparison */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-4 relative w-full h-[400px]">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover rounded-lg"
              videoConstraints={{
                width: 500,
                height: 400,
                facingMode: "user"
              }}
            />
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={captureImage}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Capture Photo
            </button>
          </div>

          {capturedImage && (
            <div className="mt-4">
              <h3 className="text-xl mb-2">Captured Image:</h3>
              <div className="relative w-full h-[200px]">
                <Image 
                  src={capturedImage} 
                  alt="Captured" 
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
  );
}