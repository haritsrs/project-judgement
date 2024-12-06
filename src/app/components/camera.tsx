"use client";

import { useEffect, useRef, useState } from 'react';

interface CameraProps {
  isCameraActive?: boolean;
}

export default function Camera({ isCameraActive = true }: CameraProps) {
  const [isClient, setIsClient] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'requesting' | 'ready' | 'error'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Extensive logging for debugging
    console.log('Camera Component Mounted');
    console.log('Is Client:', isClient);
    console.log('Is Camera Active:', isCameraActive);

    // Only attempt to access camera on client and when active
    if (!isClient || !isCameraActive) {
      console.log('Skipping camera access');
      return;
    }

    const startCamera = async () => {
      console.log('Starting camera access...');
      setCameraStatus('requesting');
      
      try {
        // Check camera availability before requesting
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        console.log('Available video devices:', videoDevices);
        
        if (videoDevices.length === 0) {
          console.error('No video devices found');
          setCameraStatus('error');
          return;
        }

        const constraints: MediaStreamConstraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        console.log('Camera stream obtained');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            videoRef.current?.play().catch(error => {
              console.error('Error playing video:', error);
              setCameraStatus('error');
            });
          };

          videoRef.current.onplay = () => {
            console.log('Video started playing');
            setCameraStatus('ready');
          };

          videoRef.current.onerror = (e) => {
            console.error('Video error:', e);
            setCameraStatus('error');
          };
        }
      } catch (error) {
        console.error('Camera access error:', error);
        setCameraStatus('error');
        
        if (error instanceof Error) {
          switch (error.name) {
            case 'NotAllowedError':
              alert('Camera access was denied. Please check your browser permissions.');
              break;
            case 'NotFoundError':
              alert('No camera found on this device.');
              break;
            case 'ConstraintNotSatisfiedError':
              alert('The requested camera constraints cannot be satisfied.');
              break;
            default:
              alert(`Camera error: ${error.message}`);
          }
        }
      }
    };

    // Add a small delay to ensure everything is ready
    const timeoutId = setTimeout(startCamera, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [isClient, isCameraActive]);

  // Render nothing on server
  if (!isClient) {
    return null;
  }

  const renderCameraContent = () => {
    console.log('Current camera status:', cameraStatus);
    
    switch (cameraStatus) {
      case 'idle':
        return <div>Camera initializing...</div>;
      case 'requesting':
        return <div>Requesting camera access...</div>;
      case 'error':
        return (
          <div className="text-red-500">
            Failed to access camera. Please check permissions.
          </div>
        );
      case 'ready':
        return (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        );
    }
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {renderCameraContent()}
    </div>
  );
}