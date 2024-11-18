"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

// Typescript type for quiz response
interface QuizResponse {
  name: string;
  phone: string;
  scores: {
    NR: number;
    WB: number;
    SB: number;
    JM: number;
    SN: number;
    BB: number;
    SR: number;
  };
  timestamp: Date;
}

// Define personality descriptions
const PERSONALITY_DESCRIPTIONS = {
  "NR": {
    title: "Nerd 🤓",
    description: "Kamu adalah tipe orang yang cerdas, fokus pada pengetahuan dan akademis. Lebih suka buku dan teori daripada keramaian sosial."
  },
  "WB": {
    title: "Wibu 🍜",
    description: "Pecinta budaya Jepang yang passionate. Hidupmu dipenuhi anime, manga, dan semangat otaku yang kental."
  },
  "SB": {
    title: "Softboy 💕",
    description: "Sensitif, empatik, dan penuh perhatian. Kamu memiliki sisi lembut yang membuat orang nyaman di sekitarmu."
  },
  "JM": {
    title: "Jamet 😎",
    description: "Penuh semangat dan energi. Kamu adalah tipe yang bebas, suka tantangan, dan tidak mudah diatur."
  },
  "SN": {
    title: "Skena 🎸",
    description: "Artistic dan keren. Kamu mengikuti tren terbaru dan memiliki gaya yang unik."
  },
  "BB": {
    title: "Badboy 🖤",
    description: "Misterius, berani, dan tidak peduli dengan pendapat orang. Kamu memiliki sikap yang tough dan menawan."
  },
  "SR": {
    title: "Starboy ✨",
    description: "Percaya diri tinggi, charming, dan selalu menjadi pusat perhatian. Kamu adalah bintang sejati."
  }
};

export default function ResultsPage() {
  const router = useRouter();
  const [latestResult, setLatestResult] = useState<QuizResponse | null>(null);
  const [dominantPersonality, setDominantPersonality] = useState<keyof typeof PERSONALITY_DESCRIPTIONS | null>(null);

  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        // Query to get the most recent result, ordered by timestamp
        const q = query(
          collection(db, "quiz-responses"), 
          orderBy("timestamp", "desc"),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const mostRecentResult = querySnapshot.docs[0].data() as QuizResponse;
          setLatestResult(mostRecentResult);
          
          // Find dominant personality
          const scores = mostRecentResult.scores;
          const dominant = Object.entries(scores).reduce((a, b) => 
            a[1] > b[1] ? a : b
          )[0] as keyof typeof PERSONALITY_DESCRIPTIONS;
          
          setDominantPersonality(dominant);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };

    fetchLatestResult();
  }, []);

  if (!latestResult || !dominantPersonality) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500/50 to-blue-500/50">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-2xl font-bold text-gray-800"
        >
          Loading Results...
        </motion.div>
      </div>
    );
  }

  const personalityInfo = PERSONALITY_DESCRIPTIONS[dominantPersonality];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/50 to-blue-500/50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/30 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-xl border border-white/20"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Hasilmu</h1>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold">{personalityInfo.title}</h2>
          <p className="mt-4 text-gray-700">{personalityInfo.description}</p>
        </div>
  
        <div className="bg-white/20 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-2">Detail Skor:</h3>
          {Object.entries(latestResult.scores).map(([category, score]) => (
            <div key={category} className="flex justify-between mb-1">
              <span>
                {PERSONALITY_DESCRIPTIONS[
                  category as keyof typeof PERSONALITY_DESCRIPTIONS
                ].title}
              </span>
              <span>{score}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-blue-500/50 backdrop-blur-md rounded-xl text-white font-semibold"
            onClick={() => router.push('/')}
          >
            Ulang Quiz
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-white/30 backdrop-blur-md rounded-xl text-gray-800 font-semibold"
            onClick={() => {
              // Share functionality can be implemented here
              alert('Fitur share coming soon!');
            }}
          >
            Bagikan Hasil
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}