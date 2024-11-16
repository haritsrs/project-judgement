"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';

// Color theme configuration
const THEME = {
  selectedButton: 'bg-blue-500/50', // Easily change the selected button color here
  hoverButton: 'bg-white/30',
  defaultButton: 'bg-white/20',
  timer: {
    background: 'bg-white/30',
    text: 'text-gray-800',
    bar: {
      background: 'bg-gray-200/30',
      fill: 'bg-blue-500' // Progress bar color
    }
  }
};

// Quiz questions data remains the same
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Rate tingkat kepercayaan diri mu!",
    options: ['0%', '25%', '50%', '75%', '100%']
  },
  {
    id: 2,
    question: "Berapa total mantan",
    options: ['0', '1-3', '4-10', '10+']
  },
  {
    id: 3,
    question: "Apakah anda perokok?",
    options: ['Nggak', 'Pasif', 'Aktif', 'Akut']
  },
  {
    id: 4,
    question: "Apakah anda peminum alkohol?",
    options: ['Nggak Pernah', 'Pernah Aja', 'Aktif', 'Akut']
  },
  {
    id: 5,
    question: "Pilih salah satu",
    options: ['Baggy Outfit', 'Jaket Kupluk', 'Kaos Oblong', ' Skinny Jeans', 'Jaket Kulit']
  },
  {
    id: 6,
    question: "Berapa followers instagram mu?",
    options: ['<200', '200-900', '900-3000', '3000+']
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

const Timer = ({ timeLeft }: { timeLeft: number }) => {
  const progress = (timeLeft / 10) * 100;

  return (
    <motion.div 
      className={`absolute top-4 left-1/2 -translate-x-1/2 ${THEME.timer.background} backdrop-blur-md px-6 py-3 rounded-full border border-white/20`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="relative flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className={`text-2xl font-bold ${THEME.timer.text}`}>{timeLeft}</span>
        </div>
        
        {/* Progress bar container */}
        <div className={`w-32 h-2 rounded-full ${THEME.timer.bar.background}`}>
          <motion.div 
            className={`h-full rounded-full ${THEME.timer.bar.fill}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const QuizBox = ({ 
  question, 
  options,
  selectedAnswer,
  onSelect,
  direction
}: { 
  question: string;
  options: string[];
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
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
            <motion.button
              key={option}
              onClick={() => onSelect(option)}
              className={`w-full p-4 text-left rounded-xl transition-all duration-300
                        backdrop-blur-md border border-white/20
                        hover:${THEME.hoverButton} hover:shadow-lg hover:scale-[1.02]
                        active:scale-[0.98] text-gray-800 font-medium
                        ${selectedAnswer === option ? THEME.selectedButton : THEME.defaultButton}`}
              whileTap={{ scale: 0.98 }}
              animate={{
                backgroundColor: selectedAnswer === option ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)'
              }}
              transition={{ duration: 0.2 }}
            >
              {option}
            </motion.button>
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
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPage, submitted]);

  const handleNextQuestion = async () => {
    const newAnswers = { ...answers, [currentPage]: selectedAnswer || 'No answer' };
    setAnswers(newAnswers);

    // Check if we're at the last question (index 5 for 6 questions)
    if (currentPage < QUIZ_QUESTIONS.length - 1) {
      setDirection(1);
      setCurrentPage(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(10);
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

  const handleSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  // Debugging log to check current page and total questions
  console.log('Current page:', currentPage, 'Total questions:', QUIZ_QUESTIONS.length);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundScene currentPage={currentPage} />
      
      <main className="relative z-10 container mx-auto h-screen">
        {!submitted && <Timer timeLeft={timeLeft} />}
        
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
                  selectedAnswer={selectedAnswer}
                  onSelect={handleSelect}
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