"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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

const BackgroundVideo = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <video 
      className="w-full h-full object-cover"
      autoPlay
      loop
      muted
      playsInline
    >
      <source src="/background.mp4" type="video/mp4" />
    </video>
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
        <BackgroundVideo />
      </div>
      <div className="absolute inset-0 bg-black/20" />
    </motion.div>
  );
};

const VideoAvatar = ({ videoName }: { videoName: string }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

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

export default function Home() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  // Timer Effect
  useEffect(() => {
    if (isSubmitted || isPaused || isInitialLoading) return; // Add isInitialLoading check
  
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleNextQuestion();
          return 10;
        }
        return prevTime - 1;
      });
    }, 1000);
  
    return () => clearInterval(timerInterval);
  }, [currentQuestionIndex, isSubmitted, isPaused, isInitialLoading]); // Add isInitialLoading to dependencies

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  // Handle moving to next question
  const handleNextQuestion = async () => {
    setIsPaused(true); // Pause timer during transition

    // Save current answer if none selected
    if (!answers[currentQuestionIndex]) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer || 'No answer'
      }));
    }

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(10);
      
      // Resume timer after a short delay
      setTimeout(() => {
        setIsPaused(false);
      }, 500);
    } else {
      // Submit quiz
      try {
        await addDoc(collection(db, "quiz-responses"), {
          answers: {
            ...answers,
            [currentQuestionIndex]: selectedAnswer || 'No answer'
          },
          timestamp: new Date(),
        });
        setIsSubmitted(true);
        setTimeout(() => setShowResults(true), 2000);
      } catch (error) {
        console.error("Error submitting response:", error);
        setIsPaused(false);
      }
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-500/50 to-blue-500/50" />;
  }

  const progress = ((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundScene currentPage={currentQuestionIndex} />
      
      {/* Only show content after initial loading */}
      {!isInitialLoading && (
        <>
          {/* Timer */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <Timer 
              timeLeft={timeLeft} 
              totalTime={10}
              isVisible={!isSubmitted && !isPaused}
            />
          </div>
          
          <main className="relative z-10 container mx-auto h-screen">
            <div className="grid grid-cols-3 h-full">
              <div className="flex items-center justify-center">
                <VideoAvatar videoName="avatar.mp4" />
              </div>
              
              <div className="col-span-2 flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  {/* Progress Bar */}
                  <motion.div 
                    className="absolute -top-4 left-0 w-full h-1 bg-gray-200/30 rounded-full overflow-hidden"
                  >
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  {/* Question Display */}
                  <AnimatePresence mode="wait">
                    {!isSubmitted && (
                      <QuizBox
                        key={currentQuestionIndex}
                        question={QUIZ_QUESTIONS[currentQuestionIndex].question}
                        options={QUIZ_QUESTIONS[currentQuestionIndex].options}
                        selectedAnswer={selectedAnswer}
                        onSelect={handleAnswerSelect}
                        direction={1}
                      />
                    )}

                    {showResults && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center gap-4"
                      >
                        <h2 className="text-2xl font-bold text-gray-800">Quiz Completed!</h2>
                        <button
                          onClick={() => router.push('/results')}
                          className="px-8 py-4 bg-white/30 backdrop-blur-md rounded-xl
                                   text-gray-800 font-semibold border border-white/20
                                   hover:bg-white/40 transition-all duration-300"
                        >
                          View Results
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Manual Next Button (Optional) */}
                  {!isSubmitted && selectedAnswer && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg w-full"
                      onClick={handleNextQuestion}
                    >
                      pencet ini klo males nunggu akwoakwoka (buat testing)
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}