"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Color theme configuration
const THEME = {
  selectedButton: 'bg-blue-500/50',
  hoverButton: 'bg-white/30',
  defaultButton: 'bg-white/20',
  timer: {
    background: 'bg-white/30',
    text: 'text-gray-800',
    bar: {
      background: 'bg-gray-200/30',
      fill: 'bg-blue-500'
    }
  }
};

const INITIAL_SCORES = {
  "NR": 0,  // Nerd
  "WB": 0,  // Wibu
  "SB": 0,  // Softboy
  "JM": 0,  // Jamet
  "SN": 0,  // Skena
  "BB": 0,  // Badboy
  "SR": 0   // Starboy
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

const QUIZ_SCORING = [
  {
    id: 1,
    options: [
      { value: '0%', scores: { NR: 4, WB: 3 } },
      { value: '25%', scores: { WB: 3, NR: 3, SB: 1, JM: 1 } },
      { value: '50%', scores: { SB: 3, JM: 2, BB: 1, WB: 1 } },
      { value: '75%', scores: { SB: 4, BB: 4, JM: 3, SR: 2 } },
      { value: '100%', scores: { SN: 5, SR: 5, BB: 4, JM: 4, SB: 3 } }
    ]
  },
  {
    id: 2,
    options: [
      { value: '0', scores: { NR: 3, WB: 2, SB: 1 } },
      { value: '1-3', scores: { SB: 3, SN: 2, NR: 1, WB: 1 } },
      { value: '4-10', scores: { SN: 3, BB: 2, JM: 2, SR: 2 } },
      { value: '10+', scores: { BB: 4, SR: 3, JM: 3, SN: 2 } }
    ]
  },
  {
    id: 3,
    options: [
      { value: 'Nggak', scores: { NR: 3, WB: 3, SB: 2 } },
      { value: 'Pasif', scores: { SB: 3, WB: 2, NR: 1 } },
      { value: 'Aktif', scores: { BB: 4, SR: 3, SN: 3, JM: 3, SB: 1 } },
      { value: 'Akut', scores: { JM: 4, BB: 3, SN: 3, SR: 3 } }
    ]
  },
  {
    id: 4,
    options: [
      { value: 'Nggak Pernah', scores: { NR: 3, WB: 3, SB: 2, SN: 1 } },
      { value: 'Pernah Aja', scores: { SB: 3, SN: 2, NR: 1, WB: 1 } },
      { value: 'Aktif', scores: { BB: 3, JM: 3, SR: 3, SN: 2 } },
      { value: 'Akut', scores: { JM: 4, BB: 3, SR: 3, SN: 1 } }
    ]
  },
  {
    id: 5,
    options: [
      { value: 'Baggy Outfit', scores: { SN: 4, JM: 2, BB: 2 } },
      { value: 'Jaket Kupluk', scores: { WB: 5, NR: 2 } },
      { value: 'Kaos Oblong', scores: { NR: 3, WB: 2, JM: 1 } },
      { value: 'Skinny Jeans', scores: { JM: 5, BB: 2 } },
      { value: 'Jaket Kulit', scores: { BB: 4, SN: 3, JM: 2, SR: 1 } }
    ]
  },
  {
    id: 6,
    options: [
      { value: 'Kurang dari 200', scores: { NR: 3, WB: 3, JM: 3, SB: 2 } },
      { value: '200-900', scores: { SB: 4, JM: 2, NR: 1, WB: 1 } },
      { value: '900-3000', scores: { BB: 4, SB: 3, SN: 3, JM: 2 } },
      { value: '3000+', scores: { SR: 6, BB: 2, SN: 2, SB: 2 } }
    ]
  }
];

const findTopPersonalityType = (scores: Record<string, number>): string => {
  return Object.entries(scores)
    .reduce((a, b) => b[1] > a[1] ? b : a)[0]
    .toLowerCase();
};

const VideoPlayer = ({ src, onVideoEnd, onQuizStart, loop }: { 
  src: string; 
  onVideoEnd: () => void; 
  onQuizStart: () => void; 
  loop?: boolean; // Add loop prop
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const quizTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.play().catch(error => {
        console.error("Error playing video:", error);
        onVideoEnd();
      });

      // Set timer for quiz start at 13 seconds
      quizTimerRef.current = setTimeout(() => {
        onQuizStart();
      }, 13000);

      // Set the timeout to 32 seconds for video end
      timerRef.current = setTimeout(() => {
        onVideoEnd();
      }, 32000); // 32 seconds

      // Listen for the video ended event
      const handleEnded = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
        onVideoEnd();
      };

      videoElement.addEventListener('ended', handleEnded);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        if (quizTimerRef.current) {
          clearTimeout(quizTimerRef.current);
        }
        videoElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [onVideoEnd, onQuizStart]);

  return (
    <video 
      ref={videoRef}
      className="fixed inset-0 w-full h-full object-cover"
      muted
      playsInline
      loop={loop} // Set loop attribute based on the prop
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};

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
      <source src="/quisionerpt2.mp4" type="video/mp4" />
    </video>
  );
};

