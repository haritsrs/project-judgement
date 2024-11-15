"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';

type SmokingStatus = 'TIDAK' | 'PASIF' | 'AKTIF' | 'AKUT';

interface QuizResponse {
  status: SmokingStatus;
  timestamp: Date;
}

const Avatar = () => {
  return (
    <motion.div
      className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center"
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="w-4 h-4 bg-brown-600 rounded-full mx-1" />
      <div className="w-6 h-2 bg-pink-400 rounded mt-2" />
    </motion.div>
  );
};

const QuizBox = ({ onSubmit }: { onSubmit: (status: SmokingStatus) => void }) => {
  return (
    <div className="relative backdrop-blur-lg bg-white/30 p-8 rounded-2xl shadow-lg w-full max-w-md border border-white/20">
      {/* Glassmorphism inner glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Apakah anda Merokok?</h2>
        <div className="space-y-4">
          {['TIDAK', 'PASIF', 'AKTIF', 'AKUT'].map((option) => (
            <button
              key={option}
              onClick={() => onSubmit(option as SmokingStatus)}
              className="w-full p-4 text-left rounded-xl transition-all duration-300
                        backdrop-blur-md bg-white/20 border border-white/20
                        hover:bg-white/30 hover:shadow-lg hover:scale-[1.02]
                        active:scale-[0.98] text-gray-800 font-medium"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BackgroundScene = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400">
      {/* Abstract shapes for background interest */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-pink-500/30 blur-3xl" />
    </div>
  );
};

export default function Home() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (status: SmokingStatus) => {
    if (!db) return;

    try {
      const docRef = await addDoc(collection(db, "quiz-responses"), {
        status,
        timestamp: new Date(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundScene />
      
      <main className="relative z-10 container mx-auto h-screen">
        <div className="grid grid-cols-3 h-full">
          <div className="flex items-center justify-center">
            <Avatar />
          </div>
          
          <div className="col-span-2 flex items-center justify-center">
            {!submitted ? (
              <QuizBox onSubmit={handleSubmit} />
            ) : (
              <div className="backdrop-blur-lg bg-white/30 p-6 rounded-2xl shadow-lg 
                            border border-white/20 relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent opacity-50" />
                <h2 className="relative text-xl text-gray-800">Terima kasih atas respons Anda!</h2>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}