"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';

// Quiz questions data
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Apakah anda Merokok?",
    options: ['TIDAK', 'PASIF', 'AKTIF', 'AKUT']
  },
  {
    id: 2,
    question: "Question 2",
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
  },
  {
    id: 3,
    question: "Question 3",
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
  },
  {
    id: 4,
    question: "Question 4",
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
  },
  {
    id: 5,
    question: "Question 5",
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
  },
  {
    id: 6,
    question: "Question 6",
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
  }
];

const VideoAvatar = ({ videoName }: { videoName: string }) => {
  return (
    <motion.div 
      className="w-64 h-64 rounded-full overflow-hidden"
      animate={{ 
        y: [0, -20, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <video 
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={`/${videoName}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </motion.div>
  );
};

const QuizBox = ({ 
  question, 
  options, 
  onSubmit,
  direction
}: { 
  question: string;
  options: string[];
  onSubmit: (answer: string) => void;
  direction: number;
}) => {
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <motion.div
      className="relative backdrop-blur-lg bg-white/30 p-8 rounded-2xl shadow-lg w-full max-w-md border border-white/20"
      initial="enter"
      animate="center"
      exit="exit"
      variants={slideVariants}
      custom={direction}
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{question}</h2>
        <div className="space-y-4">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => onSubmit(option)}
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
    </motion.div>
  );
};

const BackgroundScene = ({ currentPage }: { currentPage: number }) => {
  return (
    <motion.div 
      className="fixed inset-0"
      animate={{
        backgroundColor: [
          'rgba(147, 51, 234, 0.5)',  // purple
          'rgba(236, 72, 153, 0.5)',   // pink
          'rgba(96, 165, 250, 0.5)'    // blue
        ][currentPage % 3]
      }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0">
        <video 
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 bg-black/20" />
    </motion.div>
  );
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = async (answer: string) => {
    const newAnswers = { ...answers, [currentPage]: answer };
    setAnswers(newAnswers);

    if (currentPage < QUIZ_QUESTIONS.length - 1) {
      setDirection(1);
      setCurrentPage(prev => prev + 1);
    } else {
      try {
        await addDoc(collection(db, "quiz-responses"), {
          answers: newAnswers,
          timestamp: new Date(),
        });
        setSubmitted(true);
      } catch (error) {
        console.error("Error submitting response:", error);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundScene currentPage={currentPage} />
      
      <main className="relative z-10 container mx-auto h-screen">
        <div className="grid grid-cols-3 h-full">
          <div className="flex items-center justify-center">
            <VideoAvatar videoName="avatar.mp4" />
          </div>
          
          <div className="col-span-2 flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              {!submitted ? (
                <QuizBox
                  key={currentPage}
                  question={QUIZ_QUESTIONS[currentPage].question}
                  options={QUIZ_QUESTIONS[currentPage].options}
                  onSubmit={handleAnswer}
                  direction={direction}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="backdrop-blur-lg bg-white/30 p-6 rounded-2xl shadow-lg 
                            border border-white/20 relative"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent opacity-50" />
                  <h2 className="relative text-xl text-gray-800">Terima kasih atas respons Anda!</h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}