const LandingPage = ({ onStart }: { onStart: (name: string, phone: string, gender: string) => void }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  
  const isValid = useMemo(() => 
    name.length >= 2 && 
    phone.length >= 10 && 
    gender !== '', 
    [name, phone, gender]
  );
  
  const [showForm, setShowForm] = useState(false);

  const handleInitialStart = () => {
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onStart(name, phone, gender);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <VideoPlayer src="/lobby.mp4" onVideoEnd={() => { } } onQuizStart={function (): void {
        throw new Error('Function not implemented.');
      } } />

      <div className="absolute top-0 left-0 w-full h-full bg-black/50" />

      {!showForm && (
        <div 
          onClick={handleInitialStart}
          className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
        >
          <div className="text-white text-2xl font-bold 
            opacity-70 animate-pulse 
            transition-opacity duration-500"
          >
            Click Anywhere to Start
          </div>
        </div>
      )}

      {showForm && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-30 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="backdrop-blur-lg bg-white/30 p-8 rounded-2xl shadow-lg border border-white/20 w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Enter Your Details</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-800 mb-2 font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/20 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             placeholder-gray-500 text-gray-800"
                  placeholder="Enter your name"
                  minLength={2}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-800 mb-2 font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/20 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             placeholder-gray-500 text-gray-800"
                  placeholder="Enter your phone number"
                  minLength={10}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-800 mb-2 font-medium">Gender</label>
                <div className="flex space-x-4">
                  {['Male', 'Female'].map((genderOption) => (
                    <motion.button
                      key={genderOption}
                      type="button"
                      onClick={() => setGender(genderOption)}
                      className={`w-full p-4 rounded-xl transition-all duration-300
                        backdrop-blur-md border border-white/20
                        hover:${THEME.hoverButton} hover:shadow-lg hover:scale-[1.02]
                        active:scale-[0.98] text-gray-800 font-medium
                        ${gender === genderOption ? THEME.selectedButton : THEME.defaultButton}`}
                      whileTap={{ scale: 0.98 }}
                      animate={{
                        backgroundColor: gender === genderOption ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {genderOption}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                className={`w-full py-4 rounded-xl font-semibold text-white
                            transition-all duration-300 ${isValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'}`}
                whileHover={isValid ? { scale: 1.02 } : {}}
                whileTap={isValid ? { scale: 0.98 } : {}}
                disabled={!isValid}
              >
                Start Quiz
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
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

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  isVisible: boolean;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime, isVisible }) => {
  if (!isVisible) return null;

  const progress = (timeLeft / totalTime) * 100;

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

const calculateScores = (answers: Record<number, string>) => {
  return QUIZ_QUESTIONS.reduce((scores, question, index) => {
    const selectedAnswer = answers[index];
    const selectedOption = QUIZ_SCORING[index].options.find(opt => opt.value === selectedAnswer);
    
    if (selectedOption) {
      Object.entries(selectedOption.scores).forEach(([category, points]) => {
        scores[category as keyof typeof INITIAL_SCORES] += points;
      });
    }
    return scores;
  }, { ...INITIAL_SCORES });
};

const QuizContent = ({ 
  userData, 
  currentQuestionIndex, 
  timeLeft, 
  selectedAnswer, 
  onAnswerSelect, 
  onNextQuestion, 
  quizState, 
  finalScores,
  answers 
}: {
  userData: { name: string; phone: string };
  currentQuestionIndex: number;
  timeLeft: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  onNextQuestion: () => void;
  quizState: 'notStarted' | 'inProgress' | 'submitted';
  finalScores: Record<string, number>;
  answers: Record<number, string>;
}) => {
  const router = useRouter();

  if (quizState === 'submitted') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <h2 className="text-2xl font-bold text-gray-800">Quiz Results!</h2>
          <div className="bg-white/30 backdrop-blur-md p-6 rounded-xl border border-white/20">
            <h3 className="text-xl font-semibold mb-4">Your Personality Scores:</h3>
            {Object.entries(finalScores).map(([category, score]) => (
              <div key={category} className="flex justify-between mb-2">
                <span>{category}</span>
                <span>{score}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/results')}
            className="px-8 py-4 bg-white/30 backdrop-blur-md rounded-xl
                       text-gray-800 font-semibold border border-white/20
                       hover:bg-white/40 transition-all duration-300"
          >
            Lihat Detail Hasil
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundScene currentPage={currentQuestionIndex} />
      
      <main className="relative z-10 container mx-auto h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <Timer 
            timeLeft={timeLeft}
            totalTime={10}
            isVisible={quizState === 'inProgress'}
          />
          
          <div className="relative w-full">
            <motion.div 
              className="absolute -top-4 left-0 w-full h-1 bg-gray-200/30 rounded-full overflow-hidden"
            >
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            <AnimatePresence mode="wait">
              <QuizBox
                key={currentQuestionIndex}
                question={QUIZ_QUESTIONS[currentQuestionIndex].question}
                options={QUIZ_QUESTIONS[currentQuestionIndex].options}
                selectedAnswer={selectedAnswer}
                onSelect={onAnswerSelect}
                direction={1}
              />
            </AnimatePresence>

            {selectedAnswer && (
              <motion.button
                onClick={onNextQuestion}
                className="mt-4 w-full py-4 bg-blue-500 text-white rounded-xl 
                           hover:bg-blue-600 transition-all duration-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </motion.button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(50);
  const [quizState, setQuizState] = useState<'notStarted' | 'videoIntro' | 'quizVideo' | 'inProgress' | 'submitted'>('notStarted');
  const [finalScores, setFinalScores] = useState(INITIAL_SCORES);
  const [userData, setUserData] = useState({ name: '', phone: '', gender: '' });
  const [canPlayVideo, setCanPlayVideo] = useState(false);
  
  const handleStart = (name: string, phone: string, gender: string) => {
    if (!name || !phone || !gender) {
      alert('Please enter name, phone number, and select gender');
      return;
    }
  
    setUserData({ name, phone, gender }); // Add gender to userData
    setQuizState('videoIntro');
    setTimeLeft(50);
    setCanPlayVideo(true);
  };

  const handlePembukaVideoEnd = () => {
    setQuizState('quizVideo');
  };

  const handleQuizStart = () => {
    setQuizState('inProgress');
    setTimeLeft(10);
  };

  const handleQuisisionerVideoEnd = () => {
    setQuizState('inProgress');
    setTimeLeft(10);
  };

  const proceedToNextQuestion = () => {
    if (!answers[currentQuestionIndex]) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer || 'No answer'
      }));
    }

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(10);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    try {
      const completeAnswers = {
        ...answers,
        [currentQuestionIndex]: selectedAnswer || 'No answer'
      };
  
      const calculatedScores = calculateScores(completeAnswers);
      setFinalScores(calculatedScores);
  
      // Determine the top personality type
      const topPersonalityType = findTopPersonalityType(calculatedScores).toUpperCase();
  
      await addDoc(collection(db, "quiz-responses"), {
        name: userData.name,
        phone: userData.phone,
        gender: userData.gender,
        answers: completeAnswers,
        scores: calculatedScores,
        personalityType: topPersonalityType,
        timestamp: new Date(),
      });
  
      // Route based on personality type and gender
      const personalityRoutes: Record<string, Record<string, string>> = {
        'NR': { 'Male': '/results/nr/l', 'Female': '/results/nr/p' },
        'WB': { 'Male': '/results/wb/l', 'Female': '/results/wb/p' },
        'SB': { 'Male': '/results/sb/l', 'Female': '/results/sb/p' },
        'JM': { 'Male': '/results/jm/l', 'Female': '/results/jm/p' },
        'SN': { 'Male': '/results/sn/l', 'Female': '/results/sn/p' },
        'BB': { 'Male': '/results/bb/l', 'Female': '/results/bb/p' },
        'SR': { 'Male': '/results/sr/l', 'Female': '/results/sr/p' }
      };
  
      // Get the specific route based on personality type and gender
      const route = personalityRoutes[topPersonalityType]?.[userData.gender] || '/results';
  
      // Navigate to the specific results page
      router.push(route);
  
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (quizState === 'videoIntro' || quizState === 'inProgress') {
      timerId = setInterval(() => {
        setTimeLeft(currentTime => {
          if (currentTime <= 1) {
            if (quizState === 'videoIntro') {
              setQuizState('inProgress');
              return 10;
            } else if (quizState === 'inProgress') {
              proceedToNextQuestion();
              return 10;
            }
          }
          return currentTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [quizState]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

 
  return (
    <div className="min-h-screen relative overflow-hidden">
      {quizState === 'notStarted' ? (
        <LandingPage onStart={handleStart} />
      ) : (
        <>
          {quizState === 'videoIntro' && (
            <VideoPlayer 
              src="/pembuka.mp4" 
              onVideoEnd={handlePembukaVideoEnd}
              onQuizStart={() => {}} // No-op for pembuka video
            />
          )}
          
          {quizState === 'quizVideo' && (
            <VideoPlayer 
              src="/quisionerpt1.mp4" 
              onVideoEnd={handleQuisisionerVideoEnd}
              onQuizStart={handleQuizStart}
            />
          )}
          
          {quizState === 'inProgress' && (
            <>
              <VideoPlayer 
                src="/quisionerpt2.mp4" // Replace with your actual in-progress video source
                onVideoEnd={() => {}} // No-op for in-progress video
                onQuizStart={() => {}} // No-op for in-progress video
                loop={true} // Set loop to true
              />
              <QuizContent
                userData={userData}
                currentQuestionIndex={currentQuestionIndex}
                timeLeft={timeLeft}
                selectedAnswer={selectedAnswer}
                onAnswerSelect={handleAnswerSelect}
                onNextQuestion={proceedToNextQuestion}
                quizState={quizState}
                finalScores={finalScores}
                answers={answers}
              />
            </>
          )}
          
          {quizState === 'submitted' && (
            <QuizContent
              userData={userData}
              currentQuestionIndex={currentQuestionIndex}
              timeLeft={timeLeft}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
              onNextQuestion={proceedToNextQuestion}
              quizState={quizState}
              finalScores={finalScores}
              answers={answers}
            />
          )}
        </>
      )}
    </div>
  );
}