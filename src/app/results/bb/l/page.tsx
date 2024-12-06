'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Webcam from 'react-webcam';

export default function BodyBuilderResultPage() {
  const stages = ['video', 'results', 'autoplay'] as const;
  const [stage, setStage] = useState<Stage>('video');
  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);

  type Stage = typeof stages[number];

  // Webcam setup and permissions
  useEffect(() => {
    const checkWebcamAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setIsWebcamReady(true);
        stream.getTracks().forEach(track => track.stop());
      } catch {
        setIsWebcamReady(false);
      }
    };

    checkWebcamAccess();
  }, []);

  // Webcam configuration
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  // Enhanced video handling
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleAutoplayFailure = () => {
      setStage('autoplay');
    };

    const tryAutoplay = async () => {
      try {
        await videoElement.play();
      } catch {
        handleAutoplayFailure();
      }
    };

    tryAutoplay();
  }, []);

  // Manual play handler
  const handleManualPlay = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.play();
      setStage('video');
    }
  };

  // Video end handler
  const handleVideoEnd = () => {
    setStage('results');
  };

  // Autoplay blocked stage
  if (stage === 'autoplay') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col space-y-4 p-4 text-center">
        <h2 className="text-white text-2xl mb-4">
          Video Autoplay Blocked
        </h2>
        <p className="text-gray-300 mb-6">
          Your browser has prevented automatic video playback. 
          Please tap the button below to start the video.
        </p>
        <button 
          onClick={handleManualPlay}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Play Video
        </button>
      </div>
    );
  }

  // Video stage
  if (stage === 'video') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src="/videos/l/bb.mp4"
          className="max-w-full max-h-full"
          onEnded={handleVideoEnd}
          autoPlay
          playsInline
          muted
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Results stage
  if (stage === 'results') {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gray-100 p-8 flex items-center justify-center">
          <div className="relative w-full h-[400px] md:h-[600px]">
            <Image 
              src="/images/bb-result-comparison.jpg" 
              alt="result"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-contain"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md space-y-4">
            <div className="relative w-full h-[300px] border-2 border-gray-300 rounded-lg overflow-hidden">
              {isWebcamReady ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  videoConstraints={videoConstraints}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Webcam not available. Please check your camera permissions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}