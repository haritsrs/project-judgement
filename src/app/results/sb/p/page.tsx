'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Webcam from 'react-webcam';
import { collection, query, where, orderBy, limit, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../../firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResultsPage() {
  const router = useRouter();
  const stages = ['video', 'results'] as const;
  const [stage, setStage] = useState<Stage>('video');
  const webcamRef = useRef<Webcam>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [avatarConfirmation, setAvatarConfirmation] = useState<'Sudah' | 'Belum' | null>(null);

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

  // Skip button timer
  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setShowSkipButton(true);
    }, 80000); // 80 seconds

    return () => clearTimeout(skipTimer);
  }, []);

  // Submit handler
  const handleSubmit = async (status: 'Sudah' | 'Belum') => {
    try {
      // Retrieve the latest quiz document
      const quizQuerySnapshot = await getDocs(
        query(
          collection(db, "quiz-responses"),
          orderBy("timestamp", "desc"),
          limit(1)
        )
      );
  
      if (!quizQuerySnapshot.empty) {
        // Get the most recent quiz document
        const latestQuizDoc = quizQuerySnapshot.docs[0];
  
        // Update the existing document with avatar confirmation
        await updateDoc(latestQuizDoc.ref, {
          avatarConfirmation: status,
          avatarConfirmationTimestamp: serverTimestamp()
        });
        
        // Return to main page after submission
        router.push('/');
      } else {
        console.error("No quiz document found");
      }
    } catch (error) {
      console.error("Error updating avatar confirmation:", error);
    }
  };

  // Video stage
  if (stage === 'video') {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-black">
        <video
          ref={videoRef}
          src="/videos/p/sb.mp4"
          className="w-full h-full object-cover"
          onEnded={() => setStage('results')}
          autoPlay
          playsInline
          muted
        >
          Your browser does not support the video tag.
        </video>
        
        {showSkipButton && (
          <button 
            onClick={() => setStage('results')}
            className="absolute z-10 bottom-10 left-1/2 transform -translate-x-1/2 bg-white/70 text-black px-6 py-3 rounded-lg hover:bg-white/90 transition"
          >
            Lanjut ke hasil
          </button>
        )}
      </div>
    );
  }

// Results stage
if (stage === 'results') {
  return (
    <div className="fixed inset-0 flex bg-black">
      {/* Left side - Picture */}
      <div className="w-1/2 bg-gray-900 flex items-center justify-center relative">
        <Image 
          src="/images/p/sb.png" 
          alt="result"
          fill
          priority
          className="object-contain"
        />
      </div>

      {/* Right side - Webcam */}
      <div className="w-1/2 bg-black flex items-center justify-center relative">
        {isWebcamReady ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: "user"
            }}
            className="w-full h-full object-cover"
            mirrored={true}
          />
        ) : (
          <div className="text-white">
            Webcam not available. Please check your camera permissions.
          </div>
        )}
      </div>

      {/* Confirmation Overlay - Centered at the bottom */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 z-50 pb-8 flex justify-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-white text-center text-xl mb-4">
            Apakah avatarnya sudah cocok dengan penampilanmu?
          </h2>
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => handleSubmit('Belum')}
              className="flex-1 bg-red-900/70 text-white px-6 py-3 rounded-xl hover:bg-red-500/90 transition"
            >
              Belum
            </button>
            <button 
              onClick={() => handleSubmit('Sudah')}
              className="flex-1 bg-green-900/70 text-white px-6 py-3 rounded-xl hover:bg-green-500/90 transition"
            >
              Sudah
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
  // Fallback return (should never reach here)
  return null;
}